import React from "react";
import { Card } from "@/components/ui/card";
import { CloudSun, CloudRain, Sun, Cloud, Wind, Droplets, Thermometer } from "lucide-react";

/**
 * Project Context & Coding Guidelines:
 * - This component is part of a modern web application dashboard.
 * - UI/UX should match the flights table and detail views: card-based, clean, and visually informative.
 * - Modular, maintainable, and leverages latest ECMAScript and React features.
 * - Consistent use of icons, colors, spacing, and typography.
 * - Comments included for clarity.
 */

// Dummy weather data for dashboard
const weatherData = [
	{
		airport: "JFK",
		temperature: 27,
		condition: "Sunny",
		wind: "12 km/h SW",
		humidity: 55,
		updated: "2025-09-02 09:30",
		icon: <Sun className="h-8 w-8 text-yellow-400" />,
	},
	{
		airport: "LHR",
		temperature: 19,
		condition: "Cloudy",
		wind: "8 km/h NW",
		humidity: 68,
		updated: "2025-09-02 09:30",
		icon: <Cloud className="h-8 w-8 text-gray-400" />,
	},
	{
		airport: "DXB",
		temperature: 34,
		condition: "Clear",
		wind: "5 km/h E",
		humidity: 40,
		updated: "2025-09-02 09:30",
		icon: <CloudSun className="h-8 w-8 text-yellow-300" />,
	},
	{
		airport: "HND",
		temperature: 23,
		condition: "Rain",
		wind: "15 km/h S",
		humidity: 80,
		updated: "2025-09-02 09:30",
		icon: <CloudRain className="h-8 w-8 text-blue-400" />,
	},
];

// Utility for condition color
const getConditionColor = (condition: string) => {
	switch (condition) {
		case "Sunny":
			return "bg-yellow-50 border-yellow-300 text-yellow-700";
		case "Cloudy":
			return "bg-gray-50 border-gray-300 text-gray-700";
		case "Clear":
			return "bg-blue-50 border-blue-300 text-blue-700";
		case "Rain":
			return "bg-blue-100 border-blue-400 text-blue-700";
		default:
			return "bg-muted border-border text-foreground";
	}
};

/**
 * WeatherDashboard - visually rich weather dashboard for airports.
 * - Card-based layout, matching dashboard theme.
 * - Uses icons, color, and spacing for clarity.
 * - Responsive grid.
 */
export function WeatherDashboard() {
	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
			{weatherData.map((weather) => (
				<Card
					key={weather.airport}
					className={`p-6 border-2 rounded-xl shadow-sm transition hover:shadow-lg ${getConditionColor(
						weather.condition
					)}`}
				>
					{/* Header: Airport & Last Updated */}
					<div className="flex items-center justify-between mb-2">
						<span className="font-bold text-lg">{weather.airport}</span>
						<span className="text-xs text-muted-foreground">
							{weather.updated}
						</span>
					</div>
					{/* Main Weather Icon & Temperature */}
					<div className="flex items-center gap-4 mb-4">
						<div className="flex items-center justify-center">
							{weather.icon}
						</div>
						<span className="text-4xl font-extrabold">
							{weather.temperature}°C
						</span>
					</div>
					{/* Condition Label */}
					<div className="mb-4">
						<span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/60 text-base font-medium border border-border">
							<Thermometer className="h-4 w-4 text-muted-foreground" />
							{weather.condition}
						</span>
					</div>
					{/* Details: Wind & Humidity */}
					<div className="flex gap-6 text-sm text-muted-foreground mb-2">
						<span className="flex items-center gap-1">
							<Wind className="h-4 w-4" />
							{weather.wind}
						</span>
						<span className="flex items-center gap-1">
							<Droplets className="h-4 w-4" />
							{weather.humidity}%
						</span>
					</div>
				</Card>
			))}
		</div>
	);
}