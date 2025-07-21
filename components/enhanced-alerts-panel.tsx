"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Cloud,
  Wrench,
  Shield,
  Settings,
  Fuel,
  Users,
  Filter,
  RefreshCw,
} from "lucide-react"
import { alertAPI, getTimeAgo, type Alert } from "@/services/api"

export function EnhancedAlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const data = await alertAPI.getAlerts()
      setAlerts(data)
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
      maintenance: <Wrench className="h-4 w-4" />,
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

  const getStatusColor = (status: Alert["status"]) => {
    switch (status) {
      case "active":
        return "text-red-400 bg-red-500/20"
      case "resolved":
        return "text-green-400 bg-green-500/20"
      case "monitoring":
        return "text-yellow-400 bg-yellow-500/20"
      default:
        return "text-gray-400 bg-gray-500/20"
    }
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab !== "all" && alert.type !== activeTab) return false
    if (severityFilter !== "all" && alert.severity !== severityFilter) return false
    return true
  })

  const alertTypes = [
    { id: "all", label: "All Alerts", icon: Info },
    { id: "weather", label: "Weather", icon: Cloud },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "security", label: "Security", icon: Shield },
    { id: "delay", label: "Delays", icon: Clock },
    { id: "accident", label: "Accidents", icon: AlertTriangle },
    { id: "operational", label: "Operations", icon: Settings },
    { id: "fuel", label: "Fuel", icon: Fuel },
    { id: "crew", label: "Crew", icon: Users },
  ]

  if (loading) {
    return (
      <Card className="p-6 bg-background/60 backdrop-blur-md border-border/50">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Loading alerts...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">System Alerts</h2>
          <p className="text-sm text-muted-foreground">
            {filteredAlerts.length} alerts • {alerts.filter((a) => a.status === "active").length} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAlerts}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-1 text-sm bg-background/60 border border-border/50 rounded-md"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Alert Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-9 bg-background/60 backdrop-blur-md">
          {alertTypes.map((type) => {
            const Icon = type.icon
            const count = type.id === "all" ? alerts.length : alerts.filter((a) => a.type === type.id).length
            return (
              <TabsTrigger key={type.id} value={type.id} className="text-xs">
                <Icon className="h-3 w-3 mr-1" />
                {type.label}
                {count > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredAlerts.length === 0 ? (
            <Card className="p-8 bg-background/60 backdrop-blur-md border-border/50">
              <div className="text-center text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>No {activeTab === "all" ? "" : activeTab} alerts</p>
              </div>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredAlerts.map((alert) => (
                  <Card key={alert.id} className={`p-4 ${getSeverityColor(alert.severity)} backdrop-blur-md`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-foreground">{alert.title}</h4>
                            <Badge variant="outline" className={getStatusColor(alert.status)}>
                              {alert.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{alert.message}</p>

                          {/* Alert Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>
                              <strong>Source:</strong> {alert.source}
                            </div>
                            <div>
                              <strong>Time:</strong> {getTimeAgo(alert.timestamp)}
                            </div>
                            {alert.affectedAirports.length > 0 && (
                              <div>
                                <strong>Airports:</strong> {alert.affectedAirports.join(", ")}
                              </div>
                            )}
                            {alert.affectedFlights.length > 0 && (
                              <div>
                                <strong>Flights:</strong> {alert.affectedFlights.slice(0, 3).join(", ")}
                                {alert.affectedFlights.length > 3 && ` +${alert.affectedFlights.length - 3} more`}
                              </div>
                            )}
                            {alert.estimatedDuration && (
                              <div>
                                <strong>Duration:</strong> {alert.estimatedDuration}
                              </div>
                            )}
                            {alert.aircraft && (
                              <div>
                                <strong>Aircraft:</strong> {alert.aircraft}
                              </div>
                            )}
                          </div>

                          {/* Additional Info */}
                          {(alert.recommendations || alert.additionalInfo || alert.reason) && (
                            <div className="mt-3 p-2 bg-background/30 rounded text-xs">
                              {alert.recommendations && (
                                <div>
                                  <strong>Recommendations:</strong> {alert.recommendations}
                                </div>
                              )}
                              {alert.additionalInfo && (
                                <div>
                                  <strong>Additional Info:</strong> {alert.additionalInfo}
                                </div>
                              )}
                              {alert.reason && (
                                <div>
                                  <strong>Reason:</strong> {alert.reason}
                                </div>
                              )}
                            </div>
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
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
