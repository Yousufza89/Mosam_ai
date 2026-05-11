import { NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

type ForecastDay = {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
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
  lastUpdated: string;
};

// ─── Cache ────────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const cache: Record<string, { data: CityWeatherData; timestamp: number }> = {};

function getCached(city: string): CityWeatherData | null {
  const entry = cache[city];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  return null;
}

function setCache(city: string, data: CityWeatherData) {
  cache[city] = { data, timestamp: Date.now() };
}

// ─── Condition Mapping ────────────────────────────────────────────────────────

function mapCondition(code: number, text: string): { condition: string; conditionSub: string; icon: string } {
  // WeatherAPI condition codes: https://www.weatherapi.com/docs/weather_conditions.json
  if (code === 1000) return { condition: "Clear", conditionSub: "Clear skies, bright sunshine", icon: "Sun" };
  if (code === 1003) return { condition: "Partly Cloudy", conditionSub: "Mix of sun and clouds", icon: "CloudSun" };
  if (code === 1006) return { condition: "Cloudy", conditionSub: "Overcast cloud cover", icon: "Cloud" };
  if (code === 1009) return { condition: "Overcast", conditionSub: "Heavy cloud cover all day", icon: "Cloud" };
  if ([1030, 1135, 1147].includes(code)) return { condition: "Foggy", conditionSub: "Low visibility due to fog", icon: "Cloud" };
  if ([1063, 1150, 1153, 1180, 1183].includes(code)) return { condition: "Light Rain", conditionSub: "Light drizzle expected", icon: "CloudRain" };
  if ([1186, 1189, 1192, 1195].includes(code)) return { condition: "Rainy", conditionSub: "Moderate to heavy rainfall", icon: "CloudRain" };
  if ([1087, 1273, 1276].includes(code)) return { condition: "Stormy", conditionSub: "Thunderstorms expected", icon: "Zap" };
  if ([1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) return { condition: "Snowy", conditionSub: "Snowfall expected", icon: "Cloud" };
  if ([1237, 1261, 1264].includes(code)) return { condition: "Hail", conditionSub: "Hailstorm warning", icon: "Zap" };
  if ([1069, 1072, 1168, 1171, 1198, 1201, 1204, 1207, 1240, 1243, 1246, 1249, 1252].includes(code)) return { condition: "Sleet", conditionSub: "Mixed precipitation", icon: "CloudRain" };
  if ([1279, 1282].includes(code)) return { condition: "Blizzard", conditionSub: "Severe winter storm", icon: "Wind" };
  return { condition: text, conditionSub: "Current weather conditions", icon: "Cloud" };
}

function mapForecastConditionIcon(code: number): string {
  if (code === 1000) return "Sun";
  if (code === 1003) return "CloudSun";
  if ([1006, 1009].includes(code)) return "Cloud";
  if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) return "CloudRain";
  if ([1087, 1273, 1276].includes(code)) return "Zap";
  if ([1114, 1117].includes(code)) return "Wind";
  return "Cloud";
}

function getDayName(dateStr: string): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date(dateStr).getDay()];
}

function determineTrend(forecastDays: any[]): string {
  if (forecastDays.length < 2) return "Stable";
  const firstHalf = forecastDays.slice(0, Math.ceil(forecastDays.length / 2));
  const secondHalf = forecastDays.slice(Math.ceil(forecastDays.length / 2));
  const avgFirst = firstHalf.reduce((s: number, d: any) => s + d.day.avgtemp_c, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s: number, d: any) => s + d.day.avgtemp_c, 0) / secondHalf.length;
  const diff = avgSecond - avgFirst;
  if (diff > 1.5) return "Warming";
  if (diff < -1.5) return "Cooling";
  return "Stable";
}

// ─── Fetch Weather ────────────────────────────────────────────────────────────

