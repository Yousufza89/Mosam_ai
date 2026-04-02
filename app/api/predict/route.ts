import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

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

    const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:8000"
    const mlResponse = await fetch(`${mlServiceUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, feature, date })
    })

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text()
      throw new Error(errorText || "ML service failed")
    }

    const result = await mlResponse.json()
    const baselineTemp = Number(result.baseline_prediction)
    const rlCorrection = Number(result.rl_correction)
    const rlCorrectedTemp = Number(result.final_prediction)
    const correctionMagnitude = Math.abs(rlCorrection)
    const confidence = Number(Math.max(50, 95 - Math.min(correctionMagnitude * 5, 40)).toFixed(1))

    return NextResponse.json({
      city,
      feature,
      date,
      baselineTemp,
      rlCorrection,
      rlCorrectedTemp,
      confidence,
      modelVersion: `${city.toLowerCase()}_${feature}`,
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