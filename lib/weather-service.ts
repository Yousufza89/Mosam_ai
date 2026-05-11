import { prisma } from "./prisma"

// Weather service to get actual weather data for accuracy calculation
export interface WeatherData {
  temperature: number
  humidity?: number
  windSpeed?: number
  precipitation?: number
}

export class WeatherService {
  private static readonly API_KEY = process.env.OPENWEATHER_API_KEY || "demo_key"
  private static readonly BASE_URL = "https://api.openweathermap.org/data/2.5"

  static async getActualWeather(city: string, date: string): Promise<WeatherData | null> {
    try {
      // For demo purposes, simulate actual weather data
      // In production, this would call real weather API
      const targetDate = new Date(date)
      const today = new Date()
      const daysDiff = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // If date is in the future, return null (no actual data yet)
      if (daysDiff > 0) {
        return null
      }

      // For past dates, simulate realistic weather data
      const baseTemp = {
        'Karachi': 28,
        'Lahore': 25,
        'Islamabad': 22,
        'Peshawar': 24,
        'Quetta': 18
      }

      const seasonalVariation = Math.sin((targetDate.getMonth() + 1) * Math.PI / 6) * 5
      const randomVariation = (Math.random() - 0.5) * 4

      return {
        temperature: (baseTemp[city] || 25) + seasonalVariation + randomVariation
      }

    } catch (error) {
      console.error("Weather service error:", error)
      return null
    }
  }

  static async updatePredictionAccuracy(predictionId: string): Promise<boolean> {
    try {
      const prediction = await prisma.prediction.findUnique({
        where: { id: predictionId }
      })

      if (!prediction || !prediction.city || !prediction.predictionDate) {
        return false
      }

      // Get actual weather data
      const actualWeather = await this.getActualWeather(
        prediction.city, 
        prediction.predictionDate.toISOString().split('T')[0]
      )

      if (!actualWeather) {
        return false // Can't calculate accuracy for future dates
      }

      // Calculate accuracy based on prediction type
      let predictedValue: number
      let actualValue: number

      switch (prediction.feature) {
        case 'temperature_min':
          predictedValue = prediction.rlCorrectedTemp
          actualValue = actualWeather.temperature - 2 // Min temp is usually lower
          break
        case 'temperature_max':
          predictedValue = prediction.rlCorrectedTemp
          actualValue = actualWeather.temperature + 2 // Max temp is usually higher
          break
        case 'wind_speed':
          predictedValue = prediction.rlCorrectedTemp
          actualValue = actualWeather.temperature * 0.1 // Rough wind speed calculation
          break
        case 'precipitation':
          predictedValue = prediction.rlCorrectedTemp
          actualValue = Math.random() * 10 // Simulated precipitation
          break
        default:
          predictedValue = prediction.rlCorrectedTemp
          actualValue = actualWeather.temperature
      }

      // Calculate accuracy percentage
      const difference = Math.abs(predictedValue - actualValue)
      const maxPossible = Math.max(Math.abs(predictedValue), Math.abs(actualValue))
      const accuracy = Math.max(0, Math.min(100, (1 - difference / maxPossible) * 100))

      // Update prediction with accuracy
      await prisma.prediction.update({
        where: { id: predictionId },
        data: {
          actualTemp: actualValue,
          accuracy: Math.round(accuracy)
        }
      })

      return true

    } catch (error) {
      console.error("Update accuracy error:", error)
      return false
    }
  }
}
