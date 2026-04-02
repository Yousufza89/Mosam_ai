"use client";

import type { CityWeather } from "@/data/weatherData";

type WeatherStatsProps = {
  data: CityWeather;
};

export default function WeatherStats({ data }: WeatherStatsProps) {
  const stats = [
    { label: "Humidity", value: `${data.humidity}%` },
    { label: "Wind", value: `${data.windSpeed} km/h` },
    { label: "Precip", value: `${data.precipitation} mm` },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat) => (
        <div key={stat.label} className="weather-glass rounded-xl px-3 py-3 text-center">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
            {stat.label}
          </p>
          <p className="text-xs font-semibold text-foreground mt-1">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
