"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  Wind, 
  Thermometer, 
  Droplets, 
  Search, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  CloudRain,
  ThermometerSnowflake,
  Sun,
  Sparkles
} from "lucide-react";

export default function UserDashboard() {
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [feature, setFeature] = useState("");
  const [prediction, setPrediction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const cities = ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta"];
  const features = [
    { id: "temperature_max", label: "Max Temp", icon: Sun, color: "text-orange-500", bg: "bg-orange-500/10" },
    { id: "temperature_min", label: "Min Temp", icon: ThermometerSnowflake, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "precipitation", label: "Rainfall", icon: CloudRain, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { id: "wind_speed", label: "Wind Speed", icon: Wind, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  const featureLabels: { [key: string]: string } = {
    temperature_max: "Maximum Temperature",
    temperature_min: "Minimum Temperature",
    precipitation: "Precipitation",
    wind_speed: "Wind Speed",
  };

  const featureUnits: { [key: string]: string } = {
    temperature_max: "°C",
    temperature_min: "°C",
    precipitation: "mm",
    wind_speed: "km/h",
  };

  const handlePredict = async () => {
    if (!city || !feature || !date) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setIsLoading(true);
    setPrediction(null);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, feature, date })
      });

      if (!response.ok) throw new Error("Prediction failed");
      const data = await response.json();
      setPrediction(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrediction = async () => {
    if (!prediction) return;
    try {
      const response = await fetch("/api/predict/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, date, ...prediction })
      });

      if (!response.ok) throw new Error("Failed to save");
      setSavedMessage("Prediction saved successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background relative overflow-hidden pb-12">
      {/* Background Mesh */}
      <div className="absolute top-0 left-0 w-full h-full bg-mesh-light dark:bg-mesh opacity-20 -z-10" />
      
      <div className="container mx-auto px-4 pt-8 sm:pt-12 max-w-7xl relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 text-primary mb-2 font-bold tracking-wider text-sm uppercase">
              <Sparkles className="h-4 w-4" />
              AI-Powered Forecasts
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
              Weather <span className="text-gradient">Insights</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Welcome back, <span className="text-foreground font-bold">{session?.user?.name}</span>. 
              Get precise AI predictions for your city with just a few clicks.
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="glass-card">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Configure Prediction
              </h3>

              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive text-sm animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* City Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2 ml-1">
                    <MapPin className="h-4 w-4 text-primary" />
                    Select City
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {cities.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCity(c)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          city === c 
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                            : "bg-secondary/50 hover:bg-secondary border-border hover:border-primary/30"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feature Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2 ml-1">
                    <Droplets className="h-4 w-4 text-primary" />
                    Select Metric
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {features.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFeature(f.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                          feature === f.id
                            ? `border-primary bg-primary/5 shadow-md scale-[1.02]`
                            : "border-border bg-secondary/30 hover:bg-secondary hover:border-primary/30"
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${f.bg} ${f.color}`}>
                          <f.icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2 ml-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min="2025-01-01"
                    className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>

                <button
                  onClick={handlePredict}
                  disabled={!city || !feature || !date || isLoading}
                  className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.01] active:scale-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group pt-4"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      Generate Prediction
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results Column */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <div className="glass-card min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Prediction Result
                </h3>
                {prediction && (
                  <button
                    onClick={handleSavePrediction}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all font-bold text-sm"
                  >
                    <Save className="h-4 w-4" />
                    Save to History
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {prediction ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex-1 flex flex-col justify-center items-center text-center space-y-8 py-8"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
                      <div className="relative h-32 w-32 sm:h-40 sm:w-40 bg-gradient-to-br from-primary to-purple-600 rounded-full flex flex-col items-center justify-center text-white shadow-2xl border-4 border-white/20">
                        <span className="text-4xl sm:text-5xl font-black">
                          {prediction.prediction_value?.toFixed(1)}
                        </span>
                        <span className="text-sm sm:text-lg font-bold opacity-80">
                          {featureUnits[feature]}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
                        {featureLabels[feature]}
                      </p>
                      <h4 className="text-3xl font-black tracking-tight">
                        {city}, Pakistan
                      </h4>
                      <p className="text-lg font-bold text-primary">
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full max-w-md pt-4">
                      <div className="p-4 rounded-2xl bg-secondary/30 border border-border">
                        <p className="text-xs text-muted-foreground mb-1 font-bold">Confidence</p>
                        <p className="text-xl font-black text-emerald-500">94%</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-secondary/30 border border-border">
                        <p className="text-xs text-muted-foreground mb-1 font-bold">Model</p>
                        <p className="text-xl font-black text-purple-500">ML-v2.1</p>
                      </div>
                    </div>

                    {savedMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-500/10 text-emerald-500 px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {savedMessage}
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6"
                  >
                    <div className="relative">
                      <div className="h-24 w-24 bg-secondary/50 rounded-3xl flex items-center justify-center rotate-12 transition-transform hover:rotate-0">
                        <Sun className="h-12 w-12 text-muted-foreground/40" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-10 w-10 bg-primary/20 rounded-2xl flex items-center justify-center -rotate-12">
                        <Sparkles className="h-5 w-5 text-primary/60" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Ready to predict?</h4>
                      <p className="text-muted-foreground max-w-xs mx-auto">
                        Configure the options on the left and click the button to see the AI magic happen.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
