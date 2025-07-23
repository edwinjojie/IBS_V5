"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MetricsCard } from "@/components/metrics-card"
import { OperationsChart } from "@/components/operations-chart"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Flight } from "@/services/api"

import {
  Bell,
  ChevronDown,
  CloudSun,
  LayoutDashboard,
  LifeBuoy,
  Plane,
  Settings,
  Wrench,
  Search,
  Filter,
  Download,
  RefreshCw,
  Info,
  X,
} from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { EnhancedAlertsPanel } from "@/components/enhanced-alerts-panel"
import { EnhancedFlightsTable } from "@/components/enhanced-flights-table"
import { metricsAPI, type Metrics, flightAPI, alertAPI, maintenanceAPI } from "@/services/api"
import { DashboardAlerts } from "@/components/dashboard-alerts"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function Page() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeTab') || 'dashboard';
    }
    return 'dashboard';
  });
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedPeriod') || 'today';
    }
    return 'today';
  });
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [searchResults, setSearchResults] = useState<{ flights: any[]; alerts: any[]; maintenance: any[] }>({ flights: [], alerts: [], maintenance: [] })
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null)
  const [flightStatusFilter, setFlightStatusFilter] = useState<Flight["status"] | null>(null)

  

  const loadMetrics = async () => {
    try {
      const data = await metricsAPI.getCurrentMetrics()
      setMetrics(data)
    } catch (error) {
      console.error("Failed to load metrics:", error)
    }
  }

  useEffect(() => {
    loadMetrics()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTab', activeTab)
      localStorage.setItem('selectedPeriod', selectedPeriod)
    }
  }, [activeTab, selectedPeriod])

  useEffect(() => {
  if (activeTab !== "flights") {
    setFlightStatusFilter(null)
  }
}, [activeTab])


  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults({ flights: [], alerts: [], maintenance: [] })
      setShowSearchDropdown(false)
      return
    }
    setSearchLoading(true)
    setShowSearchDropdown(true)
    Promise.all([
      flightAPI.searchFlights(searchQuery),
      alertAPI.getAlerts().then(alerts => alerts.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.message.toLowerCase().includes(searchQuery.toLowerCase()))),
      maintenanceAPI.search(searchQuery),
    ]).then(([flights, alerts, maintenance]) => {
      setSearchResults({ flights, alerts, maintenance })
      setSearchLoading(false)
    })
  }, [searchQuery])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const data = await metricsAPI.refreshMetrics()
      setMetrics(data)
    } catch (error) {
      console.error("Failed to refresh metrics:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleMetricClick = (metric: string) => {
    if (activeTab !== "dashboard") {
      setActiveTab("dashboard")
      setExpandedMetric(metric)
      return
    }
    setExpandedMetric(expandedMetric === metric ? null : metric)
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "flights", label: "Flights", icon: Plane },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "weather", label: "Weather", icon: CloudSun },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "support", label: "Support", icon: LifeBuoy },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const timePeriods = [
    { id: "today", label: "Today" },
    { id: "week", label: "Last week" },
    { id: "month", label: "Last month" },
    { id: "6months", label: "Last 6 months" },
    { id: "year", label: "Year" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid lg:grid-cols-[200px_1fr]">
        {/* Sidebar */}
        <aside className="border-r border-border bg-background/60 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <div className="flex items-center gap-2">
              <Plane className="h-6 w-6 text-primary" />
              <span className="font-bold text-foreground">AirOps</span>
            </div>
            <ThemeToggle />
          </div>

          <div className="px-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search flights, alerts, maintenance..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/40 backdrop-blur-sm border-border/50"
                aria-label="Global search"
                onFocus={() => { if (searchQuery) setShowSearchDropdown(true) }}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              />
              {showSearchDropdown && (
                <div className="absolute left-0 right-0 mt-2 bg-background border border-border/50 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Searching...</div>
                  ) : (
                    <>
                      {searchResults.flights.length === 0 && searchResults.alerts.length === 0 && searchResults.maintenance.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No results found</div>
                      ) : (
                        <>
                          {searchResults.flights.length > 0 && (
                            <div>
                              <div className="px-4 pt-2 pb-1 text-xs font-semibold text-muted-foreground">Flights</div>
                              {searchResults.flights.map(f => (
                                <div key={f.id} className="px-4 py-2 hover:bg-muted/50 cursor-pointer" onMouseDown={() => { setActiveTab("flights"); setShowSearchDropdown(false); }}>
                                  <span className="font-medium">{f.flight}</span> <span className="text-xs text-muted-foreground">{f.route}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {searchResults.alerts.length > 0 && (
                            <div>
                              <div className="px-4 pt-2 pb-1 text-xs font-semibold text-muted-foreground">Alerts</div>
                              {searchResults.alerts.map(a => (
                                <div key={a.id} className="px-4 py-2 hover:bg-muted/50 cursor-pointer" onMouseDown={() => { setActiveTab("alerts"); setShowSearchDropdown(false); }}>
                                  <span className="font-medium">{a.title}</span> <span className="text-xs text-muted-foreground">{a.type}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {searchResults.maintenance.length > 0 && (
                            <div>
                              <div className="px-4 pt-2 pb-1 text-xs font-semibold text-muted-foreground">Maintenance</div>
                              {searchResults.maintenance.map(m => (
                                <div key={m.id} className="px-4 py-2 hover:bg-muted/50 cursor-pointer" onMouseDown={() => { setActiveTab("maintenance"); setShowSearchDropdown(false); }}>
                                  <span className="font-medium">{m.task}</span> <span className="text-xs text-muted-foreground">{m.aircraft}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <nav className="space-y-2 px-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 text-foreground hover:bg-muted/50"
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">Operations Overview</h1>
              <div className="text-sm text-muted-foreground">Today, Dec 15, 2024 - Live Data</div>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="gap-2 bg-transparent"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh metrics</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Filter data</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export data</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      All Airports
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Select airport</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === "dashboard" && (
            <>
              {metrics && (
                <div className="grid gap-4 md:grid-cols-5 mb-6">
                  <div className="relative">
                    <MetricsCard
                      title={<span>Flights Today <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="inline h-4 w-4 text-muted-foreground ml-1 cursor-help" aria-label="Info about Flights Today" /></TooltipTrigger><TooltipContent>Total number of flights scheduled for today.</TooltipContent></Tooltip></TooltipProvider></span>}
                      value={metrics.flightsToday.value.toString()}
                      change={{
                        value: `${metrics.flightsToday.change > 0 ? "+" : ""}${metrics.flightsToday.change}`,
                        percentage: `${metrics.flightsToday.percentage > 0 ? "+" : ""}${metrics.flightsToday.percentage}%`,
                        isPositive: metrics.flightsToday.isPositive,
                      }}
                      onClick={() => setActiveTab("flights")}
                    />
                    {expandedMetric === "flights" && (
                      <div className="absolute left-0 right-0 mt-2 z-10 bg-background border border-border/50 rounded-lg shadow-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">Flights Today Details</span>
                          <Button variant="ghost" size="icon" onClick={() => setExpandedMetric(null)} aria-label="Close details"><X className="h-4 w-4" /></Button>
                        </div>
                        <EnhancedFlightsTable statusFilter={null} />

                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <MetricsCard
                      title={<span>Delays <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="inline h-4 w-4 text-muted-foreground ml-1 cursor-help" aria-label="Info about Delays" /></TooltipTrigger><TooltipContent>Number of delayed flights today.</TooltipContent></Tooltip></TooltipProvider></span>}
                      value={metrics.delays.value.toString()}
                      change={{
                        value: `${metrics.delays.change > 0 ? "+" : ""}${metrics.delays.change}`,
                        percentage: `${metrics.delays.percentage > 0 ? "+" : ""}${metrics.delays.percentage}%`,
                        isPositive: metrics.delays.isPositive,
                      }}
                      onClick={() => {
                        setActiveTab("flights")
                        setFlightStatusFilter("Delayed")}}
                    />
                    
                  </div>
                  <div className="relative">
                    <MetricsCard
                      title={<div className="flex items-center gap-1"><span className="text-sm">OTP</span>  <TooltipProvider><Tooltip>
                        <TooltipTrigger asChild>
                         <span>
                          <Info className="inline h-4 w-4 text-muted-foreground cursor-help" />
                         </span>
                      </TooltipTrigger>
                         <TooltipContent>
                            Percentage of flights that departed/arrived on time.
                         </TooltipContent>
                           </Tooltip>
                         </TooltipProvider> </div>}
                      value={`${metrics.onTimePerformance.value}%`}
                      change={{
                        value: `${metrics.onTimePerformance.change > 0 ? "+" : ""}${metrics.onTimePerformance.change}%`,
                        percentage: `${metrics.onTimePerformance.percentage > 0 ? "+" : ""}${metrics.onTimePerformance.percentage}%`,
                        isPositive: metrics.onTimePerformance.isPositive,
                      }}     
                    />
                  </div>
                  <div className="relative">
                  <MetricsCard
                     title={
                     <div className="flex items-center gap-1">
                      <span>Cancellation Rate</span>
                       <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Info className="inline h-4 w-4 text-muted-foreground cursor-help" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Percentage of cancelled flights today
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      }
      value={`${metrics.cancellationRate.value.toFixed(1)}%`}
      change={{
        value: `${metrics.cancellationRate.change > 0 ? "+" : ""}${metrics.cancellationRate.change.toFixed(1)}%`,
        percentage: `${metrics.cancellationRate.percentage > 0 ? "+" : ""}${metrics.cancellationRate.percentage.toFixed(1)}%`,
        isPositive: metrics.cancellationRate.isPositive,
      }}
    />
  </div>

  {/*  Aircraft Utilization card */}
  <div className="relative">
    <MetricsCard
      title={
        <div className="flex items-center gap-1">
          <span>Aircraft Utilization</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Info className="inline h-4 w-4 text-muted-foreground cursor-help" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Avg. daily hours flown per aircraft
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      }
      value={`${metrics.aircraftUtilization.value.toFixed(1)}${metrics.aircraftUtilization.unit || 'h'}`}
      change={{
        value: `${metrics.aircraftUtilization.change > 0 ? "+" : ""}${metrics.aircraftUtilization.change.toFixed(1)}${metrics.aircraftUtilization.unit || 'h'}`,
        percentage: `${metrics.aircraftUtilization.percentage > 0 ? "+" : ""}${metrics.aircraftUtilization.percentage.toFixed(1)}%`,
        isPositive: metrics.aircraftUtilization.isPositive,
      }}
    />
  </div>  
</div>     
)}
    {/* Chart */}
      <div className="flex flex-row gap-4 mb-6 items-stretch" style={{ minHeight: 420 }}>
        {/* On-Time Performance Card */}
        <Card
          className="p-4 bg-background/60 backdrop-blur-md border-border/50 max-w-md flex flex-col justify-between h-full"
          style={{ width: "100%", maxWidth: 400 }}
        >
            <div>
              <div className="mb-3 flex items-center justify-between" style={{ height: 40 }}>
                <h2 className="text-lg font-semibold text-foreground">On-Time Performance</h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="px-2 text-xs" variant="outline">
                      {timePeriods.find(p => p.id === selectedPeriod)?.label || "Select Period"}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {timePeriods.map((period) => (
                      <DropdownMenuItem
                        key={period.id}
                        onClick={() => setSelectedPeriod(period.id)}
                        className={selectedPeriod === period.id ? "font-semibold text-primary" : ""}
                      >
                        {period.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-row items-start">
                <div style={{ height: 150, flex: 1 }}>
                  <OperationsChart selectedPeriod={selectedPeriod} />
                </div>
              </div>
              {/* Top Reasons Section */}
              <div className="mt-1">
                <h3 className="text-sm font-semibold mb-2 text-foreground">Attention Required</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Card className="p-3 bg-yellow-50 border-l-4 border-yellow-50 dark:bg-yellow-50 ">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-yellow-800">Ground Operations</div>
                        <div className="text-xs text-yellow-700">Baggage delays, refueling issues</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-900">+18 min</div>
                        <div className="text-xs text-yellow-700">Avg. delay</div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-3 bg-red-50 border-l-4 border-red-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-red-800">Crew Scheduling</div>
                        <div className="text-xs text-red-700">Late arrivals, last-minute changes</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-900">+12 min</div>
                        <div className="text-xs text-red-700">Avg. delay</div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-3 bg-blue-50 border-l-4 border-blue-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-blue-800">ATC (Air Traffic Control)</div>
                        <div className="text-xs text-blue-700">Congestion, slot restrictions</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-900">+9 min</div>
                        <div className="text-xs text-blue-700">Avg. delay</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </Card>
          {/* Critical Alerts Section */}
          <div className="flex-1 min-w-[260px] flex h-full">
          <div className="w-full flex flex-col h-full">
            <DashboardAlerts onViewAll={() => setActiveTab("alerts")} />
          </div>
        </div>
      </div>            
          {/* Flights Table */}
              <div className="mb-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Active Flights</h2>
                    <p className="text-sm text-muted-foreground">Real-time flight status and operations</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("flights")}>
                    View All Flights
                  </Button>
                </div>
                <EnhancedFlightsTable statusFilter={flightStatusFilter} />

              </div>
            </>
          )}

          {activeTab === "alerts" && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">System Alerts</h2>
                <p className="text-sm text-muted-foreground">Comprehensive operational alerts and notifications</p>
              </div>
              <EnhancedAlertsPanel />
            </div>
          )}

          {activeTab === "flights" && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">Flight Operations</h2>
                <p className="text-sm text-muted-foreground">Real-time flight tracking and management</p>
              </div>
              <EnhancedFlightsTable statusFilter={flightStatusFilter} />
            </div>
          )}

          {(activeTab === "maintenance" ||
            activeTab === "weather" ||
            activeTab === "support" ||
            activeTab === "settings") && (
            <Card className="p-8 bg-background/60 backdrop-blur-md border-border/50">
              <div className="text-center">
                <div className="text-4xl mb-4">🚧</div>
                <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">The {activeTab} section is currently under development.</p>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
