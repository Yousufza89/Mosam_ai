"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Cloud, 
  Sun, 
  Wind, 
  Droplets, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  LineChart,
  GitBranch,
  Loader2,
  Check,
  Radio,
  Users,
  CloudSun,
  CloudRain,
  Thermometer,
  CheckCircle,
  TrendingUp,
  ChevronRight
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type City = "Karachi" | "Islamabad" | "Lahore" | "Peshawar" | "Quetta";

type CityWeatherData = {
  temp: number;
  feelsLike: number;
  condition: string;
  conditionSub: string;
  rainChance: number;
  intensity: number;
  humidity: number;
  wind: string;
  precip: string;
  uvIndex: string;
  pressure: string;
  visibility: string;
  confidence: string;
  lastUpdated?: string;
};

type HomepageStats = {
  accuracy: string;
  cities: string;
  latency: string;
  uptime: string;
  activeUsers: string;
  todayPredictions: string;
};

const ICON_MAP: Record<string, any> = {
  Sun, Cloud, CloudSun, CloudRain, Zap, Wind, Droplets, Thermometer,
};

// Add CloudSun to the mapping for sunny weather
ICON_MAP['CloudSun'] = CloudSun;

function getIcon(name: string) {
  return ICON_MAP[name] || Cloud;
}

