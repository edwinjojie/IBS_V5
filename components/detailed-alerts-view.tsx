"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Clock, Plane, MapPin, X, RefreshCw, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface Alert {
  id: string
  type: "weather" | "technical" | "operational" | "security" | "maintenance"
  severity: "low" | "medium" | "high" | "critical"
  status: "active" | "resolved" | "acknowledged"
  title: string
  description: string
  timestamp: string
  affectedFlights: string[]
  location: string
  priority: "low" | "medium" | "high"
  assignedTo?: string
  estimatedResolution?: string
}

export function DetailedAlertsView() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    loadAlerts()
  }, [])

  useEffect(() => {
    filterAlerts()
  }, [alerts, searchQuery, typeFilter, severityFilter, statusFilter])

  const loadAlerts = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/alerts")
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error("Failed to load alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAlerts = () => {
    let filtered = alerts

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.affectedFlights.some(flight => flight.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(alert => alert.type === typeFilter)
    }

    // Severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter(alert => alert.severity === severityFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(alert => alert.status === statusFilter)
    }

    setFilteredAlerts(filtered)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500 text-white"
      case "high": return "bg-orange-500 text-white"
      case "medium": return "bg-yellow-500 text-white"
      case "low": return "bg-green-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "weather": return "🌩️"
      case "technical": return "🔧"
      case "operational": return "✈️"
      case "security": return "🔒"
      case "maintenance": return "🛠️"
      default: return "⚠️"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-100 text-red-800 border-red-200"
      case "resolved": return "bg-green-100 text-green-800 border-green-200"
      case "acknowledged": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alerts Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time monitoring of all system alerts and notifications
          </p>
        </div>
        <Button onClick={loadAlerts} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="weather">Weather</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Severity</label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                  <div>
                    <CardTitle className="text-lg">{alert.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {alert.description}
              </p>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{new Date(alert.timestamp).toLocaleString()}</span>
              </div>

              {alert.location && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{alert.location}</span>
                </div>
              )}

              {alert.affectedFlights.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Plane className="h-4 w-4" />
                    <span>Affected Flights:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {alert.affectedFlights.map((flight) => (
                      <Badge key={flight} variant="secondary" className="text-xs">
                        {flight}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {alert.assignedTo && (
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Assigned to:</span> {alert.assignedTo}
                </div>
              )}

              {alert.estimatedResolution && (
                <div className="text-sm text-gray-500">
                  <span className="font-medium">ETA:</span> {alert.estimatedResolution}
                </div>
              )}

              <Separator />

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  Acknowledge
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Resolve
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <AlertTriangle className="h-12 w-4 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No alerts found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filters or search criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
