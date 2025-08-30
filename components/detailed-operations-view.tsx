"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, BarChart3, Clock, TrendingUp, Plane, Users, Fuel, Calendar } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Flight {
  id: string
  flight: string
  airline: string
  route: string
  origin: string
  destination: string
  status: "On Time" | "Delayed" | "Boarding" | "Departed" | "Cancelled"
  scheduled: string
  actual: string
  estimatedArrival: string
  progress: number
  priority: "high" | "medium" | "low"
  aircraft: string
  passengers: number
  fuelLevel: number
}

interface OperationsData {
  totalFlights: number
  onTimeFlights: number
  delayedFlights: number
  cancelledFlights: number
  totalPassengers: number
  averageDelay: number
  fuelEfficiency: number
  crewUtilization: number
  hourlyDistribution: Array<{ hour: number; flights: number }>
  statusDistribution: Array<{ status: string; count: number }>
  airlinePerformance: Array<{ airline: string; onTimeRate: number; totalFlights: number }>
}

export function DetailedOperationsView() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [operationsData, setOperationsData] = useState<OperationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<string>("24h")
  const [selectedMetric, setSelectedMetric] = useState<string>("overview")

  useEffect(() => {
    loadData()
  }, [timeRange])

  const loadData = async () => {
    try {
      const [flightsResponse, metricsResponse] = await Promise.all([
        fetch("http://localhost:3001/api/flights"),
        fetch("http://localhost:3001/api/metrics")
      ])

      if (flightsResponse.ok) {
        const flightsData = await flightsResponse.json()
        setFlights(flightsData)
        processOperationsData(flightsData)
      }
    } catch (error) {
      console.error("Failed to load operations data:", error)
    } finally {
      setLoading(false)
    }
  }

  const processOperationsData = (flightsData: Flight[]) => {
    const totalFlights = flightsData.length
    const onTimeFlights = flightsData.filter(f => f.status === "On Time").length
    const delayedFlights = flightsData.filter(f => f.status === "Delayed").length
    const cancelledFlights = flightsData.filter(f => f.status === "Cancelled").length
    const totalPassengers = flightsData.reduce((sum, f) => sum + f.passengers, 0)
    
    const delayedFlightsData = flightsData.filter(f => f.status === "Delayed")
    const averageDelay = delayedFlightsData.length > 0 
      ? delayedFlightsData.reduce((sum, f) => {
          const scheduled = new Date(f.scheduled)
          const actual = new Date(f.actual)
          return sum + (actual.getTime() - scheduled.getTime()) / (1000 * 60)
        }, 0) / delayedFlightsData.length
      : 0

    const fuelEfficiency = flightsData.reduce((sum, f) => sum + f.fuelLevel, 0) / totalFlights
    const crewUtilization = (totalFlights / 24) * 100 // Simplified calculation

    // Hourly distribution
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      flights: flightsData.filter(f => {
        const scheduled = new Date(f.scheduled)
        return scheduled.getHours() === hour
      }).length
    }))

    // Status distribution
    const statusDistribution = [
      { status: "On Time", count: onTimeFlights },
      { status: "Delayed", count: delayedFlights },
      { status: "Boarding", count: flightsData.filter(f => f.status === "Boarding").length },
      { status: "Departed", count: flightsData.filter(f => f.status === "Departed").length },
      { status: "Cancelled", count: cancelledFlights }
    ]

    // Airline performance
    const airlineStats = flightsData.reduce((acc, flight) => {
      if (!acc[flight.airline]) {
        acc[flight.airline] = { onTime: 0, total: 0 }
      }
      acc[flight.airline].total++
      if (flight.status === "On Time") {
        acc[flight.airline].onTime++
      }
      return acc
    }, {} as Record<string, { onTime: number; total: number }>)

    const airlinePerformance = Object.entries(airlineStats).map(([airline, stats]) => ({
      airline,
      onTimeRate: (stats.onTime / stats.total) * 100,
      totalFlights: stats.total
    })).sort((a, b) => b.onTimeRate - a.onTimeRate)

    setOperationsData({
      totalFlights,
      onTimeFlights,
      delayedFlights,
      cancelledFlights,
      totalPassengers,
      averageDelay,
      fuelEfficiency,
      crewUtilization,
      hourlyDistribution,
      statusDistribution,
      airlinePerformance
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Time": return "#10b981"
      case "Delayed": return "#f59e0b"
      case "Boarding": return "#3b82f6"
      case "Departed": return "#6b7280"
      case "Cancelled": return "#ef4444"
      default: return "#6b7280"
    }
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!operationsData) {
    return <div>No data available</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Operations Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive view of all flight operations and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Plane className="h-4 w-4" />
              Total Flights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {operationsData.totalFlights}
            </div>
            <p className="text-sm text-gray-500 mt-1">Active operations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              Total Passengers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {operationsData.totalPassengers.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-1">Today's travelers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              On-Time Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {((operationsData.onTimeFlights / operationsData.totalFlights) * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-gray-500 mt-1">Performance metric</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Fuel className="h-4 w-4" />
              Fuel Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {operationsData.fuelEfficiency.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-500 mt-1">Average level</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Flight Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={operationsData.hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="flights" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Flight Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={operationsData.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {operationsData.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Airline Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Airline Performance Ranking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {operationsData.airlinePerformance.slice(0, 10).map((airline, index) => (
              <div key={airline.airline} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <span className="font-medium">{airline.airline}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">{airline.onTimeRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-500">On-time rate</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{airline.totalFlights}</div>
                    <div className="text-sm text-gray-500">Total flights</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Delay Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Average Delay</span>
              <span className="font-bold">{operationsData.averageDelay.toFixed(1)} minutes</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Delayed Flights</span>
              <span className="font-bold text-orange-600">{operationsData.delayedFlights}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Cancelled Flights</span>
              <span className="font-bold text-red-600">{operationsData.cancelledFlights}</span>
            </div>
            <Separator />
            <div className="text-sm text-gray-500">
              {operationsData.delayedFlights > 0 && (
                <p>Most delays occur during peak hours. Consider adjusting schedules.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Crew Utilization</span>
              <span className="font-bold">{operationsData.crewUtilization.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Fuel Efficiency</span>
              <span className="font-bold">{operationsData.fuelEfficiency.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${operationsData.crewUtilization}%` }}
              ></div>
            </div>
            <Separator />
            <div className="text-sm text-gray-500">
              <p>Optimal crew utilization helps maintain operational efficiency.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Flights */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Flight Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {flights.slice(0, 10).map((flight) => (
              <div key={flight.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(flight.status)}>
                    {flight.status}
                  </Badge>
                  <div>
                    <div className="font-medium">{flight.flight}</div>
                    <div className="text-sm text-gray-500">{flight.airline}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{flight.route}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(flight.scheduled).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