async function fetchCityWeather(city: string, apiKey: string): Promise<CityWeatherData> {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)},Pakistan&days=5&aqi=yes`;

  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(`WeatherAPI error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  const current = data.current;
  const forecast = data.forecast.forecastday;

  const { condition, conditionSub, icon } = mapCondition(
    current.condition.code,
    current.condition.text
  );

  // Calculate rain chance as max from forecast days
  const maxRainChance = Math.max(...forecast.map((d: any) => d.day.daily_chance_of_rain || 0));

  // Count wet days (>30% rain chance)
  const wetDays = forecast.filter((d: any) => (d.day.daily_chance_of_rain || 0) > 30).length;

  // Temp range from forecast
  const allHighs = forecast.map((d: any) => d.day.maxtemp_c);
  const allLows = forecast.map((d: any) => d.day.mintemp_c);
  const minTemp = Math.round(Math.min(...allLows));
  const maxTemp = Math.round(Math.max(...allHighs));

  // Build forecast days
  const forecastDays: ForecastDay[] = forecast.slice(0, 5).map((d: any) => ({
    day: getDayName(d.date),
    high: Math.round(d.day.maxtemp_c),
    low: Math.round(d.day.mintemp_c),
    condition: mapCondition(d.day.condition.code, d.day.condition.text).condition.split(" ")[0],
    icon: mapForecastConditionIcon(d.day.condition.code),
  }));

  const weatherData: CityWeatherData = {
    temp: Math.round(current.temp_c),
    feelsLike: Math.round(current.feelslike_c),
    condition,
    conditionSub,
    rainChance: maxRainChance,
    intensity: Math.min(100, Math.round((current.precip_mm / 10) * 100)),
    humidity: current.humidity,
    wind: `${Math.round(current.wind_kph)} km/h`,
    precip: `${current.precip_mm} mm`,
    uvIndex: `${current.uv} / 10`,
    pressure: `${Math.round(current.pressure_mb)} hPa`,
    visibility: `${current.vis_km} km`,
    confidence: `${Math.max(75, 98 - Math.round(maxRainChance * 0.15))}%`,
    trend: determineTrend(forecast),
    tempRange: `${minTemp}–${maxTemp}°`,
    wetDays,
    forecast: forecastDays,
    lastUpdated: current.last_updated,
  };

  return weatherData;
}

// ─── Fallback Data ────────────────────────────────────────────────────────────

