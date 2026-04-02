"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

type PerformanceData = {
  overview: {
    totalPredictions: number
    avgConfidence: number
    rlImprovement: string
    baselineRMSE: number
    rlRMSE: number
  }
  cityPerformance: Array<{
    city: string
    predictions: number
    avgConfidence: number
    accuracy: number
    avgBaseline: number
    avgRlCorrected: number
  }>
  weeklyAccuracy: Array<{
    week: string
    date: string
    predictions: number
    baselineAccuracy: number
    rlAccuracy: number
    avgConfidence: number
  }>
  confidenceDistribution: Array<{
    range: string
    count: number
  }>
}

export default function AdminPerformance() {
  const { data: session, status } = useSession()

  if (status === "unauthenticated") {
    redirect("/login")
  }

  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    redirect("/user/dashboard")
  }

  const [data, setData] = useState<PerformanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/performance")

      if (!response.ok) {
        throw new Error("Failed to fetch performance data")
      }

      const result = await response.json()
      setData(result)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Model Performance Analytics
          </h1>
          <p className="text-gray-600">
            Detailed analysis of ML model performance and RL improvements
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading performance data...</p>
          </div>
        )}

        {!isLoading && data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Total Predictions"
                value={data.overview.totalPredictions}
                subtitle="Analyzed"
                icon="📊"
                color="blue"
              />

              <MetricCard
                title="Avg Confidence"
                value={`${data.overview.avgConfidence.toFixed(1)}%`}
                subtitle="System-wide"
                icon="🎯"
                color="green"
              />

              <MetricCard
                title="RL Improvement"
                value={`${data.overview.rlImprovement}%`}
                subtitle="Over baseline"
                icon="📈"
                color="purple"
              />

              <MetricCard
                title="Current RMSE"
                value={data.overview.rlRMSE.toFixed(2)}
                subtitle={`Baseline: ${data.overview.baselineRMSE.toFixed(2)}`}
                icon="🎓"
                color="orange"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Accuracy Improvement Over Time
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Baseline vs RL-Corrected prediction accuracy
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.weeklyAccuracy}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis
                      label={{ value: "Accuracy (%)", angle: -90, position: "insideLeft" }}
                      domain={[60, 100]}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="baselineAccuracy"
                      stroke="#8884d8"
                      name="Baseline Model"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="rlAccuracy"
                      stroke="#82ca9d"
                      name="RL Corrected"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ RL model shows consistent improvement over time, demonstrating effective learning.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Performance by City
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Accuracy comparison across cities
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.cityPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                    <YAxis label={{ value: "Accuracy (%)", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="accuracy" fill="#8884d8" name="Accuracy" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Confidence Score Distribution
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Distribution of prediction confidence levels
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.confidenceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ payload, percent }) => {
                        const range = (payload as { range?: string })?.range ?? ""
                        const pct = typeof percent === "number" ? (percent * 100).toFixed(0) : "0"
                        return `${range}: ${pct}%`
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.confidenceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Prediction Volume by City
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Number of predictions made per city
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.cityPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                    <YAxis label={{ value: "Predictions", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="predictions" fill="#82ca9d" name="Predictions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Detailed City Metrics
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        City
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Predictions
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Accuracy
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Avg Confidence
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Avg Baseline
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Avg RL Corrected
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.cityPerformance.map(city => (
                      <tr key={city.city} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {city.city}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {city.predictions}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              city.accuracy >= 85
                                ? "bg-green-100 text-green-800"
                                : city.accuracy >= 75
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {city.accuracy.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {city.avgConfidence.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {city.avgBaseline.toFixed(1)}°C
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {city.avgRlCorrected.toFixed(1)}°C
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                🔍 Key Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InsightCard
                  title="RL Learning Progress"
                  description={`The RL model has achieved ${data.overview.rlImprovement}% improvement over the baseline model, demonstrating effective self-correction.`}
                  type="success"
                />
                <InsightCard
                  title="Model Confidence"
                  description={`Average confidence score of ${data.overview.avgConfidence.toFixed(1)}% indicates reliable predictions across all cities.`}
                  type="info"
                />
                <InsightCard
                  title="Error Reduction"
                  description={`RMSE reduced from ${data.overview.baselineRMSE} to ${data.overview.rlRMSE}, showing significant accuracy improvement.`}
                  type="success"
                />
                <InsightCard
                  title="Best Performing City"
                  description={`${data.cityPerformance[0]?.city} shows highest accuracy with ${data.cityPerformance[0]?.accuracy.toFixed(1)}% correct predictions.`}
                  type="info"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color
}: {
  title: string
  value: string | number
  subtitle: string
  icon: string
  color: "blue" | "green" | "purple" | "orange"
}) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    orange: "bg-orange-50 border-orange-200"
  }

  return (
    <div className={`${colorClasses[color]} border rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  )
}

function InsightCard({
  title,
  description,
  type
}: {
  title: string
  description: string
  type: "success" | "info" | "warning"
}) {
  const typeConfig = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "✓",
      iconBg: "bg-green-500"
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "ℹ",
      iconBg: "bg-blue-500"
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: "⚠",
      iconBg: "bg-yellow-500"
    }
  }

  const config = typeConfig[type]

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <div className={`${config.iconBg} text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-sm font-bold`}>
          {config.icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  )
}
