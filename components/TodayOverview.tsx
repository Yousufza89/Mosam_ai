"use client";

import type { CityWeatherData } from "@/data/weatherData";

type TodayOverviewProps = {
  data: CityWeatherData;
};

export default function TodayOverview({ data }: TodayOverviewProps) {
  const items = [
    { label: "Trend", value: data.trend },
    { label: "Condition", value: data.condition },
    { label: "Pressure", value: data.pressure },
    { label: "Visibility", value: data.visibility },
    { label: "UV Index", value: data.uvIndex },
    { label: "Rain", value: `${data.rainChance}%` },
  ];

  return (
    <div className="weather-glass rounded-2xl p-5">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Today</p>
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Overview
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {item.label}
            </p>
            <p className="text-xs font-semibold text-foreground mt-1">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
