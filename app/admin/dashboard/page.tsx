"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"

type Stats = {
  users: {
    total: number
    admins: number
    regularUsers: number
  }
  predictions: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
  }
  analytics: {
    mostActiveCity: string
    mostActiveCityCount: number
    averageConfidence: number
    cityBreakdown: Array<{ city: string; count: number }>
  }
  recentActivity: Array<{
    id: string
    city: string
    user: string
    createdAt: string
    confidence: number
  }>
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()

  if (status === "unauthenticated") {
    redirect("/login")
  }

  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    redirect("/user/dashboard")
  }

  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/stats")

      if (!response.ok) {
        throw new Error("Failed to fetch statistics")
      }

      const data = await response.json()
      setStats(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, <span className="font-semibold">{session?.user?.name}</span>! Manage
            and monitor Mosam.ai system.
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
            <p className="text-gray-600 mt-4">Loading statistics...</p>
          </div>
        )}

        {!isLoading && stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Users"
                value={stats.users.total}
                subtitle={`${stats.users.regularUsers} users, ${stats.users.admins} admins`}
                icon="👥"
                color="blue"
              />

              <StatCard
                title="Total Predictions"
                value={stats.predictions.total}
                subtitle={`${stats.predictions.today} today`}
                icon="🌤️"
                color="green"
              />

              <StatCard
                title="This Week"
                value={stats.predictions.thisWeek}
                subtitle="Predictions made"
                icon="📊"
                color="purple"
              />

              <StatCard
                title="Most Active City"
                value={stats.analytics.mostActiveCity}
                subtitle={`${stats.analytics.mostActiveCityCount} predictions`}
                icon="📍"
                color="orange"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Predictions by City
                </h2>
                <div className="space-y-3">
                  {stats.analytics.cityBreakdown.map(cityData => {
                    const percentage = stats.predictions.total
                      ? (cityData.count / stats.predictions.total) * 100
                      : 0

                    return (
                      <div key={cityData.city}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {cityData.city}
                          </span>
                          <span className="text-sm text-gray-600">
                            {cityData.count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  System Health
                </h2>
                <div className="space-y-4">
                  <HealthIndicator label="Database" status="healthy" />
                  <HealthIndicator label="API" status="healthy" />
                  <HealthIndicator label="ML Models" status="healthy" />
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-1">Avg Confidence</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.analytics.averageConfidence.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Recent Activity
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        City
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Confidence
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.recentActivity.map(activity => (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {activity.user}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {activity.city}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {activity.confidence}%
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(activity.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ActionCard
                title="Performance Analytics"
                description="View detailed ML model performance metrics and charts"
                href="/admin/performance"
                icon="📈"
                color="purple"
              />

              <ActionCard
                title="User Management"
                description="View and manage all registered users"
                href="/admin/users"
                icon="👥"
                color="blue"
              />

              <ActionCard
                title="All Predictions"
                description="View predictions from all users across the system"
                href="/admin/all-predictions"
                icon="🌍"
                color="green"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({
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

function HealthIndicator({
  label,
  status
}: {
  label: string
  status: "healthy" | "warning" | "error"
}) {
  const statusConfig = {
    healthy: { color: "bg-green-500", text: "Operational" },
    warning: { color: "bg-yellow-500", text: "Warning" },
    error: { color: "bg-red-500", text: "Error" }
  }

  const config = statusConfig[status]

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${config.color}`}></span>
        <span className="text-xs text-gray-600">{config.text}</span>
      </div>
    </div>
  )
}

function ActionCard({
  title,
  description,
  href,
  icon,
  color
}: {
  title: string
  description: string
  href: string
  icon: string
  color: "blue" | "green" | "purple"
}) {
  const colorClasses = {
    blue: "hover:border-blue-500",
    green: "hover:border-green-500",
    purple: "hover:border-purple-500"
  }

  return (
    <Link
      href={href}
      className={`block bg-white border-2 border-gray-200 rounded-xl p-6 transition ${colorClasses[color]} hover:shadow-lg`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  )
}
