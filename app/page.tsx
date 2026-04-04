"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  CloudRain,
  Thermometer,
  CloudSun
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type City = "Karachi" | "Islamabad" | "Lahore" | "Peshawar" | "Quetta";

type ForecastDay = {
  day: string;
  icon: any;
  high: number;
  low: number;
  condition: string;
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
  trend: string;
  tempRange: string;
  wetDays: number;
  forecast: ForecastDay[];
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const CITY_DATA: Record<City, CityWeatherData> = {
  Islamabad: {
    temp: 27, feelsLike: 25, condition: "Stormy", conditionSub: "Heavy rainfall expected",
    rainChance: 82, intensity: 66, humidity: 78, wind: "18 km/h", precip: "9.2 mm",
    uvIndex: "0 / 10", pressure: "1008 hPa", visibility: "4.2 km", confidence: "91%",
    trend: "Cooling", tempRange: "18–30°", wetDays: 3,
    forecast: [
      { day: "Mon", icon: CloudRain, high: 26, low: 19, condition: "Rain" },
      { day: "Tue", icon: Zap, high: 29, low: 22, condition: "Storm" },
      { day: "Wed", icon: Cloud, high: 28, low: 20, condition: "Cloud" },
      { day: "Thu", icon: Sun, high: 30, low: 23, condition: "Sun" },
      { day: "Fri", icon: CloudRain, high: 27, low: 18, condition: "Rain" },
    ],
  },
  Karachi: {
    temp: 34, feelsLike: 38, condition: "Hazy Sun", conditionSub: "High humidity, coastal haze",
    rainChance: 12, intensity: 20, humidity: 85, wind: "22 km/h", precip: "0.1 mm",
    uvIndex: "9 / 10", pressure: "1012 hPa", visibility: "6.8 km", confidence: "88%",
    trend: "Warming", tempRange: "28–36°", wetDays: 0,
    forecast: [
      { day: "Mon", icon: CloudSun, high: 34, low: 27, condition: "Hazy" },
      { day: "Tue", icon: Sun, high: 36, low: 28, condition: "Sun" },
      { day: "Wed", icon: Sun, high: 35, low: 28, condition: "Sun" },
      { day: "Thu", icon: CloudSun, high: 33, low: 26, condition: "Partly" },
      { day: "Fri", icon: CloudSun, high: 32, low: 26, condition: "Partly" },
    ],
  },
  Lahore: {
    temp: 31, feelsLike: 33, condition: "Partly Cloudy", conditionSub: "Warm with cloud cover",
    rainChance: 28, intensity: 15, humidity: 60, wind: "12 km/h", precip: "1.4 mm",
    uvIndex: "6 / 10", pressure: "1010 hPa", visibility: "8.1 km", confidence: "85%",
    trend: "Stable", tempRange: "22–33°", wetDays: 1,
    forecast: [
      { day: "Mon", icon: CloudSun, high: 31, low: 22, condition: "Partly" },
      { day: "Tue", icon: CloudRain, high: 28, low: 20, condition: "Rain" },
      { day: "Wed", icon: Cloud, high: 27, low: 19, condition: "Cloud" },
      { day: "Thu", icon: Sun, high: 33, low: 23, condition: "Sun" },
      { day: "Fri", icon: Sun, high: 34, low: 24, condition: "Sun" },
    ],
  },
  Peshawar: {
    temp: 29, feelsLike: 27, condition: "Windy", conditionSub: "Strong northerly gusts",
    rainChance: 35, intensity: 22, humidity: 55, wind: "34 km/h", precip: "2.8 mm",
    uvIndex: "5 / 10", pressure: "1005 hPa", visibility: "10 km", confidence: "79%",
    trend: "Cooling", tempRange: "19–31°", wetDays: 2,
    forecast: [
      { day: "Mon", icon: Wind, high: 29, low: 19, condition: "Windy" },
      { day: "Tue", icon: CloudRain, high: 26, low: 17, condition: "Rain" },
      { day: "Wed", icon: CloudSun, high: 28, low: 18, condition: "Partly" },
      { day: "Thu", icon: Sun, high: 31, low: 20, condition: "Sun" },
      { day: "Fri", icon: Sun, high: 30, low: 20, condition: "Sun" },
    ],
  },
  Quetta: {
    temp: 22, feelsLike: 19, condition: "Clear", conditionSub: "Cool mountain air",
    rainChance: 8, intensity: 5, humidity: 38, wind: "9 km/h", precip: "0.0 mm",
    uvIndex: "7 / 10", pressure: "870 hPa", visibility: "25 km", confidence: "94%",
    trend: "Stable", tempRange: "12–24°", wetDays: 0,
    forecast: [
      { day: "Mon", icon: Sun, high: 22, low: 10, condition: "Clear" },
      { day: "Tue", icon: Sun, high: 24, low: 11, condition: "Clear" },
      { day: "Wed", icon: CloudSun, high: 21, low: 9, condition: "Partly" },
      { day: "Thu", icon: Cloud, high: 18, low: 8, condition: "Cloud" },
      { day: "Fri", icon: CloudRain, high: 17, low: 7, condition: "Rain" },
    ],
  },
};

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
  const data = CITY_DATA[activeCity];
  const isWet = data.rainChance > 40;

  return (
    <main className="relative min-h-screen bg-background overflow-hidden selection:bg-primary/30">
      <RainCanvas active={isWet} />
      
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

            <div className="grid grid-cols-3 gap-6 pt-4">
              {[
                { label: "Accuracy", value: "94%", icon: ShieldCheck },
                { label: "Cities", value: "50+", icon: MapPin },
                { label: "Latency", value: "12ms", icon: Zap }
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <stat.icon className="h-4 w-4" />
                    <span className="text-xl font-black tracking-tight">{stat.value}</span>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
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
                    </div>
                    <h2 className="text-4xl font-black tracking-tight">{data.condition}</h2>
                    <p className="text-muted-foreground font-medium">{data.conditionSub}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-7xl font-black tracking-tighter text-gradient leading-none">
                      {data.temp}°
                    </div>
                    <p className="text-sm font-bold text-muted-foreground mt-2">Feels like {data.feelsLike}°</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
                  {[
                    { label: "Rain", value: `${data.rainChance}%`, icon: Droplets, color: "text-blue-500" },
                    { label: "Wind", value: data.wind, icon: Wind, color: "text-emerald-500" },
                    { label: "Humidity", value: `${data.humidity}%`, icon: Cloud, color: "text-cyan-500" },
                    { label: "UV Index", value: data.uvIndex, icon: Sun, color: "text-orange-500" }
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
                    {data.forecast.map((day, i) => (
                      <div key={i} className="flex flex-col items-center gap-3 min-w-[64px] p-3 rounded-2xl bg-secondary/20 border border-border/30">
                        <span className="text-[10px] font-black uppercase tracking-widest">{day.day}</span>
                        <day.icon className={`h-6 w-6 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-black">{day.high}°</span>
                          <span className="text-[10px] font-bold text-muted-foreground">{day.low}°</span>
                        </div>
                      </div>
                    ))}
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
