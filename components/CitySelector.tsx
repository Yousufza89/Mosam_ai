"use client";

import { CITY_DATA, type City } from "@/data/weatherData";

type CitySelectorProps = {
  selected: City;
  onSelect: (city: City) => void;
};

export default function CitySelector({ selected, onSelect }: CitySelectorProps) {
  const cities = Object.keys(CITY_DATA) as City[];

  return (
    <div className="flex flex-wrap gap-2">
      {cities.map((city) => (
        <button
          key={city}
          type="button"
          onClick={() => onSelect(city)}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            selected === city
              ? "bg-primary text-primary-foreground"
              : "weather-glass text-foreground"
          }`}
        >
          {city}
        </button>
      ))}
    </div>
  );
}
