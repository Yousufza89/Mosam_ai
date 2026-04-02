"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"

type UserInfo = {
  name: string | null
  email: string | null
  role: string | null
  createdAt?: string | null
  lastLogin?: string | null
}

type UserStats = {
  totalPredictions: number
  predictionsThisWeek: number
  predictionsThisMonth: number
  mostPredictedCity: string | null
  mostPredictedCityCount: number
  averageConfidence: number
}

export default function UserProfilePage() {
  const { data: session, status, update } = useSession()

  const sessionRole = (session?.user as { role?: string } | undefined)?.role ?? null

  if (status === "unauthenticated") {
    redirect("/login")
  }

  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: session?.user?.name || null,
    email: session?.user?.email || null,
    role: sessionRole,
    createdAt: null,
    lastLogin: null,
  })
  const [stats, setStats] = useState<UserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState("")

  const [isEditing, setIsEditing] = useState(false)
  const [nameInput, setNameInput] = useState(session?.user?.name || "")
  const [updateMessage, setUpdateMessage] = useState("")
  const [updateError, setUpdateError] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [deletePassword, setDeletePassword] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error) return error.message
    return fallback
  }

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true)
      setStatsError("")

      try {
        const response = await fetch("/api/user/stats", {
          credentials: "include"
        })

        if (!response.ok) {
          let message = "Failed to fetch statistics"
          try {
            const data = await response.json()
            if (data?.error) message = data.error
          } catch {
            // ignore parsing errors
          }
          throw new Error(message)
        }

        const data = await response.json()
        setStats(data.stats)
        setUserInfo((prev) => ({
          ...prev,
          name: data.user?.name ?? prev.name,
          email: data.user?.email ?? prev.email,
          role: data.user?.role ?? prev.role,
          createdAt: data.user?.createdAt ?? prev.createdAt,
        }))
      } catch (err: unknown) {
        setStatsError(getErrorMessage(err, "Failed to fetch statistics"))
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleSaveProfile = async () => {
    setUpdateMessage("")
    setUpdateError("")

    const trimmedName = nameInput.trim()
    if (!trimmedName) {
      setUpdateError("Name is required")
      return
    }

    try {
      const response = await fetch("/api/user/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ name: trimmedName })
      })

      if (!response.ok) {
        let message = "Failed to update profile"
        try {
          const data = await response.json()
          if (data?.error) message = data.error
        } catch {
          // ignore parsing errors
        }
        throw new Error(message)
      }

      const data = await response.json()
      setUserInfo((prev) => ({
        ...prev,
        name: data.user?.name ?? trimmedName,
      }))
      await update({ name: data.user?.name ?? trimmedName })
      setUpdateMessage("Profile updated successfully")
      setIsEditing(false)
    } catch (err: unknown) {
      setUpdateError(getErrorMessage(err, "Failed to update profile"))
    }
  }

  const handleCancelEdit = () => {
    setNameInput(userInfo.name || "")
    setUpdateError("")
    setUpdateMessage("")
    setIsEditing(false)
  }

  const handleChangePassword = async () => {
    setPasswordMessage("")
    setPasswordError("")

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Confirmation password does not match")
      return
    }

    if (newPassword === currentPassword) {
      setPasswordError("New password must be different from current password")
      return
    }

    setPasswordLoading(true)

    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      })

      if (!response.ok) {
        let message = "Failed to change password"
        try {
          const data = await response.json()
          if (data?.error) message = data.error
        } catch {
          // ignore parsing errors
        }
        throw new Error(message)
      }

      setPasswordMessage("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: unknown) {
      setPasswordError(getErrorMessage(err, "Failed to change password"))
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteError("")

    if (!deletePassword) {
      setDeleteError("Password is required")
      return
    }

    if (!deleteConfirm) {
      setDeleteError("Please confirm you understand this action is permanent")
      return
    }

    if (!confirm("This will permanently delete your account. Continue?")) {
      return
    }

    setDeleteLoading(true)

    try {
      const response = await fetch("/api/user/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ password: deletePassword })
      })

      if (!response.ok) {
        let message = "Failed to delete account"
        try {
          const data = await response.json()
          if (data?.error) message = data.error
        } catch {
          // ignore parsing errors
        }
        throw new Error(message)
      }

      await signOut({ callbackUrl: "/" })
    } catch (err: unknown) {
      setDeleteError(getErrorMessage(err, "Failed to delete account"))
    } finally {
      setDeleteLoading(false)
    }
  }

  const formatDate = (value?: string | null) => {
    if (!value) return ""
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">User Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Edit
              </button>
            )}
          </div>

          {updateError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {updateError}
            </div>
          )}
          {updateMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {updateMessage}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              {isEditing ? (
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-800">
                  {userInfo.name || "Not set"}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-semibold text-gray-800">
                {userInfo.email || "Not available"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-lg font-semibold text-gray-800">
                {userInfo.role || "USER"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="text-lg font-semibold text-gray-800">
                {userInfo.createdAt ? formatDate(userInfo.createdAt) : "Not available"}
              </p>
            </div>
            {userInfo.lastLogin && (
              <div>
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatDate(userInfo.lastLogin)}
                </p>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveProfile}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Statistics</h2>

          {statsError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {statsError}
            </div>
          )}

          {statsLoading && (
            <p className="text-gray-600">Loading statistics...</p>
          )}

          {!statsLoading && stats && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-5">
                  <p className="text-sm text-gray-500">Total Predictions</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalPredictions}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-5">
                  <p className="text-sm text-gray-500">This Week</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.predictionsThisWeek}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-5">
                  <p className="text-sm text-gray-500">This Month</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.predictionsThisMonth}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-5">
                  <p className="text-sm text-gray-600">Most Predicted City</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {stats.mostPredictedCity
                      ? `${stats.mostPredictedCity} (${stats.mostPredictedCityCount})`
                      : "No predictions yet"}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-5">
                  <p className="text-sm text-gray-600">Average Confidence</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {stats.averageConfidence ? `${stats.averageConfidence.toFixed(1)}%` : "0%"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h2>

          {passwordError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {passwordError}
            </div>
          )}
          {passwordMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {passwordMessage}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-gray-600">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          <button
            onClick={handleChangePassword}
            disabled={passwordLoading}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {passwordLoading ? "Updating..." : "Change Password"}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-red-200">
          <h2 className="text-2xl font-bold text-red-700 mb-4">⚠️ Danger Zone</h2>
          <p className="text-gray-600 mb-4">
            Deleting your account will permanently remove all your data and predictions.
            This action cannot be undone.
          </p>

          {deleteError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {deleteError}
            </div>
          )}

          <div className="max-w-md space-y-4">
            <div>
              <label className="text-sm text-gray-600">Confirm Password</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.checked)}
              />
              I understand this action is permanent
            </label>
          </div>

          <button
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
          >
            {deleteLoading ? "Deleting..." : "Delete My Account"}
          </button>
        </div>
      </div>
    </div>
  )
}