import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { City } from "@/data/weatherData"

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get request data
    const { city, feature, date } = await request.json()

    // Validate input
    if (!city || !feature || !date) {
      return NextResponse.json(
        { error: "City, feature, and date are required" },
        { status: 400 }
      )
    }

    // Validate city
    const validCities = ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta"]
    if (!validCities.includes(city)) {
      return NextResponse.json(
        { error: "Invalid city" },
        { status: 400 }
      )
    }

    // Validate feature
    const validFeatures = ["temperature_max", "temperature_min", "precipitation", "wind_speed"]
    if (!validFeatures.includes(feature)) {
      return NextResponse.json(
        { error: "Invalid feature" },
        { status: 400 }
      )
    }

    // Validate date is from 2025 onwards
    const predictionDate = new Date(date)
    const minDate = new Date("2025-01-01T00:00:00Z")

    if (Number.isNaN(predictionDate.getTime()) || predictionDate < minDate) {
      return NextResponse.json(
        { error: "Date must be from 2025 onwards" },
        { status: 400 }
      )
    }

    let result;
    try {
      const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:8000"
      const mlResponse = await fetch(`${mlServiceUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, feature, date })
      })

      if (mlResponse.ok) {
        result = await mlResponse.json()
      } else {
        console.warn("ML service returned error, using mock fallback")
      }
    } catch (e) {
      console.warn("ML service unavailable, using mock fallback", e)
    }

    // Mock data fallback if ML service failed or was unavailable
    if (!result) {
      const { CITY_DATA } = await import("@/data/weatherData")
      const cityInfo = CITY_DATA[city as City]
      
      // Basic mock logic based on existing city data
      const baseValue = feature.includes("temperature") 
        ? (feature.includes("max") ? cityInfo.temp + 2 : cityInfo.temp - 4)
        : (feature.includes("precipitation") ? cityInfo.rainChance / 10 : parseFloat(cityInfo.wind))
      
      const variance = (Math.random() * 4) - 2 // +/- 2 units of variance
      const mockBaseline = baseValue + variance
      const mockCorrection = (Math.random() * 2) - 1 // RL correction between -1 and 1
      
      result = {
        baseline_prediction: mockBaseline.toFixed(2),
        rl_correction: mockCorrection.toFixed(2),
        final_prediction: (mockBaseline + mockCorrection).toFixed(2)
      }
    }

    const baselineTemp = Number(result.baseline_prediction)
    const rlCorrection = Number(result.rl_correction)
    const rlCorrectedTemp = Number(result.final_prediction)
    const correctionMagnitude = Math.abs(rlCorrection)
    const confidence = Number(Math.max(50, 95 - Math.min(correctionMagnitude * 5, 40)).toFixed(1))

    // -- AI Advice Generator (LLM style) --
    const getAdvice = (city: string, feature: string, val: number): string => {
      const isTemp = feature.includes("temperature")
      const isMax = feature.includes("max")
      const isRain = feature.includes("precipitation")
      const isWind = feature.includes("wind")

      if (isTemp) {
        if (val > 40) return `🔥 It's scorching in ${city}! You're essentially a human rotisserie chicken right now. Stay hydrated and avoid the sun like it's your ex.`
        if (val > 32) return `☀️ It's pretty toasty. Remember: sunglasses are for style, but sunscreen is for survival. Don't be a lobster!`
        if (val < 15) return `❄️ Brrr! ${city} is feeling like a freezer. Time to layer up like an onion or just stay in bed until further notice.`
        if (val < 25) return `🌤️ Perfect weather, actually! Not too hot, not too cold. Basically, the universe is giving you a high-five today.`
      }
      
      if (isRain) {
        if (val > 5) return `☔ Grab an umbrella or a small boat! ${city} is about to get a free car wash from the sky. Don't forget your raincoat!`
        if (val > 0) return `🌦️ Just a light drizzle! Enough to ruin a good hair day, but not enough to cancel plans. Maybe just wear a hat?`
      }
      
      if (isWind) {
        if (val > 30) return `💨 Hold onto your hat (and your small pets)! It's windy enough to fly a kite... or a small child. Stay safe!`
      }

      return `✨ Mosam AI says: Looking good! Enjoy your day in ${city} and remember to be awesome.`
    }

    const advice = getAdvice(city as string, feature, rlCorrectedTemp)

    return NextResponse.json({
      city,
      feature,
      date,
      baselineTemp,
      rlCorrection,
      rlCorrectedTemp,
      confidence,
      advice,
      modelVersion: `${city.toLowerCase()}_${feature}_mock`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}