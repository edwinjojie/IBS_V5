// Simulate API calls with JSON data
import flightsData from "../data/flights.json"
import alertsData from "../data/alerts.json"
import metricsData from "../data/metrics.json"

// Simulate network delay
const simulateDelay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

export interface Flight {
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
  passengers: number
  capacity: number
  gate: string
  terminal: string
  crew: {
    captain: string
    firstOfficer: string
  }
  weather: string
  fuel: number
  lastUpdate: string
  cancellationReason?: string
}

export interface Alert {
  id: string
  type: "weather" | "maintenance" | "security" | "delay" | "accident" | "operational" | "fuel" | "crew"
  severity: "critical" | "high" | "medium" | "low"
  title: string
  message: string
  affectedAirports: string[]
  affectedFlights: string[]
  timestamp: string
  status: "active" | "resolved" | "monitoring"
  source: string
  estimatedDuration?: string
  recommendations?: string
  aircraft?: string
  maintenanceType?: string
  estimatedRepairTime?: string
  additionalInfo?: string
  reason?: string
  incidentType?: string
  injuries?: string
  estimatedClearanceTime?: string
  oldGate?: string
  newGate?: string
  currentSupply?: string
  estimatedResupply?: string
  crewType?: string
  estimatedResolution?: string
}

export interface Metrics {
  flightsToday: {
    value: number
    change: number
    percentage: number
    isPositive: boolean
    lastUpdated: string
  }
  delays: {
    value: number
    change: number
    percentage: number
    isPositive: boolean
    lastUpdated: string
  }
  onTimePerformance: {
    value: number
    change: number
    percentage: number
    isPositive: boolean
    lastUpdated: string
  }
  cancellations: {
    value: number
    change: number
    percentage: number
    isPositive: boolean
    lastUpdated: string
  }
  averageDelay: {
    value: number
    change: number
    percentage: number
    isPositive: boolean
    unit: string
    lastUpdated: string
  }
}

// API Functions
export const flightAPI = {
  async getFlights(): Promise<Flight[]> {
    await simulateDelay()
    return flightsData.flights as Flight[]
  },

  async getFlightById(id: string): Promise<Flight | null> {
    await simulateDelay()
    const flight = flightsData.flights.find((f) => f.id === id)
    return (flight as Flight) || null
  },

  async getFlightsByStatus(status: Flight["status"]): Promise<Flight[]> {
    await simulateDelay()
    return flightsData.flights.filter((f) => f.status === status) as Flight[]
  },

  async getFlightsByAirport(airport: string): Promise<Flight[]> {
    await simulateDelay()
    return flightsData.flights.filter((f) => f.origin === airport || f.destination === airport) as Flight[]
  },

  async searchFlights(query: string): Promise<Flight[]> {
    await simulateDelay()
    const lowercaseQuery = query.toLowerCase()
    return flightsData.flights.filter(
      (f) =>
        f.flight.toLowerCase().includes(lowercaseQuery) ||
        f.airline.toLowerCase().includes(lowercaseQuery) ||
        f.route.toLowerCase().includes(lowercaseQuery) ||
        f.aircraft.toLowerCase().includes(lowercaseQuery),
    ) as Flight[]
  },
}

export const alertAPI = {
  async getAlerts(): Promise<Alert[]> {
    await simulateDelay()
    return alertsData.alerts as Alert[]
  },

  async getActiveAlerts(): Promise<Alert[]> {
    await simulateDelay()
    return alertsData.alerts.filter((alert) => alert.status === "active") as Alert[]
  },

  async getAlertsByType(type: Alert["type"]): Promise<Alert[]> {
    await simulateDelay()
    return alertsData.alerts.filter((alert) => alert.type === type) as Alert[]
  },

  async getAlertsBySeverity(severity: Alert["severity"]): Promise<Alert[]> {
    await simulateDelay()
    return alertsData.alerts.filter((alert) => alert.severity === severity) as Alert[]
  },

  async getAlertsForFlight(flightNumber: string): Promise<Alert[]> {
    await simulateDelay()
    return alertsData.alerts.filter((alert) => alert.affectedFlights.includes(flightNumber)) as Alert[]
  },
}

export const metricsAPI = {
  async getCurrentMetrics(): Promise<Metrics> {
    await simulateDelay()
    return metricsData.currentMetrics as Metrics
  },

  async getHistoricalData(period = "today") {
    await simulateDelay()
    // In a real app, this would filter based on the period
    return metricsData.historicalData.onTimePerformance
  },

  async refreshMetrics(): Promise<Metrics> {
    await simulateDelay(1000) // Longer delay to simulate refresh
    // In a real app, this would fetch fresh data
    const updatedMetrics = { ...metricsData.currentMetrics }
    // Simulate small changes
    updatedMetrics.flightsToday.value += Math.floor(Math.random() * 5)
    updatedMetrics.delays.value += Math.floor(Math.random() * 3) - 1
    return updatedMetrics as Metrics
  },
}

// Mock maintenance data
const maintenanceData = [
  {
    id: 'm1',
    task: 'Engine Inspection',
    aircraft: 'Boeing 737',
    status: 'scheduled',
    scheduledDate: '2024-12-16T09:00:00Z',
    completedDate: null,
    technician: 'John Doe',
    notes: 'Routine check',
  },
  {
    id: 'm2',
    task: 'Landing Gear Replacement',
    aircraft: 'Airbus A320',
    status: 'in-progress',
    scheduledDate: '2024-12-15T13:00:00Z',
    completedDate: null,
    technician: 'Jane Smith',
    notes: 'Parts delayed',
  },
  {
    id: 'm3',
    task: 'Cabin Deep Clean',
    aircraft: 'Boeing 777',
    status: 'completed',
    scheduledDate: '2024-12-14T07:00:00Z',
    completedDate: '2024-12-14T10:00:00Z',
    technician: 'Alex Lee',
    notes: 'Completed successfully',
  },
]

export interface Maintenance {
  id: string
  task: string
  aircraft: string
  status: 'scheduled' | 'in-progress' | 'completed'
  scheduledDate: string
  completedDate: string | null
  technician: string
  notes: string
}

export const maintenanceAPI = {
  async getAll(): Promise<Maintenance[]> {
    await simulateDelay()
    return maintenanceData as Maintenance[]
  },
  async search(query: string): Promise<Maintenance[]> {
    await simulateDelay()
    const lowercaseQuery = query.toLowerCase()
    return maintenanceData.filter(
      (m) =>
        m.task.toLowerCase().includes(lowercaseQuery) ||
        m.aircraft.toLowerCase().includes(lowercaseQuery) ||
        m.technician.toLowerCase().includes(lowercaseQuery) ||
        m.status.toLowerCase().includes(lowercaseQuery)
    ) as Maintenance[]
  },
  async getById(id: string): Promise<Maintenance | null> {
    await simulateDelay()
    return (maintenanceData.find((m) => m.id === id) as Maintenance) || null
  },
}

// Utility functions
export const formatTime = (timeString: string): string => {
  return new Date(timeString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const getTimeAgo = (timestamp: string): string => {
  const now = new Date()
  const alertTime = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr ago`
  return `${Math.floor(diffInMinutes / 1440)} day ago`
}
