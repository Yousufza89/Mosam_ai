"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Sparkles, Brain, Settings, Key, TestTube, Save, CheckCircle2, AlertCircle } from "lucide-react"

interface LLMSettings {
  geminiApiKey: string
  claudeApiKey: string
  enableLLMMessages: boolean
  messageStyle: 'enthusiastic' | 'professional' | 'friendly' | 'technical'
  maxMessageLength: number
  includeSuggestions: boolean
  includeQuestions: boolean
  fallbackToTemplates: boolean
}

export default function LLMMSettings() {
  const { data: session, status } = useSession()

  if (status === "unauthenticated") {
    redirect("/login")
  }

  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    redirect("/user/dashboard")
  }

  const [settings, setSettings] = useState<LLMSettings>({
    geminiApiKey: '',
    claudeApiKey: '',
    enableLLMMessages: true,
    messageStyle: 'enthusiastic',
    maxMessageLength: 150,
    includeSuggestions: true,
    includeQuestions: true,
    fallbackToTemplates: true
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [message, setMessage] = useState("")
  const [testResult, setTestResult] = useState("")

  useEffect(() => {
    // Load settings from environment or database
    const loadSettings = async () => {
      try {
        // In a real app, fetch from API
        setSettings({
          geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
          claudeApiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY || '',
          enableLLMMessages: true,
          messageStyle: 'enthusiastic',
          maxMessageLength: 150,
          includeSuggestions: true,
          includeQuestions: true,
          fallbackToTemplates: true
        })
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setMessage("")

    try {
      // Mock API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage("Settings saved successfully!")
    } catch (error) {
      setMessage("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestAPI = async (provider: 'gemini' | 'claude') => {
    setIsTesting(true)
    setTestResult("")

    try {
      const response = await fetch('/api/admin/test-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          provider,
          apiKey: provider === 'gemini' ? settings.geminiApiKey : settings.claudeApiKey
        })
      })

      if (response.ok) {
        const result = await response.json()
        setTestResult(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API test successful! ✅`)
      } else {
        setTestResult(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API test failed ❌`)
      }
    } catch (error) {
      setTestResult(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API test failed: ${error}`)
    } finally {
      setIsTesting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading LLM settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            LLM Integration Settings
          </h1>
          <p className="text-gray-600">Configure AI-powered message generation for user predictions</p>
        </div>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded flex items-center gap-3 ${
            message.includes("success") 
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}>
            {message.includes("success") ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* API Keys Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" />
              API Keys
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gemini API Key (Google)
                </label>
                <div className="flex gap-3">
                  <input
                    type="password"
                    value={settings.geminiApiKey}
                    onChange={(e) => setSettings({...settings, geminiApiKey: e.target.value})}
                    placeholder="Enter your Gemini API key"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleTestAPI('gemini')}
                    disabled={isTesting || !settings.geminiApiKey}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    {isTesting ? 'Testing...' : 'Test'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Free tier available with generous limits. Get your key from Google AI Studio
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Claude API Key (Anthropic)
                </label>
                <div className="flex gap-3">
                  <input
                    type="password"
                    value={settings.claudeApiKey}
                    onChange={(e) => setSettings({...settings, claudeApiKey: e.target.value})}
                    placeholder="Enter your Claude API key"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleTestAPI('claude')}
                    disabled={isTesting || !settings.claudeApiKey}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    {isTesting ? 'Testing...' : 'Test'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Alternative to Gemini with different response style
                </p>
              </div>
            </div>

            {testResult && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                testResult.includes("successful") 
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}>
                {testResult}
              </div>
            )}
          </div>

          {/* Message Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Settings className="h-5 w-5 text-green-600" />
              Message Configuration
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700">Enable LLM Messages</p>
                  <p className="text-sm text-gray-500">Generate AI messages after predictions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableLLMMessages}
                    onChange={(e) => setSettings({...settings, enableLLMMessages: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Style
                </label>
                <select
                  value={settings.messageStyle}
                  onChange={(e) => setSettings({...settings, messageStyle: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="enthusiastic">Enthusiastic & Exciting</option>
                  <option value="professional">Professional & Informative</option>
                  <option value="friendly">Friendly & Casual</option>
                  <option value="technical">Technical & Detailed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Message Length (words)
                </label>
                <input
                  type="number"
                  min="50"
                  max="300"
                  value={settings.maxMessageLength}
                  onChange={(e) => setSettings({...settings, maxMessageLength: parseInt(e.target.value) || 150})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700">Include Suggestions</p>
                  <p className="text-sm text-gray-500">Suggest other cities to predict</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.includeSuggestions}
                    onChange={(e) => setSettings({...settings, includeSuggestions: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700">Include Questions</p>
                  <p className="text-sm text-gray-500">Ask engaging follow-up questions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.includeQuestions}
                    onChange={(e) => setSettings({...settings, includeQuestions: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700">Fallback to Templates</p>
                  <p className="text-sm text-gray-500">Use template messages if API fails</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.fallbackToTemplates}
                    onChange={(e) => setSettings({...settings, fallbackToTemplates: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Usage Statistics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Total Messages Generated</div>
                <div className="text-2xl font-bold text-gray-800">1,247</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">API Calls Today</div>
                <div className="text-2xl font-bold text-blue-600">42</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">User Engagement Rate</div>
                <div className="text-2xl font-bold text-green-600">87%</div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="h-5 w-5" />
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
