"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function UserDashboard() {
  const { data: session, status } = useSession()

  // Redirect if not logged in
  if (status === "unauthenticated") {
    redirect("/login")
  }

  // State management
  const [city, setCity] = useState("")
  const [date, setDate] = useState("")
  const [feature, setFeature] = useState("")
  const [prediction, setPrediction] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [savedMessage, setSavedMessage] = useState("")

  // List of cities
  const cities = ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta"]
  const features = ["temperature_max", "temperature_min", "precipitation", "wind_speed"]
  const featureLabels: { [key: string]: string } = {
    temperature_max: "Temperature Max",
    temperature_min: "Temperature Min",
    precipitation: "Precipitation",
    wind_speed: "Wind Speed",
  }
  const featureUnits: { [key: string]: string } = {
    temperature_max: "°C",
    temperature_min: "°C",
    precipitation: "mm",
    wind_speed: "km/h",
  }

  // Get minimum date (2025-01-01)
  const getMinDate = () => {
    return "2025-01-01"
  }

  // Handle prediction request
  const handlePredict = async () => {
    // Validation
    if (!city) {
      setError("Please select a city")
      return
    }
    if (!feature) {
      setError("Please select a feature")
      return
    }
    if (!date) {
      setError("Please select a date")
      return
    }

    setError("")
    setIsLoading(true)
    setSavedMessage("")

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ city, feature, date })
      })

      if (!response.ok) {
        throw new Error("Prediction failed")
      }

      const data = await response.json()
      setPrediction(data)

    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  // Save prediction to history
  const handleSavePrediction = async () => {
    if (!prediction) return

    setSavedMessage("")

    try {
      const response = await fetch("/api/predict/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          city,
          date,
          ...prediction
        })
      })

      if (!response.ok) {
        throw new Error("Failed to save prediction")
      }

      setSavedMessage("✓ Prediction saved to history!")

      // Clear message after 3 seconds
      setTimeout(() => setSavedMessage(""), 3000)

    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Weather Prediction Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, <span className="font-semibold">{session?.user?.name}</span>! 
            Get AI-powered weather predictions for Pakistani cities.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Left Column - Input Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Get Prediction
            </h2>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {/* City Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a city...</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Feature Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Feature
              </label>
              <select
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a feature...</option>
                {features.map((item) => (
                  <option key={item} value={item}>
                    {featureLabels[item]}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={getMinDate()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Select a date from 2025 onwards
              </p>
            </div>

            {/* Predict Button */}
            <button
              onClick={handlePredict}
              disabled={!city || !feature || !date || isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Predicting...
                </span>
              ) : (
                "Get Prediction"
              )}
            </button>
          </div>

          {/* Right Column - Results Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Prediction Results
            </h2>

            {/* No Prediction Yet */}
            {!prediction && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌤️</div>
                <p className="text-gray-500">
                  Select a city, feature, and date, then click "Get Prediction" to see results
                </p>
              </div>
            )}

            {/* Prediction Display */}
            {prediction && (
              <div className="space-y-6">
                {/* City & Date Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      <p className="text-lg font-semibold text-gray-800">{city}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Feature</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {featureLabels[feature] || feature}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Predictions */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Baseline Prediction */}
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">Baseline Model</p>
                    <p className="text-4xl font-bold text-gray-700">
                      {prediction.baselineTemp}{featureUnits[feature] || ""}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Before RL correction</p>
                  </div>

                  {/* RL Corrected Prediction */}
                  <div className="bg-green-50 rounded-lg p-6 text-center border-2 border-green-200">
                    <p className="text-sm text-green-700 mb-2 font-semibold">AI Corrected</p>
                    <p className="text-4xl font-bold text-green-600">
                      {prediction.rlCorrectedTemp}{featureUnits[feature] || ""}
                    </p>
                    <p className="text-xs text-green-600 mt-2">After RL correction</p>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Confidence Score</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {prediction.confidence}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${prediction.confidence}%` }}
                    ></div>
                  </div>
                </div>

                {/* Correction Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">RL Correction Applied</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {prediction.rlCorrection > 0 ? '+' : ''}{prediction.rlCorrection}
                    {featureUnits[feature] || ""}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {prediction.rlCorrection > 0 
                      ? "Model increased the value" 
                      : "Model decreased the value"
                    }
                  </p>
                </div>

                {/* AI Advice Card */}
                {prediction.advice && (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-xl transform transition hover:scale-[1.02] duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md border border-white/30 shadow-inner">
                        <span className="text-2xl block animate-bounce">🤖</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="text-xs font-bold opacity-90 tracking-widest uppercase">MOSAM AI INTELLIGENCE</p>
                          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        </div>
                        <p className="text-lg leading-relaxed font-medium italic">
                          "{prediction.advice}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <button
                  onClick={handleSavePrediction}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  💾 Save to History
                </button>

                {/* Success Message */}
                {savedMessage && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-center">
                    {savedMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            ℹ️ How It Works
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Baseline Model:</strong> Initial prediction from the Day 18 pipeline</li>
            <li>• <strong>AI Corrected:</strong> Prediction improved by the RL agent</li>
            <li>• <strong>Confidence Score:</strong> Estimated based on RL correction size</li>
            <li>• <strong>Save to History:</strong> Track accuracy by comparing with actual weather later</li>
          </ul>
        </div>
      </div>
    </div>
  )
}