"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

type SystemSettings = {
  allowUserRegistration: boolean
  maxPredictionsPerDay: number
  maintenanceMode: boolean
  systemMessage: string
}

export default function AdminSettings() {
  const { data: session, status } = useSession()

  if (status === "unauthenticated") {
    redirect("/login")
  }

  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    redirect("/user/dashboard")
  }

  const [settings, setSettings] = useState<SystemSettings>({
    allowUserRegistration: true,
    maxPredictionsPerDay: 10,
    maintenanceMode: false,
    systemMessage: ""
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Mock loading settings - in real app, fetch from API
    setSettings({
      allowUserRegistration: true,
      maxPredictionsPerDay: 10,
      maintenanceMode: false,
      systemMessage: ""
    })
    setIsLoading(false)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setMessage("")

    try {
      // Mock API call - in real app, save to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage("Settings saved successfully!")
    } catch (error) {
      setMessage("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Admin Settings
          </h1>
          <p className="text-gray-600">Manage system-wide settings and controls</p>
        </div>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded ${
            message.includes("success") 
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* User Registration */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">User Registration</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700">Allow new user registrations</p>
                <p className="text-sm text-gray-500">When disabled, new users cannot sign up</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowUserRegistration}
                  onChange={(e) => setSettings({...settings, allowUserRegistration: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Prediction Limits */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Prediction Limits</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum predictions per day per user
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.maxPredictionsPerDay}
                onChange={(e) => setSettings({...settings, maxPredictionsPerDay: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Limit the number of predictions a user can make in a 24-hour period</p>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Maintenance Mode</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700">Enable maintenance mode</p>
                  <p className="text-sm text-gray-500">When enabled, users cannot make predictions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {settings.maintenanceMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maintenance message (shown to users)
                  </label>
                  <textarea
                    value={settings.systemMessage}
                    onChange={(e) => setSettings({...settings, systemMessage: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="System is under maintenance. Please try again later."
                  />
                </div>
              )}
            </div>
          </div>

          {/* System Statistics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">System Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Database Status</div>
                <div className="text-lg font-bold text-green-600">Healthy</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">API Response Time</div>
                <div className="text-lg font-bold text-blue-600">125ms</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">ML Service Status</div>
                <div className="text-lg font-bold text-green-600">Operational</div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
