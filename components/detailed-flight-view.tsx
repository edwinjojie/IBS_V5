"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Plane, Clock, MapPin, Users, Fuel, AlertCircle, X, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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
  registration: string
  fuel: number
  passengers: number
  capacity: number
  gate: string
  terminal: string
  cancellationReason?: string
  crew: { captain: string; firstOfficer: string }
  weather: string
  lastUpdate: string
}

export function DetailedFlightView() {
  const [flight, setFlight] = useState<Flight | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Listen for flight ID from parent window
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.flightId) {
        await loadFlightDetails(event.data.flightId)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const loadFlightDetails = async (flightId: string) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Authentication required")
        return
      }

      const response = await fetch(`http://localhost:3001/api/flights/${flightId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Failed to load flight details")
      }

      const flightData = await response.json()
      setFlight(flightData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load flight details")
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
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Departed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      case "Cancelled":
        return "bg-red-600/20 text-red-500 border-red-600/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getPriorityColor = (priority: Flight["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Flight</h2>
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  if (!flight) {
    return (
      <div className="p-6 text-center">
        <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">No Flight Selected</h2>
        <p className="text-gray-500">Select a flight from the main dashboard to view details</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{flight.flight}</h1>
            <p className="text-muted-foreground text-lg">{flight.airline}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(flight.status)}>
              {flight.status}
            </Badge>
            <Badge className={getPriorityColor(flight.priority)}>
              {flight.priority} Priority
            </Badge>
          </div>
        </div>

        {/* Route Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Route Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-muted-foreground mb-2">Origin</h3>
                <p className="text-2xl font-bold">{flight.origin}</p>
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground mb-2">Destination</h3>
                <p className="text-2xl font-bold">{flight.destination}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-muted-foreground mb-1">Scheduled</h3>
                <p className="text-lg">{flight.scheduled}</p>
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground mb-1">Actual</h3>
                <p className="text-lg">{flight.actual || "N/A"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground mb-1">ETA</h3>
                <p className="text-lg">{flight.estimatedArrival || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aircraft & Crew */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Aircraft Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-semibold">Aircraft:</span> {flight.aircraft}
              </div>
              <div>
                <span className="font-semibold">Registration:</span> {flight.registration}
              </div>
              <div>
                <span className="font-semibold">Fuel:</span> {flight.fuel}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Crew Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-semibold">Captain:</span> {flight.crew.captain}
              </div>
              <div>
                <span className="font-semibold">First Officer:</span> {flight.crew.firstOfficer}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Passenger & Gate Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Passenger Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-semibold">Current:</span> {flight.passengers}
              </div>
              <div>
                <span className="font-semibold">Capacity:</span> {flight.capacity}
              </div>
              <div>
                <span className="font-semibold">Load Factor:</span>{" "}
                {Math.round((flight.passengers / flight.capacity) * 100)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Gate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-semibold">Gate:</span> {flight.gate}
              </div>
              <div>
                <span className="font-semibold">Terminal:</span> {flight.terminal}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress & Weather */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Flight Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{flight.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${flight.progress}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudSun className="h-5 w-5" />
                Weather Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{flight.weather}</p>
            </CardContent>
          </Card>
        </div>

        {/* Last Update */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(flight.lastUpdate).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
