"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type City = "Karachi" | "Islamabad" | "Lahore" | "Peshawar" | "Quetta";

type ForecastDay = {
  day: string;
  icon: string;
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
      { day: "Mon", icon: "🌧️", high: 26, low: 19, condition: "Rain" },
      { day: "Tue", icon: "⛈️", high: 29, low: 22, condition: "Storm" },
      { day: "Wed", icon: "☁️", high: 28, low: 20, condition: "Cloud" },
      { day: "Thu", icon: "☀️", high: 30, low: 23, condition: "Sun" },
      { day: "Fri", icon: "🌧️", high: 27, low: 18, condition: "Rain" },
    ],
  },
  Karachi: {
    temp: 34, feelsLike: 38, condition: "Hazy Sun", conditionSub: "High humidity, coastal haze",
    rainChance: 12, intensity: 20, humidity: 85, wind: "22 km/h", precip: "0.1 mm",
    uvIndex: "9 / 10", pressure: "1012 hPa", visibility: "6.8 km", confidence: "88%",
    trend: "Warming", tempRange: "28–36°", wetDays: 0,
    forecast: [
      { day: "Mon", icon: "🌤️", high: 34, low: 27, condition: "Hazy" },
      { day: "Tue", icon: "☀️", high: 36, low: 28, condition: "Sun" },
      { day: "Wed", icon: "☀️", high: 35, low: 28, condition: "Sun" },
      { day: "Thu", icon: "🌤️", high: 33, low: 26, condition: "Partly" },
      { day: "Fri", icon: "🌤️", high: 32, low: 26, condition: "Partly" },
    ],
  },
  Lahore: {
    temp: 31, feelsLike: 33, condition: "Partly Cloudy", conditionSub: "Warm with cloud cover",
    rainChance: 28, intensity: 15, humidity: 60, wind: "12 km/h", precip: "1.4 mm",
    uvIndex: "6 / 10", pressure: "1010 hPa", visibility: "8.1 km", confidence: "85%",
    trend: "Stable", tempRange: "22–33°", wetDays: 1,
    forecast: [
      { day: "Mon", icon: "⛅", high: 31, low: 22, condition: "Partly" },
      { day: "Tue", icon: "🌧️", high: 28, low: 20, condition: "Rain" },
      { day: "Wed", icon: "☁️", high: 27, low: 19, condition: "Cloud" },
      { day: "Thu", icon: "☀️", high: 33, low: 23, condition: "Sun" },
      { day: "Fri", icon: "☀️", high: 34, low: 24, condition: "Sun" },
    ],
  },
  Peshawar: {
    temp: 29, feelsLike: 27, condition: "Windy", conditionSub: "Strong northerly gusts",
    rainChance: 35, intensity: 22, humidity: 55, wind: "34 km/h", precip: "2.8 mm",
    uvIndex: "5 / 10", pressure: "1005 hPa", visibility: "10 km", confidence: "79%",
    trend: "Cooling", tempRange: "19–31°", wetDays: 2,
    forecast: [
      { day: "Mon", icon: "💨", high: 29, low: 19, condition: "Windy" },
      { day: "Tue", icon: "🌧️", high: 26, low: 17, condition: "Rain" },
      { day: "Wed", icon: "⛅", high: 28, low: 18, condition: "Partly" },
      { day: "Thu", icon: "☀️", high: 31, low: 20, condition: "Sun" },
      { day: "Fri", icon: "☀️", high: 30, low: 20, condition: "Sun" },
    ],
  },
  Quetta: {
    temp: 22, feelsLike: 19, condition: "Clear", conditionSub: "Cool mountain air",
    rainChance: 8, intensity: 5, humidity: 38, wind: "9 km/h", precip: "0.0 mm",
    uvIndex: "7 / 10", pressure: "870 hPa", visibility: "25 km", confidence: "94%",
    trend: "Stable", tempRange: "12–24°", wetDays: 0,
    forecast: [
      { day: "Mon", icon: "☀️", high: 22, low: 10, condition: "Clear" },
      { day: "Tue", icon: "☀️", high: 24, low: 11, condition: "Clear" },
      { day: "Wed", icon: "⛅", high: 21, low: 9, condition: "Partly" },
      { day: "Thu", icon: "☁️", high: 18, low: 8, condition: "Cloud" },
      { day: "Fri", icon: "🌧️", high: 17, low: 7, condition: "Rain" },
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

// ─── Cloud SVG — matches reference exactly ───────────────────────────────────
// Soft, puffy, light-blue layered circles with a flat bottom base
// Rain streaks rendered below when isWet

function CloudIcon({ isWet }: { isWet: boolean }) {
  return (
    <div className="flex flex-col items-center" style={{ width: 240 }}>
      <svg
        viewBox="0 0 240 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: 240, height: 160, filter: "drop-shadow(0 8px 32px rgba(148,196,255,0.25))" }}
      >
        <defs>
          {/* Soft shadow under the whole cloud */}
          <radialGradient id="cloudShadow" cx="50%" cy="100%" r="50%">
            <stop offset="0%" stopColor="rgba(100,160,230,0.18)" />
            <stop offset="100%" stopColor="rgba(100,160,230,0)" />
          </radialGradient>
          {/* Light gradient on main body */}
          <radialGradient id="bodyGrad" cx="40%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#e8f4ff" />
            <stop offset="100%" stopColor="#c8dff5" />
          </radialGradient>
          {/* Slightly darker back puff */}
          <radialGradient id="backGrad" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#d4eafc" />
            <stop offset="100%" stopColor="#b8d4ee" />
          </radialGradient>
        </defs>

        {/* Shadow ellipse on ground */}
        <ellipse cx="120" cy="150" rx="85" ry="12" fill="url(#cloudShadow)" />

        {/* ── Back puffs (slightly darker, behind) ── */}
        {/* Far left back */}
        <circle cx="68" cy="98" r="32" fill="#c4daf0" />
        {/* Far right back */}
        <circle cx="178" cy="98" r="28" fill="#c4daf0" />

        {/* ── Main cloud body ── */}
        {/* Large center puff */}
        <circle cx="120" cy="78" r="48" fill="url(#bodyGrad)" />
        {/* Left puff */}
        <circle cx="76" cy="96" r="36" fill="#d6ecff" />
        {/* Right puff */}
        <circle cx="168" cy="94" r="32" fill="#d0e8fc" />
        {/* Small top-left accent puff */}
        <circle cx="88" cy="72" r="26" fill="#ddf0ff" />
        {/* Small top-right accent puff */}
        <circle cx="154" cy="74" r="22" fill="#daeeff" />

        {/* Flat base rectangle to fill bottom gaps */}
        <rect x="44" y="108" width="152" height="30" rx="0" fill="#cce4f8" />
        {/* Rounded bottom cap */}
        <rect x="44" y="120" width="152" height="18" rx="9" fill="#cce4f8" />

        {/* ── Rain drops ── */}
        {isWet && (
          <g opacity="0.85">
            <line x1="80"  y1="142" x2="74"  y2="158" stroke="#7bb8e8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="100" y1="145" x2="94"  y2="161" stroke="#90c4ee" strokeWidth="2"   strokeLinecap="round" />
            <line x1="120" y1="142" x2="114" y2="158" stroke="#7bb8e8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="140" y1="145" x2="134" y2="161" stroke="#90c4ee" strokeWidth="2"   strokeLinecap="round" />
            <line x1="160" y1="142" x2="154" y2="158" stroke="#7bb8e8" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-sky-500/10 ${className}`}>
      {children}
    </div>
  );
}

function ProgressBar({ label, value, color }: { label: string; value: number; color: "blue" | "orange" }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ${
            color === "blue"
              ? "bg-gradient-to-r from-cyan-400 to-sky-500"
              : "bg-gradient-to-r from-amber-400 to-orange-500"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
      <p className={`text-sm font-bold ${accent ? "text-cyan-400" : "text-white"}`}>{value}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
// NOTE: Navbar is intentionally removed from this page.
// Your global layout.tsx already renders a fixed navbar across all pages.

export default function HomePage() {
  const [city, setCity] = useState<City>("Islamabad");
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const data = CITY_DATA[city];
  const isWet = data.rainChance > 40;

  if (!mounted) return null;

  const overviewItems = [
    { label: "Feels like", value: `${data.feelsLike}°` },
    { label: "Rain chance", value: `${data.rainChance}%` },
    { label: "Pressure", value: data.pressure },
    { label: "Trend", value: data.trend },
  ];

  const steps = ["Select a city", "Get ML forecast", "Apply RL corrections", "Track accuracy"];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">

      {/* ── Ambient blobs ── */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.22),_transparent_55%),radial-gradient(ellipse_at_20%_80%,_rgba(94,234,212,0.12),_transparent_60%),radial-gradient(ellipse_at_85%_10%,_rgba(59,130,246,0.18),_transparent_50%)]" />
        <div className={`absolute -top-40 -left-20 h-96 w-96 rounded-full blur-3xl transition-colors duration-700 ${isWet ? "bg-blue-600/20" : "bg-amber-500/15"}`} />
        <div className={`absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full blur-[120px] transition-colors duration-700 ${isWet ? "bg-indigo-600/15" : "bg-orange-400/10"}`} />
      </div>

      {/* ── Canvas animation ── */}
      <RainCanvas active={isWet} />

      {/* ── Hero ── */}
      {/* pt-20 accounts for the fixed global navbar height */}
      <section className="relative z-10 pt-20 pb-6 flex flex-col items-center">
        <CloudIcon isWet={isWet} />
        <div className="text-center mt-1 px-4">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-400 tracking-[0.3em] uppercase">Live Forecast</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">Mosam.ai</h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            ML forecasts refined with reinforcement learning — for every city, every day.
          </p>
          <div className="mt-4 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/8 backdrop-blur-sm px-5 py-2.5">
            <span className="text-xl">{data.forecast[0].icon}</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-white leading-tight">{data.condition}</p>
              <p className="text-[10px] text-slate-400">{data.conditionSub}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── City Selector ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Select City</span>
          <div className="flex gap-2 flex-wrap">
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                  city === c
                    ? "bg-white/15 border border-white/30 text-white shadow-lg shadow-sky-500/10"
                    : "border border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/5"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Grid ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* LEFT: Temperature + stats */}
          <div className="space-y-4">
            <GlassCard className="p-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-2">{city}, PK</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-7xl font-bold text-white leading-none">{data.temp}</span>
                <span className="text-3xl text-slate-300 mb-2">°</span>
              </div>
              <p className="text-sm text-slate-400 mb-1">Feels like {data.feelsLike}°</p>
              <div className="flex items-center gap-2 mt-3 mb-5">
                <span className="text-xl">{data.forecast[0].icon}</span>
                <span className="text-base font-semibold text-white">{data.condition}</span>
              </div>
              <div className="space-y-3">
                <ProgressBar label="Rain chance" value={data.rainChance} color="blue" />
                <ProgressBar label="Intensity" value={data.intensity} color="orange" />
              </div>
            </GlassCard>

            <div className="grid grid-cols-3 gap-2">
              <StatCell label="Humidity" value={`${data.humidity}%`} />
              <StatCell label="Wind" value={data.wind} />
              <StatCell label="Precip" value={data.precip} />
              <StatCell label="UV Index" value={data.uvIndex} />
              <StatCell label="Pressure" value={data.pressure} />
              <StatCell label="Visibility" value={data.visibility} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <StatCell label="Confidence" value={data.confidence} accent />
              <StatCell label="Model" value="RL+ML" accent />
              <StatCell label="Drift" value="Low" accent />
            </div>
          </div>

          {/* CENTER: Weekly forecast */}
          <GlassCard className="p-5 h-fit">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-xl font-bold text-white">Weekly Outlook</h2>
                <p className="text-xs text-slate-400 mt-0.5">{city} · Pakistan</p>
              </div>
              <div className="flex gap-1.5">
                <span className="rounded-full bg-white/10 border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-white">{data.tempRange}</span>
                <span className="rounded-full bg-white/10 border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-white">{data.wetDays} wet</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {data.forecast.map((day, i) => (
                <div
                  key={day.day}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all hover:-translate-y-0.5 ${
                    i === 0
                      ? "bg-white/12 border border-white/15"
                      : "border border-white/8 bg-white/4 hover:bg-white/8"
                  }`}
                >
                  <span className="text-xl w-7">{day.icon}</span>
                  <span className="text-sm font-semibold text-white w-10">{day.day}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{day.high}°</span>
                    <div className="flex-1 h-1 rounded-full bg-white/10 mx-1">
                      <div
                        className="h-1 rounded-full bg-gradient-to-r from-cyan-400/60 to-sky-400"
                        style={{ width: `${Math.min(100, ((day.high - day.low) / 15) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-400">{day.low}°</span>
                  </div>
                  <span className="text-xs text-slate-400 w-12 text-right">{day.condition}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* RIGHT: Today overview + workflow + CTA */}
          <div className="space-y-4">
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Today Overview</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Updated 12 min ago</p>
                </div>
                <div className="h-8 w-8 rounded-full border border-white/15 bg-white/8 flex items-center justify-center text-sm">🌡️</div>
              </div>
              <div className="space-y-3">
                {overviewItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">{item.label}</span>
                    <span className={`text-sm font-bold ${item.label === "Trend" ? "text-cyan-400" : "text-white"}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="text-sm font-bold text-white mb-4">Forecast Workflow</h3>
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center text-[10px] font-bold text-slate-900 flex-shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-sm text-slate-300">{step}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-sky-400/15 via-blue-500/15 to-indigo-500/15 backdrop-blur-xl p-5 text-center shadow-2xl shadow-sky-500/10">
              <h3 className="text-sm font-bold text-white mb-1.5">Ready to explore Mosam.ai?</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Build your prediction history and watch confidence rise over time.
              </p>
              <div className="flex gap-2 justify-center">
                <Link
                  href="/signup"
                  className="rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 px-5 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-sky-500/25 hover:-translate-y-0.5 transition-transform"
                >
                  Create Account →
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-white/20 px-5 py-2 text-xs font-medium text-white hover:bg-white/10 transition-colors"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}