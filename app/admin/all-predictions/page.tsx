"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

type Prediction = {
  id: string
  city: string
  predictionDate: string
  baselineTemp?: number
  rlCorrectedTemp?: number
  confidenceScore?: number
  confidence?: number
  feature?: string
  predictedValue?: number
  predictionValue?: number
  createdAt: string
  user: {
    name: string | null
    email: string
  }
  modelVersion?: string
}

export default function AdminAllPredictions() {
  const { data: session, status } = useSession()

  if (status === "unauthenticated") {
    redirect("/login")
  }

  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    redirect("/user/dashboard")
  }

  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedCity, setSelectedCity] = useState("all")

  const cities = ["all", "Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta"]
  const features = ["temperature_min", "temperature_max", "wind_speed", "precipitation"]
  const featureLabels: { [key: string]: string } = {
    temperature_min: "Temp Min",
    temperature_max: "Temp Max",
    wind_speed: "Wind",
    precipitation: "Precipitation"
  }
  const featureUnits: { [key: string]: string } = {
    temperature_min: "°C",
    temperature_max: "°C",
    wind_speed: "km/h",
    precipitation: "mm"
  }

  useEffect(() => {
    fetchPredictions()
  }, [selectedCity])

  const fetchPredictions = async () => {
    setIsLoading(true)
    setError("")

    try {
      const url = selectedCity === "all"
        ? "/api/admin/all-predictions"
        : `/api/admin/all-predictions?city=${selectedCity}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch predictions")
      }

      const data = await response.json()
      setPredictions(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })

  const getFeatureKey = (prediction: Prediction) => {
    if (prediction.feature) return prediction.feature
    const modelVersion = prediction.modelVersion || ""
    const match = features.find((item) => modelVersion.includes(item))
    return match || ""
  }

  const getPredictedValue = (prediction: Prediction) => {
    return (
      prediction.predictedValue ??
      prediction.predictionValue ??
      prediction.rlCorrectedTemp ??
      prediction.baselineTemp ??
      null
    )
  }

  const getConfidenceValue = (prediction: Prediction) => {
    return prediction.confidenceScore ?? prediction.confidence ?? null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            All Predictions
          </h1>
          <p className="text-gray-600">
            System-wide view of all user predictions
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Filter by City:
            </label>
            <select
              value={selectedCity}
              onChange={event => setSelectedCity(event.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {cities.map(city => (
                <option key={city} value={city}>
                  {city === "all" ? "All Cities" : city}
                </option>
              ))}
            </select>

            <button
              onClick={fetchPredictions}
              className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading predictions...</p>
          </div>
        )}

        {!isLoading && predictions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      City
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      Prediction
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      Confidence
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {predictions.map(prediction => {
                    const featureKey = getFeatureKey(prediction)
                    const predictedValue = getPredictedValue(prediction)
                    const unit = featureUnits[featureKey] || ""
                    const label = featureLabels[featureKey] || "Predicted"

                    return (
                      <tr key={prediction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {prediction.user.name || prediction.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {prediction.city}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 w-fit">
                            {label}
                          </span>
                          {predictedValue !== null ? (
                            <span className="text-sm font-semibold text-gray-900">
                              {predictedValue}{unit}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 italic">
                              Not available
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getConfidenceValue(prediction) !== null
                            ? `${getConfidenceValue(prediction)}%`
                            : "-"
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(prediction.createdAt)}
                        </div>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isLoading && predictions.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Predictions Yet
            </h2>
            <p className="text-gray-600">
              No predictions found for the selected filter.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
