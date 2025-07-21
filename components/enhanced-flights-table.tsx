"use client"

import { useState, useEffect } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plane, Clock, MapPin, Users, Fuel, Search, Filter, RefreshCw, Eye, AlertCircle, X } from "lucide-react"
import { flightAPI, alertAPI, getTimeAgo, type Flight, type Alert } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function EnhancedFlightsTable() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [flightsData, alertsData] = await Promise.all([flightAPI.getFlights(), alertAPI.getAlerts()])
      setFlights(flightsData)
      setAlerts(alertsData)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Flight["status"]) => {
    switch (status) {
      case "On Time":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Delayed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Boarding":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Departed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Cancelled":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getPriorityColor = (priority: Flight["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getFlightAlerts = (flightNumber: string): Alert[] => {
    return alerts.filter((alert) => alert.affectedFlights.includes(flightNumber) && alert.status === "active")
  }

  const filteredFlights = flights.filter((flight) => {
    const matchesSearch =
      searchQuery === "" ||
      flight.flight.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.airline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.route.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || flight.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="bg-background/60 backdrop-blur-md border border-border/50 rounded-lg p-6">
        <div className="flex flex-col gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full bg-muted" />
              <Skeleton className="h-4 w-32 bg-muted" />
              <Skeleton className="h-4 w-20 bg-muted" />
              <Skeleton className="h-4 w-16 bg-muted" />
              <Skeleton className="h-4 w-24 bg-muted" />
              <Skeleton className="h-4 w-16 bg-muted" />
              <Skeleton className="h-4 w-12 bg-muted" />
              <Skeleton className="h-8 w-8 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/40 backdrop-blur-sm border-border/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-background/60 border border-border/50 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="On Time">On Time</option>
            <option value="Delayed">Delayed</option>
            <option value="Boarding">Boarding</option>
            <option value="Departed">Departed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredFlights.length} of {flights.length} flights
      </div>

      {/* Table */}
      <div className="bg-background/60 backdrop-blur-md border border-border/50 rounded-lg">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="text-muted-foreground">Flight</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Schedule</TableHead>
                <TableHead className="text-muted-foreground">Progress</TableHead>
                <TableHead className="text-muted-foreground">Aircraft</TableHead>
                <TableHead className="text-muted-foreground">Passengers</TableHead>
                <TableHead className="text-muted-foreground">Alerts</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFlights.map((flight) => {
                const flightAlerts = getFlightAlerts(flight.flight)
                return (
                  <TableRow key={flight.id} className="border-border/50 hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedFlight(flight)}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-primary/20">
                          <Plane className="h-4 w-4 text-primary" />
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{flight.flight}</div>
                          <div className="text-xs text-muted-foreground">{flight.airline}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {flight.route}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(flight.status)}>
                        {flight.status}
                      </Badge>
                      {flight.cancellationReason && (
                        <div className="text-xs text-red-400 mt-1">{flight.cancellationReason}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>Dep: {flight.scheduled}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Actual: {flight.actual}</div>
                        <div className="text-xs text-muted-foreground">Est Arr: {flight.estimatedArrival}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2 max-w-[80px]">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${flight.progress}%` }}
                          />
                        </div>
                        <span className="text-sm min-w-[35px]">{flight.progress}%</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 w-3 rounded-full ${
                              i < (flight.priority === "high" ? 3 : flight.priority === "medium" ? 2 : 1)
                                ? getPriorityColor(flight.priority)
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="space-y-1 text-xs">
                        <div>{flight.aircraft}</div>
                        <div className="text-muted-foreground">{flight.registration}</div>
                        <div className="flex items-center gap-1">
                          <Fuel className="h-3 w-3" />
                          {flight.fuel}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {flight.passengers}/{flight.capacity}
                        </div>
                        <div>Gate {flight.gate}</div>
                        <div className="text-muted-foreground">{flight.terminal}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {flightAlerts.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <Badge variant="outline" className="text-xs bg-red-500/20 text-red-400">
                            {flightAlerts.length}
                          </Badge>
                        </div>
                      ) : (
                        <div className="text-xs text-green-500">No alerts</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelectedFlight(flight); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View flight details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Flight Details Modal (simplified) */}
      {selectedFlight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Flight Details - {selectedFlight.flight}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFlight(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Airline:</strong> {selectedFlight.airline}
              </div>
              <div>
                <strong>Route:</strong> {selectedFlight.route}
              </div>
              <div>
                <strong>Aircraft:</strong> {selectedFlight.aircraft}
              </div>
              <div>
                <strong>Registration:</strong> {selectedFlight.registration}
              </div>
              <div>
                <strong>Captain:</strong> {selectedFlight.crew.captain}
              </div>
              <div>
                <strong>First Officer:</strong> {selectedFlight.crew.firstOfficer}
              </div>
              <div>
                <strong>Passengers:</strong> {selectedFlight.passengers}/{selectedFlight.capacity}
              </div>
              <div>
                <strong>Fuel:</strong> {selectedFlight.fuel}%
              </div>
              <div>
                <strong>Weather:</strong> {selectedFlight.weather}
              </div>
              <div>
                <strong>Last Update:</strong> {getTimeAgo(selectedFlight.lastUpdate)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
