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
  actualTemp?: number | null
  actualValue?: number | null
  accuracy: number | null
  createdAt: string
  modelVersion: string
}

export default function HistoryPage() {
  const { status } = useSession()

  if (status === "unauthenticated") {
    redirect("/login")
  }

  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedCity, setSelectedCity] = useState("all")
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

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
        ? "/api/predictions"
        : `/api/predictions?city=${selectedCity}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch predictions")
      }

      const data = await response.json()
      setPredictions(data)

    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!id) {
      alert("Prediction id is missing. Please refresh and try again.")
      return
    }

    if (!confirm("Are you sure you want to delete this prediction?")) {
      return
    }

    setDeleteLoading(id)

    try {
      const response = await fetch(`/api/predictions/${id}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (!response.ok) {
        let message = "Failed to delete prediction"
        try {
          const data = await response.json()
          if (data?.error) message = data.error
        } catch {
          // ignore parsing errors
        }
        throw new Error(message)
      }

      setPredictions(predictions.filter((p) => p.id !== id))

    } catch (err: any) {
      alert(err.message || "Failed to delete prediction")
    } finally {
      setDeleteLoading(null)
    }
  }

  const getAccuracyColor = (accuracy: number | null) => {
    if (accuracy === null) return "bg-gray-100 text-gray-800"
    if (accuracy >= 90) return "bg-green-100 text-green-800"
    if (accuracy >= 75) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

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

  const getActualValue = (prediction: Prediction) => {
    return prediction.actualValue ?? prediction.actualTemp ?? null
  }

  const getConfidenceValue = (prediction: Prediction) => {
    return prediction.confidenceScore ?? prediction.confidence ?? null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Prediction History
          </h1>
          <p className="text-gray-600">
            View and manage all your weather predictions
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Filter by City:
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {cities.map((city) => (
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading predictions...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && predictions.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Predictions Yet
            </h2>
            <p className="text-gray-600 mb-6">
              {selectedCity === "all"
                ? "You haven't made any predictions yet. Head to the dashboard to get started!"
                : `No predictions found for ${selectedCity}. Try a different city or make a new prediction.`
              }
            </p>
            <a
              href="/user/dashboard"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </a>
          </div>
        )}

        {/* Predictions Table */}
        {!isLoading && predictions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Predicted
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actual
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accuracy
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {predictions.map((prediction) => {
                    const featureKey = getFeatureKey(prediction)
                    const predictedValue = getPredictedValue(prediction)
                    const actualValue = getActualValue(prediction)
                    const unit = featureUnits[featureKey] || ""
                    const label = featureLabels[featureKey] || "Predicted"

                    return (
                      <tr key={prediction.id} className="hover:bg-gray-50">
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(prediction.predictionDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Saved: {formatDate(prediction.createdAt)}
                        </div>
                      </td>

                      {/* City */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {prediction.city}
                        </span>
                      </td>

                      {/* Predicted Value */}
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

                      {/* Actual Value */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {actualValue !== null ? (
                          <span className="text-sm font-semibold text-lg text-gray-900">
                            {actualValue}{unit}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Not available
                          </span>
                        )}
                      </td>

                      {/* Accuracy */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {prediction.accuracy !== null ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAccuracyColor(prediction.accuracy)}`}>
                            {prediction.accuracy.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Confidence */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getConfidenceValue(prediction) !== null
                            ? `${getConfidenceValue(prediction)}%`
                            : "-"
                          }
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(prediction.id)}
                          disabled={deleteLoading === prediction.id}
                          className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                        >
                          {deleteLoading === prediction.id ? (
                            "Deleting..."
                          ) : (
                            "🗑️ Delete"
                          )}
                        </button>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {!isLoading && predictions.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Total Predictions</div>
              <div className="text-3xl font-bold text-gray-800">
                {predictions.length}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Completed</div>
              <div className="text-3xl font-bold text-green-600">
                {predictions.filter((p) => getActualValue(p) !== null).length}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Pending</div>
              <div className="text-3xl font-bold text-yellow-600">
                {predictions.filter((p) => getActualValue(p) === null).length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}