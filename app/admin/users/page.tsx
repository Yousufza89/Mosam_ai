"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

type User = {
  id: string
  name: string | null
  email: string
  role: string
  joinedDate: string
  totalPredictions: number
  lastLogin?: string
  accuracy?: number
}

type UserDetail = User & {
  predictions: Array<{
    id: string
    city: string
    predictionDate: string
    confidenceScore: number
    accuracy?: number
  }>
}

export default function AdminUsers() {
  const { data: session, status } = useSession()

  if (status === "unauthenticated") {
    redirect("/login")
  }

  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    redirect("/user/dashboard")
  }

  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/users")

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })

  const handleUserDetail = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      if (!response.ok) throw new Error("Failed to fetch user details")
      
      const userDetail = await response.json()
      setSelectedUser(userDetail)
      setShowUserDetail(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user details")
    }
  }

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    setIsUpdating(true)
    setPasswordError("")

    try {
      const response = await fetch(`/api/admin/user/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser?.id,
          newPassword
        })
      })

      if (!response.ok) throw new Error("Failed to update password")

      setShowPasswordModal(false)
      setNewPassword("")
      setConfirmPassword("")
      alert("Password updated successfully!")
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to update password")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/user/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole })
      })

      if (!response.ok) throw new Error("Failed to update role")

      fetchUsers() // Refresh users list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role")
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">View and manage all registered users</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading users...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Search and Filter Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ALL">All Users</option>
                    <option value="USER">Regular Users</option>
                    <option value="ADMIN">Admins</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    Showing {filteredUsers.length} of {users.length} users
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Predictions
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accuracy
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || "No name"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-0 ${
                              user.role === "ADMIN"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.totalPredictions}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.accuracy ? `${user.accuracy.toFixed(1)}%` : "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(user.joinedDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUserDetail(user.id)}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser({
                                  ...user,
                                  predictions: []
                                })
                                setShowPasswordModal(true)
                              }}
                              className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                            >
                              Reset Password
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm text-gray-600 mb-1">Total Users</div>
                <div className="text-3xl font-bold text-gray-800">
                  {users.length}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm text-gray-600 mb-1">Admins</div>
                <div className="text-3xl font-bold text-purple-600">
                  {users.filter(u => u.role === "ADMIN").length}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm text-gray-600 mb-1">Regular Users</div>
                <div className="text-3xl font-bold text-blue-600">
                  {users.filter(u => u.role === "USER").length}
                </div>
              </div>
            </div>

            {/* Password Reset Modal */}
          {showPasswordModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Reset Password for {selectedUser.name || selectedUser.email}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  {passwordError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">
                      {passwordError}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowPasswordModal(false)
                      setNewPassword("")
                      setConfirmPassword("")
                      setPasswordError("")
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordUpdate}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isUpdating ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User Detail Modal */}
          {showUserDetail && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {selectedUser.name || "No Name"}
                    </h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                  <button
                    onClick={() => setShowUserDetail(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Predictions</div>
                    <div className="text-2xl font-bold text-gray-800">{selectedUser.totalPredictions}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Accuracy</div>
                    <div className="text-2xl font-bold text-gray-800">
                      {selectedUser.accuracy ? `${selectedUser.accuracy.toFixed(1)}%` : "N/A"}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Role</div>
                    <div className="text-2xl font-bold text-gray-800">{selectedUser.role}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Member Since</div>
                    <div className="text-sm font-bold text-gray-800">{formatDate(selectedUser.joinedDate)}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Recent Predictions</h4>
                  {selectedUser.predictions.length > 0 ? (
                    <div className="space-y-3">
                      {selectedUser.predictions.map(prediction => (
                        <div key={prediction.id} className="bg-white rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-800">{prediction.city}</div>
                              <div className="text-sm text-gray-600">
                                {new Date(prediction.predictionDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Confidence</div>
                              <div className="font-bold text-blue-600">{prediction.confidenceScore}%</div>
                              {prediction.accuracy && (
                                <div className="text-sm text-gray-600">Accuracy: {prediction.accuracy.toFixed(1)}%</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No predictions yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  )
}
