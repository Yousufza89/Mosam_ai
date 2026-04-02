"use client";

import type { City, ForecastDay } from "@/data/weatherData";

type WeeklyForecastProps = {
  forecast: ForecastDay[];
  city: City;
};

export default function WeeklyForecast({ forecast, city }: WeeklyForecastProps) {
  return (
    <div className="weather-glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Weekly</p>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {city} Outlook
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">Next 5 days</p>
      </div>
      <div className="space-y-3">
        {forecast.map((day) => (
          <div
            key={day.day}
            className="flex items-center justify-between rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2"
          >
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {day.day}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {day.high}°
              </p>
            </div>
            <div className="text-right text-[11px] text-muted-foreground">
              <p>{day.condition}</p>
              <p>
                {day.low}° / {day.high}°
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
