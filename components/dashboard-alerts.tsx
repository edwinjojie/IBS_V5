"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Info, Cloud, Shield, Clock, AlertTriangle, Settings, Fuel, Users, ChevronRight, X } from "lucide-react"

interface Alert {
  id: string
  type: "weather" | "security" | "delay" | "accident" | "operational" | "fuel" | "crew"
  title: string
  message: string
  timestamp: string
  status: "active" | "resolved" | "monitoring"
  severity: "critical" | "high" | "medium" | "low"
  affectedFlights: string[]
  estimatedDuration?: string
}

interface DashboardAlertsProps {
  onViewAll: () => void
}

export function DashboardAlerts({ onViewAll }: DashboardAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadImportantAlerts()
  }, [])

  const loadImportantAlerts = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:3001/api/alerts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const allAlerts = await response.json()
      const importantAlerts = allAlerts
        .filter((alert: Alert) => alert.status === "active" && (alert.severity === "critical" || alert.severity === "high"))
        .slice(0, 5)
      setAlerts(importantAlerts)
    } catch (error) {
      console.error("Failed to load alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
  }

  const getAlertIcon = (type: Alert["type"]) => {
    const iconMap = {
      weather: <Cloud className="h-4 w-4" />,
      security: <Shield className="h-4 w-4" />,
      delay: <Clock className="h-4 w-4" />,
      accident: <AlertTriangle className="h-4 w-4" />,
      operational: <Settings className="h-4 w-4" />,
      fuel: <Fuel className="h-4 w-4" />,
      crew: <Users className="h-4 w-4" />,
    }
    return iconMap[type] || <Info className="h-4 w-4" />
  }

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "text-red-500 border-red-500/30 bg-red-500/10"
      case "high":
        return "text-orange-500 border-orange-500/30 bg-orange-500/10"
      case "medium":
        return "text-yellow-500 border-yellow-500/30 bg-yellow-500/10"
      case "low":
        return "text-blue-500 border-blue-500/30 bg-blue-500/10"
      default:
        return "text-gray-500 border-gray-500/30 bg-gray-500/10"
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const diff = now.getTime() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 1000 / 60)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`
    return `${Math.floor(hours / 24)} day${hours >= 48 ? "s" : ""} ago`
  }

  if (loading) {
    return (
      <Card className="p-4 bg-background/60 backdrop-blur-md border-border/50">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">Loading alerts...</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-background/60 backdrop-blur-md border-border/50">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Critical Alerts</h3>
            <p className="text-sm text-muted-foreground">{alerts.length} active high-priority alerts</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-primary hover:text-primary">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-green-500 mb-2">
              <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">No critical alerts</p>
            <p className="text-xs text-muted-foreground">All systems operating normally</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)} backdrop-blur-sm`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-0.5 flex-shrink-0">{getAlertIcon(alert.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground text-sm truncate">{alert.title}</h4>
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize flex-shrink-0 ${
                              alert.severity === "critical"
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                            }`}
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{alert.message}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <span>{getTimeAgo(alert.timestamp)}</span>
                            {alert.affectedFlights.length > 0 && (
                              <span>
                                {alert.affectedFlights.length} flight{alert.affectedFlights.length !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          {alert.estimatedDuration && (
                            <span className="text-xs bg-background/50 px-2 py-1 rounded">
                              {alert.estimatedDuration}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground flex-shrink-0"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {alerts.length} of critical alerts</span>
            <Button variant="ghost" size="sm" onClick={loadImportantAlerts} className="text-xs h-6 px-2">
              Refresh
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}