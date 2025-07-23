"use client"

import { useEffect, useState } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plane, Clock, MapPin, Users } from "lucide-react"

interface FlightsTableProps {
  statusFilter?: Flight["status"] | null
}

interface Flight {
  id: string
  flight: string
  route: string
  status: "On Time" | "Delayed" | "Boarding" | "Departed" | "Cancelled"
  scheduled: string
  actual: string
  progress: number
  priority: "high" | "medium" | "low"
  aircraft: string
  passengers: number
  gate: string
}

const initialFlights: Flight[] = [
  {
    id: "1",
    flight: "AA1234",
    route: "JFK → LAX",
    status: "On Time",
    scheduled: "14:30",
    actual: "14:32",
    progress: 85,
    priority: "high",
    aircraft: "Boeing 737",
    passengers: 156,
    gate: "A12",
  },
  {
    id: "2",
    flight: "DL5678",
    route: "ATL → ORD",
    status: "Delayed",
    scheduled: "16:45",
    actual: "17:15",
    progress: 60,
    priority: "medium",
    aircraft: "Airbus A320",
    passengers: 142,
    gate: "B8",
  },
  {
    id: "3",
    flight: "UA9012",
    route: "SFO → DEN",
    status: "Boarding",
    scheduled: "18:20",
    actual: "18:20",
    progress: 95,
    priority: "low",
    aircraft: "Boeing 777",
    passengers: 298,
    gate: "C15",
  },
]

export function FlightsTable({ statusFilter }: FlightsTableProps) {
  const [flights, setFlights] = useState<Flight[]>(initialFlights)

  useEffect(() => {
    let filtered = initialFlights
    if (statusFilter) {
      filtered = filtered.filter((f) => f.status === statusFilter)
    }
    setFlights(filtered)
  }, [statusFilter])

  const handleStatusChange = (flightId: string, newStatus: Flight["status"]) => {
    setFlights((prev) =>
      prev.map((flight) =>
        flight.id === flightId ? { ...flight, status: newStatus } : flight
      )
    )
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

  return (
    <div className="bg-background/60 backdrop-blur-md border border-border/50 rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50">
            <TableHead className="text-muted-foreground">Flight</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Schedule</TableHead>
            <TableHead className="text-muted-foreground">Progress</TableHead>
            <TableHead className="text-muted-foreground">Priority</TableHead>
            <TableHead className="text-muted-foreground">Details</TableHead>
            <TableHead className="text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flights.map((flight) => (
            <TableRow key={flight.id} className="border-border/50 hover:bg-muted/50">
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 bg-primary/20">
                    <Plane className="h-4 w-4 text-primary" />
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">{flight.flight}</div>
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
              </TableCell>
              <TableCell className="text-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <div className="text-sm">{flight.scheduled}</div>
                    <div className="text-xs text-muted-foreground">Actual: {flight.actual}</div>
                  </div>
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
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
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
                <div className="space-y-1">
                  <div className="text-xs">{flight.aircraft}</div>
                  <div className="text-xs flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {flight.passengers}
                  </div>
                  <div className="text-xs">Gate {flight.gate}</div>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm">
                    <DropdownMenuItem onClick={() => handleStatusChange(flight.id, "On Time")}>
                      Mark On Time
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(flight.id, "Delayed")}>
                      Mark Delayed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(flight.id, "Boarding")}>
                      Start Boarding
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(flight.id, "Departed")}>
                      Mark Departed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(flight.id, "Cancelled")}
                      className="text-red-500"
                    >
                      Cancel Flight
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
