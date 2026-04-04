"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  MapPin, 
  Settings, 
  Lock, 
  Trash2, 
  AlertTriangle,
  CheckCircle2,
  X,
  Edit2,
  Save,
  LogOut,
  ChevronRight,
  PieChart
} from "lucide-react"

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

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true)
      setStatsError("")
      try {
        const response = await fetch("/api/user/stats")
        if (!response.ok) throw new Error("Failed to fetch statistics")
        const data = await response.json()
        setStats(data.stats)
        setUserInfo((prev) => ({
          ...prev,
          name: data.user?.name ?? prev.name,
          email: data.user?.email ?? prev.email,
          role: data.user?.role ?? prev.role,
          createdAt: data.user?.createdAt ?? prev.createdAt,
        }))
      } catch (err: any) {
        setStatsError(err.message || "Failed to fetch statistics")
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleSaveProfile = async () => {
    setUpdateMessage(""); setUpdateError("");
    const trimmedName = nameInput.trim()
    if (!trimmedName) { setUpdateError("Name is required"); return; }
    try {
      const response = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName })
      })
      if (!response.ok) throw new Error("Failed to update profile")
      const data = await response.json()
      setUserInfo((prev) => ({ ...prev, name: data.user?.name ?? trimmedName }))
      await update({ name: data.user?.name ?? trimmedName })
      setUpdateMessage("Profile updated successfully")
      setIsEditing(false)
    } catch (err: any) {
      setUpdateError(err.message || "Failed to update profile")
    }
  }

  const handleChangePassword = async () => {
    setPasswordMessage(""); setPasswordError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required"); return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters"); return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match"); return;
    }
    setPasswordLoading(true)
    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      })
      if (!response.ok) throw new Error("Failed to change password")
      setPasswordMessage("Password updated successfully")
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password")
    } finally { setPasswordLoading(false) }
  }

  const handleDeleteAccount = async () => {
    setDeleteError("")
    if (!deletePassword) { setDeleteError("Password is required"); return; }
    if (!deleteConfirm) { setDeleteError("Please confirm deletion"); return; }
    if (!confirm("This will permanently delete your account. Continue?")) return;
    setDeleteLoading(true)
    try {
      const response = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword })
      })
      if (!response.ok) throw new Error("Failed to delete account")
      signOut({ callbackUrl: "/" })
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete account")
    } finally { setDeleteLoading(false) }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background relative overflow-hidden pb-20">
      <div className="absolute top-0 left-0 w-full h-full bg-mesh-light dark:bg-mesh opacity-10 -z-10" />
      
      <div className="container mx-auto px-4 pt-8 sm:pt-12 max-w-6xl relative z-10">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row items-center gap-8 glass p-8 rounded-[2.5rem]"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-[30px] rounded-full group-hover:bg-primary/30 transition-all" />
            <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-primary to-purple-600 p-1">
              <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                <User className="h-16 w-16 text-primary" />
              </div>
            </div>
            <button className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-primary text-primary-foreground border-4 border-background flex items-center justify-center hover:scale-110 transition-all shadow-lg">
              <Edit2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
              <h1 className="text-4xl font-black tracking-tight">{userInfo.name}</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 self-center md:self-auto">
                {userInfo.role || 'Member'}
              </span>
            </div>
            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 font-medium">
              <Mail className="h-4 w-4" /> {userInfo.email}
            </p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-lg border border-border/50">
                <Calendar className="h-3.5 w-3.5" />
                Joined {userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : 'Recently'}
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 text-xs font-bold text-destructive hover:text-destructive-foreground hover:bg-destructive px-3 py-1.5 rounded-lg border border-destructive/20 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Stats Column */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card"
            >
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Your Impact
              </h3>
              
              {statsLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-secondary/30 rounded-2xl" />)}
                </div>
              ) : stats ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-secondary/20 border border-border/50">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Predictions</p>
                    <p className="text-3xl font-black">{stats.totalPredictions}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/20 border border-border/50">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Avg Confidence</p>
                    <p className="text-3xl font-black text-emerald-500">{stats.averageConfidence}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/20 border border-border/50">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Favorite City</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <p className="text-xl font-black">{stats.mostPredictedCity || 'None'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No stats available yet.</p>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card bg-primary/5 border-primary/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">Pro Features</h4>
                  <p className="text-xs text-muted-foreground">Unlock deeper insights</p>
                </div>
              </div>
              <button className="w-full bg-primary text-primary-foreground text-xs font-bold py-2.5 rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20">
                Upgrade to Pro
              </button>
            </motion.div>
          </div>

          {/* Settings Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Account Settings */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Account Details
                </h3>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="text-sm font-bold text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      className="text-sm font-bold text-primary hover:underline"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
                  {isEditing ? (
                    <input 
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                    />
                  ) : (
                    <div className="w-full bg-secondary/10 border border-transparent rounded-xl px-4 py-3 font-bold text-foreground/80">
                      {userInfo.name}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                  <div className="w-full bg-secondary/10 border border-transparent rounded-xl px-4 py-3 font-bold text-muted-foreground/60 cursor-not-allowed">
                    {userInfo.email}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {updateMessage && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 p-4 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center gap-2 text-sm font-bold border border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4" /> {updateMessage}
                  </motion.div>
                )}
                {updateError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-2 text-sm font-bold border border-destructive/20">
                    <AlertTriangle className="h-4 w-4" /> {updateError}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Security */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card"
            >
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Security
              </h3>

              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Current Password</label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                    />
                  </div>
                  <div className="hidden sm:block" />
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">New Password</label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Confirm New Password</label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {passwordMessage && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 p-4 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center gap-2 text-sm font-bold border border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4" /> {passwordMessage}
                  </motion.div>
                )}
                {passwordError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-2 text-sm font-bold border border-destructive/20">
                    <AlertTriangle className="h-4 w-4" /> {passwordError}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Danger Zone */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card border-destructive/20 bg-destructive/5"
            >
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </h3>
              <p className="text-sm text-muted-foreground mb-8">
                Once you delete your account, there is no going back. Please be certain.
              </p>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="confirm-delete"
                      checked={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.checked)}
                      className="h-4 w-4 rounded border-destructive text-destructive focus:ring-destructive"
                    />
                    <label htmlFor="confirm-delete" className="text-sm font-bold text-muted-foreground cursor-pointer">
                      I understand that this action is permanent and irreversible.
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Confirm with Password</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input 
                        type="password"
                        placeholder="Enter your password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="flex-1 bg-background border border-destructive/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-destructive/20 focus:border-destructive transition-all font-bold"
                      />
                      <button 
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading || !deleteConfirm || !deletePassword}
                        className="bg-destructive text-destructive-foreground font-bold px-8 py-3 rounded-xl hover:scale-105 transition-all shadow-lg shadow-destructive/20 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deleteLoading ? 'Deleting...' : 'Delete Account'}
                      </button>
                    </div>
                  </div>
                </div>
                {deleteError && (
                  <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-bold border border-destructive/20">
                    {deleteError}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