const FALLBACK: Record<string, CityWeatherData> = {
  Islamabad: {
    temp: 27, feelsLike: 25, condition: "Stormy", conditionSub: "Heavy rainfall expected",
    rainChance: 82, intensity: 66, humidity: 78, wind: "18 km/h", precip: "9.2 mm",
    uvIndex: "0 / 10", pressure: "1008 hPa", visibility: "4.2 km", confidence: "91%",
    trend: "Cooling", tempRange: "18–30°", wetDays: 3, lastUpdated: "",
    forecast: [
      { day: "Mon", icon: "CloudRain", high: 26, low: 19, condition: "Rain" },
      { day: "Tue", icon: "Zap", high: 29, low: 22, condition: "Storm" },
      { day: "Wed", icon: "Cloud", high: 28, low: 20, condition: "Cloud" },
      { day: "Thu", icon: "Sun", high: 30, low: 23, condition: "Sun" },
      { day: "Fri", icon: "CloudRain", high: 27, low: 18, condition: "Rain" },
    ],
  },
  Karachi: {
    temp: 34, feelsLike: 38, condition: "Hazy Sun", conditionSub: "High humidity, coastal haze",
    rainChance: 12, intensity: 20, humidity: 85, wind: "22 km/h", precip: "0.1 mm",
    uvIndex: "9 / 10", pressure: "1012 hPa", visibility: "6.8 km", confidence: "88%",
    trend: "Warming", tempRange: "28–36°", wetDays: 0, lastUpdated: "",
    forecast: [
      { day: "Mon", icon: "CloudSun", high: 34, low: 27, condition: "Hazy" },
      { day: "Tue", icon: "Sun", high: 36, low: 28, condition: "Sun" },
      { day: "Wed", icon: "Sun", high: 35, low: 28, condition: "Sun" },
      { day: "Thu", icon: "CloudSun", high: 33, low: 26, condition: "Partly" },
      { day: "Fri", icon: "CloudSun", high: 32, low: 26, condition: "Partly" },
    ],
  },
  Lahore: {
    temp: 31, feelsLike: 33, condition: "Partly Cloudy", conditionSub: "Warm with cloud cover",
    rainChance: 28, intensity: 15, humidity: 60, wind: "12 km/h", precip: "1.4 mm",
    uvIndex: "6 / 10", pressure: "1010 hPa", visibility: "8.1 km", confidence: "85%",
    trend: "Stable", tempRange: "22–33°", wetDays: 1, lastUpdated: "",
    forecast: [
      { day: "Mon", icon: "CloudSun", high: 31, low: 22, condition: "Partly" },
      { day: "Tue", icon: "CloudRain", high: 28, low: 20, condition: "Rain" },
      { day: "Wed", icon: "Cloud", high: 27, low: 19, condition: "Cloud" },
      { day: "Thu", icon: "Sun", high: 33, low: 23, condition: "Sun" },
      { day: "Fri", icon: "Sun", high: 34, low: 24, condition: "Sun" },
    ],
  },
  Peshawar: {
    temp: 29, feelsLike: 27, condition: "Windy", conditionSub: "Strong northerly gusts",
    rainChance: 35, intensity: 22, humidity: 55, wind: "34 km/h", precip: "2.8 mm",
    uvIndex: "5 / 10", pressure: "1005 hPa", visibility: "10 km", confidence: "79%",
    trend: "Cooling", tempRange: "19–31°", wetDays: 2, lastUpdated: "",
    forecast: [
      { day: "Mon", icon: "Wind", high: 29, low: 19, condition: "Windy" },
      { day: "Tue", icon: "CloudRain", high: 26, low: 17, condition: "Rain" },
      { day: "Wed", icon: "CloudSun", high: 28, low: 18, condition: "Partly" },
      { day: "Thu", icon: "Sun", high: 31, low: 20, condition: "Sun" },
      { day: "Fri", icon: "Sun", high: 30, low: 20, condition: "Sun" },
    ],
  },
  Quetta: {
    temp: 22, feelsLike: 19, condition: "Clear", conditionSub: "Cool mountain air",
    rainChance: 8, intensity: 5, humidity: 38, wind: "9 km/h", precip: "0.0 mm",
    uvIndex: "7 / 10", pressure: "870 hPa", visibility: "25 km", confidence: "94%",
    trend: "Stable", tempRange: "12–24°", wetDays: 0, lastUpdated: "",
    forecast: [
      { day: "Mon", icon: "Sun", high: 22, low: 10, condition: "Clear" },
      { day: "Tue", icon: "Sun", high: 24, low: 11, condition: "Clear" },
      { day: "Wed", icon: "CloudSun", high: 21, low: 9, condition: "Partly" },
      { day: "Thu", icon: "Cloud", high: 18, low: 8, condition: "Cloud" },
      { day: "Fri", icon: "CloudRain", high: 17, low: 7, condition: "Rain" },
    ],
  },
};

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const apiKey = process.env.WEATHERAPI_KEY;

  const CITIES = ["Karachi", "Islamabad", "Lahore", "Peshawar", "Quetta"];

  // If a specific city is requested
  if (city) {
    if (!CITIES.includes(city)) {
      return NextResponse.json({ error: "Invalid city" }, { status: 400 });
    }

    // Check cache first
    const cached = getCached(city);
    if (cached) {
      return NextResponse.json({ [city]: cached, source: "cache" });
    }

    // Fetch live data
    if (!apiKey) {
      console.warn("[Weather API] No WEATHERAPI_KEY set, using fallback data");
      return NextResponse.json({ [city]: FALLBACK[city], source: "fallback" });
    }

    try {
      const data = await fetchCityWeather(city, apiKey);
      setCache(city, data);
      return NextResponse.json({ [city]: data, source: "live" });
    } catch (error: any) {
      console.error(`[Weather API] Error fetching ${city}:`, error.message);
      return NextResponse.json({ [city]: FALLBACK[city], source: "fallback" });
    }
  }

  // Fetch all cities
  if (!apiKey) {
    console.warn("[Weather API] No WEATHERAPI_KEY set, using fallback data for all cities");
    return NextResponse.json({ data: FALLBACK, source: "fallback" });
  }

  const result: Record<string, CityWeatherData> = {};
  let source = "live";

  await Promise.all(
    CITIES.map(async (c) => {
      // Check cache
      const cached = getCached(c);
      if (cached) {
        result[c] = cached;
        return;
      }

      try {
        const data = await fetchCityWeather(c, apiKey);
        setCache(c, data);
        result[c] = data;
      } catch (error: any) {
        console.error(`[Weather API] Error fetching ${c}:`, error.message);
        result[c] = FALLBACK[c];
        source = "partial";
      }
    })
  );

  return NextResponse.json({ data: result, source });
}
