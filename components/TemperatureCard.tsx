"use client";

import type { City, CityWeatherData } from "@/data/weatherData";

type TemperatureCardProps = {
  city: City;
  data: CityWeatherData;
};

export default function TemperatureCard({ city, data }: TemperatureCardProps) {
  const todayForecast = data.forecast[0];

  return (
    <div className="weather-glass rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {city}
          </p>
          <p className="font-heading text-4xl font-bold text-foreground">
            {data.temp}°
          </p>
          <p className="text-xs text-muted-foreground">
            Feels like {data.feelsLike}°
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>H {todayForecast?.high ?? data.temp}°</p>
          <p>L {todayForecast?.low ?? data.feelsLike}°</p>
        </div>
      </div>
      <div className="mt-4 h-1 w-full rounded-full bg-foreground/10">
        <div className="h-1 w-2/3 rounded-full bg-primary" />
      </div>
    </div>
  );
}
