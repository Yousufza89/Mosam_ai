"use client";
import { useState, useEffect, useRef } from "react";
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
  CloudSun
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Sun, Cloud, CloudSun, CloudRain, Zap, Wind, Droplets, Thermometer, CloudSnowflake,
};

// Add CloudSun to the mapping for sunny weather
ICON_MAP['CloudSun'] = CloudSun;

const ICON_MAP: Record<string, any> = {
  Sun, Cloud, CloudSun, CloudRain, Zap, Wind, Droplets, Thermometer, CloudSnowflake,
};

// Add CloudSun to the mapping
ICON_MAP['CloudSun'] = CloudSun;

// ─── Types ────────────────────────────────────────────────────────────────────

type City = "Karachi" | "Islamabad" | "Lahore" | "Peshawar" | "Quetta";

type ForecastDay = {
  day: string;
  icon: string;
  high: number;
  low: number;
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
};

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
};

type HomepageStats = {
  accuracy: string;
  cities: string;
  latency: string;
  uptime: string;
  activeUsers: string;
  todayPredictions: string;
};

// ─── Icon Mapping ─────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, any> = {
  Sun, Cloud, CloudSun, CloudRain, Zap, Wind, Droplets, Thermometer, CloudSnowflake,
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
      return ICON_MAP['CloudSnowflake'];
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

// ─── Rain Canvas ──────────────────────────────────────────────────────────────

function RainCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let id: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    if (active) {
      const drops = Array.from({ length: 130 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        speed: 7 + Math.random() * 9,
        len: 14 + Math.random() * 20,
        opacity: 0.07 + Math.random() * 0.15,
      }));
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drops.forEach((d) => {
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - d.len * 0.22, d.y + d.len);
          ctx.strokeStyle = `rgba(148,200,255,${d.opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          d.y += d.speed;
          d.x -= d.speed * 0.22;
          if (d.y > canvas.height) { d.y = -d.len; d.x = Math.random() * canvas.width; }
        });
        id = requestAnimationFrame(draw);
      };
      draw();
    } else {
      const particles = Array.from({ length: 50 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.15 - Math.random() * 0.25,
        r: 1 + Math.random() * 2,
        opacity: 0.04 + Math.random() * 0.1,
      }));
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(250,190,40,${p.opacity})`;
          ctx.fill();
          p.x += p.vx; p.y += p.vy;
          if (p.y < -10) p.y = canvas.height + 10;
          if (p.x < -10) p.x = canvas.width + 10;
          if (p.x > canvas.width + 10) p.x = -10;
        });
        id = requestAnimationFrame(draw);
      };
      draw();
    }

    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, [active]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden />;
}

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
        setDataSource("error");
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  const data = weatherData?.[activeCity];
  const isWet = (data?.rainChance ?? 0) > 40;

  return (
    <main className="relative min-h-screen bg-background overflow-hidden selection:bg-primary/30">
      <RainCanvas active={isWet} />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading live weather...</p>
          </div>
        </div>
      )}
      
      {/* Background Mesh */}
      <div className="absolute top-0 left-0 w-full h-full bg-mesh-light dark:bg-mesh opacity-30 -z-10" />

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
                with Precision.
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed font-medium">
                Mosam.ai combines advanced machine learning with local expertise 
                to deliver Pakistan's most accurate weather forecasts.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link 
                href="/signup" 
                className="group relative inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all overflow-hidden"
              >
                <span className="relative z-10">Get Started Now</span>
                <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 bg-secondary/50 backdrop-blur-md border border-border px-8 py-4 rounded-2xl font-bold hover:bg-secondary transition-all"
              >
                Login to Dashboard
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4">
                </div>
                <div className="text-right">
                  <Link 
                    href="/user/dashboard" 
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-full font-bold text-white hover:bg-white/30 transition-all group"
                  >
                    Try Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-white mb-4">Powered by Advanced AI</h4>
                <p className="text-white/80 mb-6">
                  Our system analyzes multiple weather models to provide the most accurate predictions
                </p>
                <ul className="space-y-2 text-white/90 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>{stats?.accuracy || "89%"} Accuracy Rate</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <span>{stats?.cities || "5"} Cities Covered</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span>{stats?.latency || "Dynamic"} Response Time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span>{stats?.activeUsers || "1,247"} Active Users</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    <span>{stats?.todayPredictions || "3,421"} Today Predictions</span>
                  </li>
                </ul>
              </div>
            </div>
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
                  {[
                    { label: "Rain", value: `${data?.rainChance ?? 0}%`, icon: Droplets, color: "text-blue-500" },
                    { label: "Wind", value: data?.wind ?? "—", icon: Wind, color: "text-emerald-500" },
                    { label: "Humidity", value: `${data?.humidity ?? 0}%`, icon: Cloud, color: "text-cyan-500" },
                    { label: "UV Index", value: data?.uvIndex ?? "—", icon: Sun, color: "text-orange-500" }
                  ].map((item, i) => (
                    <div key={i} className="bg-secondary/30 rounded-2xl p-4 border border-border/50 hover:border-primary/30 transition-all">
                      <item.icon className={`h-5 w-5 ${item.color} mb-3`} />
                      <p className="text-lg font-black tracking-tight">{item.value}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">5-Day Forecast</h4>
                    <Link href="/signup" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline">
                      See full report <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="flex justify-between gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {(data?.forecast || []).map((day, i) => {
                      const DayIcon = getIcon(day.icon);
                      return (
                        <div key={i} className="flex flex-col items-center gap-3 min-w-[64px] p-3 rounded-2xl bg-secondary/20 border border-border/30">
                          <span className="text-[10px] font-black uppercase tracking-widest">{day.day}</span>
                          <DayIcon className={`h-6 w-6 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-black">{day.high}°</span>
                            <span className="text-[10px] font-bold text-muted-foreground">{day.low}°</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* City Selector Floating Bar */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 glass p-2 rounded-2xl flex gap-1 shadow-2xl border border-border/50 z-20 whitespace-nowrap overflow-x-auto max-w-[90vw] no-scrollbar">
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCity(c)}
                  className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
                    activeCity === c 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                      : "hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-24 relative z-10 border-t border-border/50">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-black tracking-tight">Powerful <span className="text-gradient">Features</span></h2>
          <p className="text-muted-foreground font-medium max-w-xl mx-auto">
            Our platform uses state-of-the-art technology to give you the most 
            comprehensive weather experience possible.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              title: "AI Analysis", 
              desc: "Deep learning models trained on decades of Pakistani weather data.",
              icon: Sparkles,
              color: "bg-blue-500"
            },
            { 
              title: "Real-time Alerts", 
              desc: "Instant notifications for severe weather changes in your specific area.",
              icon: Zap,
              color: "bg-orange-500"
            },
            { 
              title: "Historical Data", 
              desc: "Access years of climate records to identify long-term patterns.",
              icon: LineChart,
              color: "bg-emerald-500"
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="glass-card p-8 group border-transparent hover:border-primary/20"
            >
              <div className={`h-12 w-12 rounded-2xl ${feature.color}/20 flex items-center justify-center mb-6 transition-colors group-hover:bg-primary/20`}>
                <feature.icon className={`h-6 w-6 ${feature.color.replace('bg-', 'text-')} group-hover:text-primary transition-colors`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 relative z-10">
        <div className="relative overflow-hidden glass rounded-[3rem] p-12 sm:p-20 text-center space-y-8 border-primary/20">
          <div className="absolute top-0 left-0 w-full h-full bg-primary/5 -z-10" />
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight">Ready to see the <br /><span className="text-gradient">difference?</span></h2>
            <p className="text-lg text-muted-foreground font-medium">
              Join thousands of users who are already making smarter decisions 
              with Mosam.ai weather intelligence.
            </p>
            <div className="pt-6">
              <Link 
                href="/signup" 
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black shadow-2xl shadow-primary/20 hover:scale-105 active:scale-100 transition-all"
              >
                Create Free Account <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
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
