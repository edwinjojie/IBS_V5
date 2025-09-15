import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CloudSun,
  CloudRain,
  Sun,
  Cloud,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";

/**
 * Dummy weather data for dashboard
 */
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

/**
 * Dummy weather alerts data (detailed, matching AlertsPanel)
 */
const initialWeatherAlerts = [
  {
    id: "1",
    type: "warning",
    title: "Severe Thunderstorm",
    message:
      "Thunderstorm expected at JFK between 14:00 and 18:00. Possible delays for arrivals and departures.",
    airport: "JFK",
    timestamp: "13 min ago",
    details: "Lightning and heavy rain likely. Monitor ATC updates.",
  },
  {
    id: "2",
    type: "info",
    title: "Fog Advisory",
    message: "Dense fog at LHR in the morning. Visibility below 500m.",
    airport: "LHR",
    timestamp: "1 hour ago",
    details: "Low visibility may affect landing schedules. Use instrument approach.",
  },
  {
    id: "3",
    type: "error",
    title: "Heat Warning",
    message: "High temperatures expected at DXB. Stay hydrated.",
    airport: "DXB",
    timestamp: "2 hours ago",
    details: "Ground operations may be affected. Check aircraft cooling systems.",
  },
];

/**
 * Utility for condition color
 */
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
 * Utility for alert color
 */
const getAlertColor = (type: string) => {
  switch (type) {
    case "warning":
      return "border-yellow-500/30 bg-yellow-500/10";
    case "info":
      return "border-blue-500/30 bg-blue-500/10";
    case "success":
      return "border-green-500/30 bg-green-500/10";
    case "error":
      return "border-red-500/30 bg-red-500/10";
    default:
      return "border-border/50 bg-background/50";
  }
};

/**
 * Utility for alert icon
 */
const getAlertIcon = (type: string) => {
  switch (type) {
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "info":
      return <Info className="h-4 w-4 text-blue-500" />;
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "error":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

/**
 * WeatherDashboard - visually rich weather dashboard for airports.
 * - Card-based layout, matching dashboard theme.
 * - Weather alerts section styled and detailed like AlertsPanel.
 */
export function WeatherDashboard() {
  const [weatherAlerts, setWeatherAlerts] = useState(initialWeatherAlerts);

  // Dismiss alert handler
  const dismissAlert = (alertId: string) => {
    setWeatherAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  return (
    <div>
      {/* Weather Overview */}
      
      <div className="mb-8">
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
      </div>
      {/* Weather Alerts Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Weather Alerts
        </h3>
        <div className="space-y-3">
          {weatherAlerts.length === 0 ? (
            <Card className="p-4 bg-background/60 backdrop-blur-md border-border/50">
              <div className="text-center text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>No active weather alerts</p>
              </div>
            </Card>
          ) : (
            weatherAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`p-4 ${getAlertColor(alert.type)} backdrop-blur-md`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{alert.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {alert.timestamp}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {alert.airport}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      {alert.details && (
                        <p className="text-xs mt-1 text-muted-foreground">
                          <Info className="inline h-3 w-3 mr-1" />
                          {alert.details}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}