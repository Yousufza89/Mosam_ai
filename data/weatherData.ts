export type City = "Karachi" | "Islamabad" | "Lahore" | "Peshawar" | "Quetta";

export type ForecastDay = {
  day: string;
  icon: string;
  high: number;
  low: number;
  condition: string;
};

export type CityWeatherData = {
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

export const CITY_DATA: Record<City, CityWeatherData> = {
  Islamabad: {
    temp: 27,
    feelsLike: 25,
    condition: "Stormy",
    conditionSub: "Heavy rainfall expected",
    rainChance: 82,
    intensity: 66,
    humidity: 78,
    wind: "18 km/h",
    precip: "9.2 mm",
    uvIndex: "0 / 10",
    pressure: "1008 hPa",
    visibility: "4.2 km",
    confidence: "91%",
    trend: "Cooling",
    tempRange: "18–30°",
    wetDays: 3,
    forecast: [
      { day: "Mon", icon: "🌧️", high: 26, low: 19, condition: "Rain" },
      { day: "Tue", icon: "⛈️", high: 29, low: 22, condition: "Storm" },
      { day: "Wed", icon: "☁️", high: 28, low: 20, condition: "Cloud" },
      { day: "Thu", icon: "☀️", high: 30, low: 23, condition: "Sun" },
      { day: "Fri", icon: "🌧️", high: 27, low: 18, condition: "Rain" },
    ],
  },
  Karachi: {
    temp: 34,
    feelsLike: 38,
    condition: "Hazy Sun",
    conditionSub: "High humidity, coastal haze",
    rainChance: 12,
    intensity: 20,
    humidity: 85,
    wind: "22 km/h",
    precip: "0.1 mm",
    uvIndex: "9 / 10",
    pressure: "1012 hPa",
    visibility: "6.8 km",
    confidence: "88%",
    trend: "Warming",
    tempRange: "28–36°",
    wetDays: 0,
    forecast: [
      { day: "Mon", icon: "🌤️", high: 34, low: 27, condition: "Hazy" },
      { day: "Tue", icon: "☀️", high: 36, low: 28, condition: "Sun" },
      { day: "Wed", icon: "☀️", high: 35, low: 28, condition: "Sun" },
      { day: "Thu", icon: "🌤️", high: 33, low: 26, condition: "Partly" },
      { day: "Fri", icon: "🌤️", high: 32, low: 26, condition: "Partly" },
    ],
  },
  Lahore: {
    temp: 31,
    feelsLike: 33,
    condition: "Partly Cloudy",
    conditionSub: "Warm with cloud cover",
    rainChance: 28,
    intensity: 15,
    humidity: 60,
    wind: "12 km/h",
    precip: "1.4 mm",
    uvIndex: "6 / 10",
    pressure: "1010 hPa",
    visibility: "8.1 km",
    confidence: "85%",
    trend: "Stable",
    tempRange: "22–33°",
    wetDays: 1,
    forecast: [
      { day: "Mon", icon: "⛅", high: 31, low: 22, condition: "Partly" },
      { day: "Tue", icon: "🌧️", high: 28, low: 20, condition: "Rain" },
      { day: "Wed", icon: "☁️", high: 27, low: 19, condition: "Cloud" },
      { day: "Thu", icon: "☀️", high: 33, low: 23, condition: "Sun" },
      { day: "Fri", icon: "☀️", high: 34, low: 24, condition: "Sun" },
    ],
  },
  Peshawar: {
    temp: 29,
    feelsLike: 27,
    condition: "Windy",
    conditionSub: "Strong northerly gusts",
    rainChance: 35,
    intensity: 22,
    humidity: 55,
    wind: "34 km/h",
    precip: "2.8 mm",
    uvIndex: "5 / 10",
    pressure: "1005 hPa",
    visibility: "10 km",
    confidence: "79%",
    trend: "Cooling",
    tempRange: "19–31°",
    wetDays: 2,
    forecast: [
      { day: "Mon", icon: "💨", high: 29, low: 19, condition: "Windy" },
      { day: "Tue", icon: "🌧️", high: 26, low: 17, condition: "Rain" },
      { day: "Wed", icon: "⛅", high: 28, low: 18, condition: "Partly" },
      { day: "Thu", icon: "☀️", high: 31, low: 20, condition: "Sun" },
      { day: "Fri", icon: "☀️", high: 30, low: 20, condition: "Sun" },
    ],
  },
  Quetta: {
    temp: 22,
    feelsLike: 19,
    condition: "Clear",
    conditionSub: "Cool mountain air",
    rainChance: 8,
    intensity: 5,
    humidity: 38,
    wind: "9 km/h",
    precip: "0.0 mm",
    uvIndex: "7 / 10",
    pressure: "870 hPa",
    visibility: "25 km",
    confidence: "94%",
    trend: "Stable",
    tempRange: "12–24°",
    wetDays: 0,
    forecast: [
      { day: "Mon", icon: "☀️", high: 22, low: 10, condition: "Clear" },
      { day: "Tue", icon: "☀️", high: 24, low: 11, condition: "Clear" },
      { day: "Wed", icon: "⛅", high: 21, low: 9, condition: "Partly" },
      { day: "Thu", icon: "☁️", high: 18, low: 8, condition: "Cloud" },
      { day: "Fri", icon: "🌧️", high: 17, low: 7, condition: "Rain" },
    ],
  },
};