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
  Sparkles,
  Brain,
  Cpu,
  Database,
  Activity,
  BarChart3,
  GitBranch,
  Zap,
  Loader2,
  Check
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
  const [predictionSteps, setPredictionSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

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
    setPredictionSteps([]);
    setCurrentStep(0);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, feature, date })
      });

      if (!response.ok) throw new Error("Prediction failed");
      const data = await response.json();
      
      // Animate through the prediction steps
      if (data.steps && data.steps.length > 0) {
        setPredictionSteps(data.steps);
        
        // Animate step by step
        for (let i = 0; i < data.steps.length; i++) {
          setCurrentStep(i);
          await new Promise(resolve => setTimeout(resolve, 400));
        }
        
        // Small delay before showing result
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
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
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </div>
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
                {isLoading && predictionSteps.length > 0 ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-center p-6"
                  >
                    {/* ML Processing Steps */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-6">
                        <Brain className="h-5 w-5 text-primary animate-pulse" />
                        <span className="font-bold text-sm">AI Model Processing</span>
                      </div>
                      
                      {predictionSteps.map((step, index) => {
                        const isActive = index === currentStep;
                        const isComplete = index < currentStep;
                        const icons: { [key: string]: any } = {
                          data_loading: Database,
                          date_parsing: Calendar,
                          feature_engineering: Cpu,
                          baseline_model: BarChart3,
                          rl_correction: GitBranch,
                          confidence_calc: Activity
                        };
                        const StepIcon = icons[step.step] || Zap;
                        
                        return (
                          <motion.div
                            key={step.step}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ 
                              opacity: isActive || isComplete ? 1 : 0.4,
                              x: 0 
                            }}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                              isActive ? 'bg-primary/10 border border-primary/30' : 
                              isComplete ? 'bg-emerald-500/10 border border-emerald-500/30' : 
                              'bg-secondary/30 border border-border'
                            }`}
                          >
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                              isActive ? 'bg-primary text-primary-foreground' :
                              isComplete ? 'bg-emerald-500 text-white' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {isComplete ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <StepIcon className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`} />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-semibold ${
                                isActive ? 'text-primary' : 
                                isComplete ? 'text-emerald-600' : 
                                'text-muted-foreground'
                              }`}>
                                {step.message}
                              </p>
                              {isActive && (
                                <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                                  <motion.div 
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${step.progress}%` }}
                                    transition={{ duration: 0.3 }}
                                  />
                                </div>
                              )}
                            </div>
                            <span className={`text-xs font-bold ${
                              isActive ? 'text-primary' : 
                              isComplete ? 'text-emerald-600' : 
                              'text-muted-foreground'
                            }`}>
                              {step.progress}%
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                    
                    {/* Overall Progress */}
                    <div className="mt-8 pt-6 border-t border-border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Processing Pipeline
                        </span>
                        <span className="text-xs font-bold text-primary">
                          {Math.round((currentStep / predictionSteps.length) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-primary to-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(currentStep / predictionSteps.length) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : prediction ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex-1 flex flex-col justify-center items-center text-center space-y-6 py-4"
                  >
                    {/* Model Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span className="text-xs font-bold text-primary">{prediction.modelVersion || "AI-v3.0"}</span>
                    </div>
                    
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

                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
                        {featureLabels[feature]}
                      </p>
                      <h4 className="text-2xl font-black tracking-tight">
                        {city}, Pakistan
                      </h4>
                      <p className="text-base font-bold text-primary">
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>

                    {/* AI Prediction Details */}
                    <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                      <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                        <p className="text-[10px] text-muted-foreground mb-1 font-bold uppercase tracking-wider">Baseline</p>
                        <p className="text-lg font-black text-blue-500">{prediction.baselineTemp}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                        <p className="text-[10px] text-muted-foreground mb-1 font-bold uppercase tracking-wider">RL Correction</p>
                        <p className={`text-lg font-black ${prediction.rlCorrection?.startsWith('+') ? 'text-emerald-500' : 'text-orange-500'}`}>
                          {prediction.rlCorrection}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                        <p className="text-[10px] text-emerald-600 mb-1 font-bold uppercase tracking-wider">Confidence</p>
                        <p className="text-lg font-black text-emerald-600">{prediction.confidence}%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                        <p className="text-[10px] text-purple-600 mb-1 font-bold uppercase tracking-wider">Features</p>
                        <p className="text-lg font-black text-purple-600">108</p>
                      </div>
                    </div>

                    {/* Model Status Indicator */}
                    {prediction.featureSummary?.using_trained_models !== undefined && (
                      <div className={`w-full max-w-sm p-3 rounded-xl border ${prediction.featureSummary.using_trained_models ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Brain className={`h-4 w-4 ${prediction.featureSummary.using_trained_models ? 'text-emerald-600' : 'text-amber-600'}`} />
                            <span className={`text-xs font-bold ${prediction.featureSummary.using_trained_models ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {prediction.featureSummary.using_trained_models ? 'Trained Models Active' : 'Fallback Mode'}
                            </span>
                          </div>
                          <span className={`text-[10px] px-2 py-1 rounded-full ${prediction.featureSummary.using_trained_models ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                            {prediction.featureSummary.using_trained_models ? '✓' : '!'}
                          </span>
                        </div>
                        {!prediction.featureSummary.using_trained_models && (
                          <p className="text-[10px] text-amber-700 mt-2">
                            Copy your trained .pkl models to ml_service/models/ for real predictions
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Feature Summary */}
                    {prediction.featureSummary && (
                      <div className="w-full max-w-sm p-3 rounded-xl bg-muted/50 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Analysis Summary</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-xs font-bold text-foreground">{prediction.featureSummary.season}</p>
                            <p className="text-[10px] text-muted-foreground">Season</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{prediction.featureSummary.data_points}</p>
                            <p className="text-[10px] text-muted-foreground">Data Points</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{prediction.featureSummary.recent_trend}</p>
                            <p className="text-[10px] text-muted-foreground">Trend</p>
                          </div>
                        </div>
                      </div>
                    )}

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
