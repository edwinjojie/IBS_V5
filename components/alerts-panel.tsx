"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, AlertTriangle, Info, CheckCircle, Clock } from "lucide-react"

interface Alert {
  id: string
  type: "warning" | "info" | "success" | "error"
  title: string
  message: string
  timestamp: string
  dismissed?: boolean
}

const initialAlerts: Alert[] = [
  {
    id: "1",
    type: "warning",
    title: "Weather Alert",
    message: "Thunderstorms expected at JFK between 15:00-17:00. Consider delays.",
    timestamp: "2 min ago",
  },
  {
    id: "2",
    type: "info",
    title: "Gate Change",
    message: "Flight AA1234 gate changed from A12 to A15.",
    timestamp: "5 min ago",
  },
  {
    id: "3",
    type: "error",
    title: "Maintenance Required",
    message: "Aircraft N123AA requires immediate inspection before next flight.",
    timestamp: "10 min ago",
  },
]

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
  }

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getAlertColor = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return "border-yellow-500/30 bg-yellow-500/10"
      case "info":
        return "border-blue-500/30 bg-blue-500/10"
      case "success":
        return "border-green-500/30 bg-green-500/10"
      case "error":
        return "border-red-500/30 bg-red-500/10"
      default:
        return "border-border/50 bg-background/50"
    }
  }

  if (alerts.length === 0) {
    return (
      <Card className="p-4 bg-background/60 backdrop-blur-md border-border/50">
        <div className="text-center text-muted-foreground">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <p>No active alerts</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card key={alert.id} className={`p-4 ${getAlertColor(alert.type)} backdrop-blur-md`}>
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
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
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
      ))}
    </div>
  )
}
