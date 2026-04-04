"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  History, 
  MapPin, 
  Calendar, 
  Trash2, 
  RefreshCcw, 
  Search, 
  ChevronRight,
  Cloud,
  Thermometer,
  Wind,
  Droplets,
  AlertCircle,
  LayoutGrid,
  List
} from "lucide-react"

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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')

  const cities = ["all", "Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta"]
  const features = ["temperature_min", "temperature_max", "wind_speed", "precipitation"]
  
  const featureConfig: { [key: string]: { label: string, icon: any, color: string, unit: string } } = {
    temperature_min: { label: "Min Temp", icon: Thermometer, color: "text-blue-500", unit: "°C" },
    temperature_max: { label: "Max Temp", icon: Thermometer, color: "text-orange-500", unit: "°C" },
    wind_speed: { label: "Wind Speed", icon: Wind, color: "text-emerald-500", unit: "km/h" },
    precipitation: { label: "Rainfall", icon: Droplets, color: "text-cyan-500", unit: "mm" }
  }

  useEffect(() => {
    fetchPredictions()
  }, [selectedCity])

  const fetchPredictions = async () => {
    setIsLoading(true)
    setError("")
    try {
      const url = selectedCity === "all" ? "/api/predictions" : `/api/predictions?city=${selectedCity}`
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch predictions")
      const data = await response.json()
      setPredictions(data)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this prediction?")) return;
    
    setDeleteLoading(id)
    try {
      const response = await fetch(`/api/predictions/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete prediction")
      setPredictions(predictions.filter((p) => p.id !== id))
    } catch (err: any) {
      alert(err.message || "Failed to delete prediction")
    } finally {
      setDeleteLoading(null)
    }
  }

  const getAccuracyColor = (accuracy: number | null) => {
    if (accuracy === null) return "text-muted-foreground bg-muted"
    if (accuracy >= 90) return "text-emerald-500 bg-emerald-500/10"
    if (accuracy >= 75) return "text-amber-500 bg-amber-500/10"
    return "text-destructive bg-destructive/10"
  }

  const getFeatureData = (prediction: Prediction) => {
    const featureKey = prediction.feature || features.find(f => (prediction.modelVersion || "").includes(f)) || "temperature_max";
    return featureConfig[featureKey] || featureConfig["temperature_max"];
  }

  const getPredictedValue = (prediction: Prediction) => {
    return (prediction.predictedValue ?? prediction.predictionValue ?? prediction.rlCorrectedTemp ?? prediction.baselineTemp ?? 0).toFixed(1)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background relative overflow-hidden pb-12">
      <div className="absolute top-0 left-0 w-full h-full bg-mesh-light dark:bg-mesh opacity-10 -z-10" />
      
      <div className="container mx-auto px-4 pt-8 sm:pt-12 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 text-primary mb-2 font-bold tracking-wider text-sm uppercase">
              <History className="h-4 w-4" />
              Insights Archive
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-3">
              Prediction <span className="text-gradient">History</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Analyze your past weather predictions and tracking accuracy.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-secondary/50 p-1 rounded-xl border border-border">
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
            <button 
              onClick={fetchPredictions}
              className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2.5 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all font-bold text-sm"
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 rounded-[1.5rem] mb-8 flex flex-wrap items-center gap-4"
        >
          <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-xl border border-border/50">
            <Search className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-bold min-w-[120px]"
            >
              {cities.map((city) => (
                <option key={city} value={city} className="bg-background">
                  {city === "all" ? "All Cities" : city}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-4 ml-auto text-xs font-bold text-muted-foreground">
             <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-emerald-500" /> High Accuracy
             </div>
             <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-amber-500" /> Moderate
             </div>
             <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-destructive" /> Low
             </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 flex flex-col items-center justify-center gap-4"
            >
              <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground font-medium">Analyzing your history...</p>
            </motion.div>
          ) : predictions.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-12 text-center rounded-[2rem] flex flex-col items-center justify-center space-y-6 border-dashed border-2"
            >
              <div className="h-24 w-24 bg-secondary/50 rounded-full flex items-center justify-center text-4xl">
                📂
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">No Records Found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                  {selectedCity === "all" 
                    ? "Your history is currently empty. Start making predictions to see them here!" 
                    : `No predictions recorded for ${selectedCity} yet.`}
                </p>
                <a href="/user/dashboard" className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all inline-block">
                  Go to Dashboard
                </a>
              </div>
            </motion.div>
          ) : viewMode === 'table' ? (
            <motion.div 
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-[2rem] overflow-hidden border border-border/50 shadow-xl"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/30 border-b border-border/50">
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Prediction</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">City</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Value</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Accuracy</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Created</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {predictions.map((p) => {
                      const feature = getFeatureData(p);
                      return (
                        <motion.tr 
                          key={p.id}
                          layout
                          className="group hover:bg-secondary/20 transition-colors"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl ${feature.color.replace('text', 'bg')}/10 ${feature.color}`}>
                                <feature.icon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold text-sm">{feature.label}</p>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 font-medium">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(p.predictionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2 font-bold text-sm">
                              <MapPin className="h-3.5 w-3.5 text-primary" />
                              {p.city}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-black tracking-tight">{getPredictedValue(p)}</span>
                              <span className="text-xs font-bold text-muted-foreground">{feature.unit}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getAccuracyColor(p.accuracy)}`}>
                              {p.accuracy !== null ? `${p.accuracy}% Accurate` : 'Pending'}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-xs font-medium text-muted-foreground">
                               {new Date(p.createdAt).toLocaleDateString()}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button
                              onClick={() => handleDelete(p.id)}
                              disabled={deleteLoading === p.id}
                              className="p-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all active:scale-90"
                            >
                              {deleteLoading === p.id ? (
                                <RefreshCcw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {predictions.map((p) => {
                const feature = getFeatureData(p);
                return (
                  <motion.div 
                    key={p.id}
                    layout
                    className="glass-card flex flex-col group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-3 rounded-2xl ${feature.color.replace('text', 'bg')}/10 ${feature.color}`}>
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getAccuracyColor(p.accuracy)}`}>
                        {p.accuracy !== null ? `${p.accuracy}%` : 'Pending'}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
                        <MapPin className="h-3 w-3" />
                        {p.city}
                      </div>
                      <h4 className="text-xl font-black tracking-tight mb-4">{feature.label}</h4>
                      
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-black tracking-tighter">{getPredictedValue(p)}</span>
                        <span className="text-sm font-bold text-muted-foreground uppercase">{feature.unit}</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/30 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(p.predictionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleteLoading === p.id}
                        className="h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                      >
                        {deleteLoading === p.id ? (
                          <RefreshCcw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