function getWeatherIcon(condition: string) {
  // Map weather conditions to appropriate icons
  switch (condition?.toLowerCase()) {
    case 'sunny':
    return ICON_MAP['CloudSun'];
    case 'clear':
      return ICON_MAP['Sun'];
    case 'partly cloudy':
      return ICON_MAP['Cloud'];
    case 'cloudy':
      return ICON_MAP['CloudRain'];
    case 'rain':
      return ICON_MAP['CloudRain'];
    case 'thunderstorm':
      return ICON_MAP['CloudRain'];
    case 'snow':
      return ICON_MAP['Cloud'];
    case 'fog':
      return ICON_MAP['Cloud'];
    case 'mist':
      return ICON_MAP['Cloud'];
    default:
      return ICON_MAP['Cloud'];
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CITIES: City[] = ["Karachi", "Islamabad", "Lahore", "Peshawar", "Quetta"];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeCity, setActiveCity] = useState<City>("Islamabad");
  const [weatherData, setWeatherData] = useState<Record<string, CityWeatherData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<string>("");
  const [stats, setData] = useState<HomepageStats | null>(null);

  useEffect(() => {
    const fetchHomepageStats = async () => {
      try {
        const response = await fetch('/api/homepage-stats');
        if (response.ok) {
          const data = await response.json();
          setData(data);
        }
      } catch (error) {
        console.error('Failed to fetch homepage stats:', error);
      }
    };

    fetchHomepageStats();
  }, []);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);
        const res = await fetch("/api/weather");
        const json = await res.json();
        setWeatherData(json.data);
        setDataSource(json.source || "live");
      } catch (err) {
        console.error("Failed to fetch weather:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  const data = weatherData?.[activeCity];
  const isWet = Boolean(data?.condition?.toLowerCase().includes("rain") || data?.condition?.toLowerCase().includes("drizzle"));

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute top-0 left-0 w-full h-full bg-mesh-light dark:bg-mesh-dark opacity-30 -z-10" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-12 pb-24 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-8"
          >
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest mb-6"
              >
                <Sparkles className="h-4 w-4" />
                Next-Gen Weather Intelligence
              </motion.div>
              <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] mb-6">
                Predicting the <br />
                <span className="text-gradient">Future Weather</span> <br />
                with AI Precision.
              </h1>
              <p className="text-lg text-foreground max-w-lg leading-relaxed font-medium">
                Experience the next generation of weather prediction. Our cutting-edge AI technology analyzes 
                millions of data points to deliver hyper-accurate forecasts for cities across Pakistan, 
                helping you make better decisions every day.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/signup" 
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black shadow-2xl shadow-primary/20 hover:scale-105 active:scale-100 transition-all"
              >
                Create Free Account <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 bg-secondary/50 backdrop-blur-md border border-border px-8 py-4 rounded-2xl font-bold hover:bg-secondary transition-all"
              >
                Login to Dashboard
              </Link>
            </div>

            {/* Stats Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-white/30 rounded-3xl p-8 space-y-6 shadow-2xl"
            >
              <div className="text-center">
                <h4 className="text-2xl font-bold text-white mb-3">Trusted by Thousands</h4>
                <p className="text-white/90 mb-8">
                  Our AI-powered system delivers exceptional accuracy and reliability for weather predictions across Pakistan
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center group">
                  <div className="text-4xl font-black text-white mb-2 group-hover:scale-110 transition-transform">{stats?.accuracy || "89%"}</div>
                  <div className="text-sm text-white/80 font-medium">Accuracy Rate</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-black text-white mb-2 group-hover:scale-110 transition-transform">{stats?.cities || "5"}</div>
                  <div className="text-sm text-white/80 font-medium">Cities Covered</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-black text-white mb-2 group-hover:scale-110 transition-transform">{stats?.latency || "Dynamic"}</div>
                  <div className="text-sm text-white/80 font-medium">Response Time</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-black text-white mb-2 group-hover:scale-110 transition-transform">{stats?.activeUsers || "12"}</div>
                  <div className="text-sm text-white/80 font-medium">Active Users</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Interactive Weather Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            <div className="glass-card p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              {/* Dynamic Background Effect based on weather */}
              <div className={`absolute inset-0 opacity-10 transition-colors duration-1000 ${isWet ? 'bg-blue-500' : 'bg-orange-400'}`} />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-1">
                      <MapPin className="h-4 w-4" />
                      {activeCity}, Pakistan
                      {dataSource === "live" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest ml-2">
                          <Radio className="h-3 w-3 animate-pulse" /> Live
                        </span>
                      )}
                    </div>
                    <h2 className="text-4xl font-black tracking-tight">{data?.condition || "—"}</h2>
                    <p className="text-muted-foreground font-medium">{data?.conditionSub || "Loading..."}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-7xl font-black tracking-tighter text-gradient leading-none">
                      {data?.temp ?? "—"}°
                    </div>
                    <p className="text-sm font-bold text-muted-foreground mt-2">Feels like {data?.feelsLike ?? "—"}°</p>
                    {data?.lastUpdated && (
                      <p className="text-[10px] font-bold text-muted-foreground/60 mt-1">Updated {new Date(data.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    )}
                  </div>
                </div>

                {/* Weather Icon */}
                <div className="flex justify-center mb-8">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: isWet ? [0, -5, 5, 0] : [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-32 h-32 flex items-center justify-center"
                  >
                    {data ? (
                      <div className="text-8xl flex items-center justify-center">
                        {(() => {
                          const Icon = getWeatherIcon(data.condition);
                          return <Icon />;
                        })()}
                      </div>
                    ) : (
                      <Loader2 className="w-16 h-16 animate-spin text-primary" />
                    )}
                  </motion.div>
                </div>

                {/* Weather Details */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Humidity", value: `${data?.humidity ?? "--"}%` },
                    { label: "Wind", value: data?.wind ?? "-- km/h" },
                    { label: "UV Index", value: data?.uvIndex ?? "--" }
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-lg font-black text-primary">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* City Selector */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {CITIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveCity(c)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                        activeCity === c 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                          : "hover:bg-secondary text-muted-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto space-y-8"
        >
          <h2 className="text-4xl font-black dark:text-white tracking-tight">
            <span className="text-gradient">Revolutionary Weather Technology</span>
          </h2>
          <p className="text-xl text-foreground dark:text-gray-200 leading-relaxed">
            Mosam.ai combines cutting-edge artificial intelligence with advanced meteorological science 
            to deliver weather predictions that are not just accurate, but truly intelligent. Our system 
            learns from patterns, adapts to changing conditions, and provides insights that traditional 
            weather services simply cannot match.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white dark:text-gray-100 mb-3">Lightning Fast</h3>
              <p className="text-white/80 dark:text-gray-300">
                Get instant weather updates with our optimized AI algorithms that process millions of data points in seconds.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white dark:text-gray-100 mb-3">Ultra Reliable</h3>
              <p className="text-white/80 dark:text-gray-300">
                Our advanced machine learning models ensure consistent accuracy across all weather conditions and locations.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white dark:text-gray-100 mb-3">Always Improving</h3>
              <p className="text-white/80 dark:text-gray-300">
                Our AI continuously learns from new data, getting smarter and more accurate with every prediction.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 relative z-10 border-t border-border/50">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Cloud className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-black tracking-tight text-lg">Mosam.ai</span>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            © 2026 Mosam AI. All rights reserved. Made for Pakistan.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
