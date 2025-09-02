import React from "react";

// Dummy weather data for dashboard
const weatherData = [
  {
    airport: "JFK",
    temperature: 27,
    condition: "Sunny",
    wind: "12 km/h SW",
    humidity: 55,
    updated: "2025-09-02 09:30",
  },
  {
    airport: "LHR",
    temperature: 19,
    condition: "Cloudy",
    wind: "8 km/h NW",
    humidity: 68,
    updated: "2025-09-02 09:30",
  },
  {
    airport: "DXB",
    temperature: 34,
    condition: "Clear",
    wind: "5 km/h E",
    humidity: 40,
    updated: "2025-09-02 09:30",
  },
  {
    airport: "HND",
    temperature: 23,
    condition: "Rain",
    wind: "15 km/h S",
    humidity: 80,
    updated: "2025-09-02 09:30",
  },
];

export function WeatherDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {weatherData.map((weather) => (
        <div key={weather.airport} className="bg-background border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-lg">{weather.airport}</span>
            <span className="text-sm text-muted-foreground">{weather.updated}</span>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-3xl font-semibold">{weather.temperature}°C</span>
            <span className="text-md">{weather.condition}</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span>Wind: {weather.wind}</span>
            <span>Humidity: {weather.humidity}%</span>
          </div>
        </div>
      ))}
    </div>
    );
  }