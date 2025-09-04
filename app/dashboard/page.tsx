"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Plane, CloudSun, Bell, LifeBuoy, Settings, Search, RefreshCw, Filter, Download, ChevronDown, Info, X, BarChart3, TrendingUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { EnhancedFlightsTable } from "@/components/enhanced-flights-table"
import { EnhancedAlertsPanel } from "@/components/enhanced-alerts-panel"
import { OperationsChart } from "@/components/operations-chart"
import { DashboardAlerts } from "@/components/dashboard-alerts"
import { MetricsCard } from "@/components/metrics-card"
import { RoleAssignmentModal } from "@/components/role-assignment-modal"
import { useMultiScreen } from "@/hooks/use-multi-screen"
import { MultiScreenDebug } from "@/components/multi-screen-debug"
import { MultiScreenTest } from "@/components/multi-screen-test"
import { WeatherDashboard } from "@/components/weather"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [metrics, setMetrics] = useState<any>(null)
  const [searchResults, setSearchResults] = useState({ flights: [], alerts: [] })
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null)
  const [flightStatusFilter, setFlightStatusFilter] = useState<"On Time" | "Delayed" | "Boarding" | "Departed" | "Cancelled" | "all" | null>(null)
  const [showRoleAssignment, setShowRoleAssignment] = useState(false)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const router = useRouter()

  // Multi-screen functionality
  const {
    screens,
    currentRole,
    initializeMultiScreen,
    assignRole,
    popOutDetailedView,
    isMultiScreenSupported
  } = useMultiScreen()

  // Auth check
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      router.push("/login")
      return
    }
    fetch("http://localhost:3001/api/verify", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) {
          localStorage.removeItem("token")
          router.push("/login")
        }
      })
      .catch(() => {
        localStorage.removeItem("token")
        router.push("/login")
      })
  }, [router])

  const loadMetrics = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/metrics", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      if (response.ok) setMetrics(data)
    } catch (error) {
      console.error("Failed to load metrics:", error)
    }
  }

  useEffect(() => {
    loadMetrics()
  }, [])

  // Initialize multi-screen functionality
  useEffect(() => {
    const initMultiScreen = async () => {
      if (isMultiScreenSupported()) {
        const result = await initializeMultiScreen()
        if (result?.needsRoleAssignment) {
          setShowRoleAssignment(true)
        }
      }
    }

    initMultiScreen()
  }, [initializeMultiScreen, isMultiScreenSupported])

  // Listen for role assignment requests from multi-screen hook
  useEffect(() => {
    const handleShowRoleAssignment = (event: CustomEvent) => {
      console.log('Role assignment requested:', event.detail)
      setShowRoleAssignment(true)
    }

    window.addEventListener('showRoleAssignment', handleShowRoleAssignment as EventListener)
    
    return () => {
      window.removeEventListener('showRoleAssignment', handleShowRoleAssignment as EventListener)
    }
  }, [])

  // Reset flightStatusFilter only when leaving the flights tab
  useEffect(() => {
    if (activeTab !== "flights" && flightStatusFilter !== null) {
      setFlightStatusFilter(null);
    }
  }, [activeTab, flightStatusFilter])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults({ flights: [], alerts: [] })
      setShowSearchDropdown(false)
      return
    }
    setSearchLoading(true)
    setShowSearchDropdown(true)
    Promise.all([
      fetch(`http://localhost:3001/api/flights/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then(res => res.json()),
      fetch("http://localhost:3001/api/alerts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then(res => res.json()).then(alerts =>
        alerts.filter((a: any) => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.message.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    ]).then(([flights, alerts]) => {
      setSearchResults({ flights, alerts })
      setSearchLoading(false)
    }).catch(() => setSearchLoading(false))
  }, [searchQuery])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("http://localhost:3001/api/metrics", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      if (response.ok) setMetrics(data)
    } catch (error) {
      console.error("Failed to refresh metrics:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleRoleAssign = async (screenId: number, role: 'general' | 'detailed') => {
    await assignRole(screenId, role)
  }

  const handlePopOutDetails = (type: 'flight' | 'alerts' | 'metrics' | 'operations', id?: string) => {
    popOutDetailedView(type, id)
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "flights", label: "Flights", icon: Plane },
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

  // Attention Required departments (can be made dynamic)
  const attentionDepartments = [
    {
      name: "Ground Operations",
      color: "bg-yellow-50 border-l-4 border-yellow-400 dark:bg-yellow-900/30",
      titleColor: "text-yellow-800 dark:text-yellow-200",
      descColor: "text-yellow-700 dark:text-yellow-300",
      valueColor: "text-yellow-900 dark:text-yellow-100",
      avgColor: "text-yellow-700 dark:text-yellow-300",
      reason: "Baggage delays, refueling issues",
      delay: "+18 min"
    },
    {
      name: "Crew Scheduling",
      color: "bg-red-50 border-l-4 border-red-400 dark:bg-red-900/30",
      titleColor: "text-red-800 dark:text-red-200",
      descColor: "text-red-700 dark:text-red-300",
      valueColor: "text-red-900 dark:text-red-100",
      avgColor: "text-red-700 dark:text-red-300",
      reason: "Late arrivals, last-minute changes",
      delay: "+12 min"
    },
    {
      name: "ATC (Air Traffic Control)",
      color: "bg-blue-50 border-l-4 border-blue-400 dark:bg-blue-900/30",
      titleColor: "text-blue-800 dark:text-blue-200",
      descColor: "text-blue-700 dark:text-blue-300",
      valueColor: "text-blue-900 dark:text-blue-100",
      avgColor: "text-blue-700 dark:text-blue-300",
      reason: "Congestion, slot restrictions",
      delay: "+9 min"
    },
    {
      name: "Maintenance",
      color: "bg-green-50 border-l-4 border-green-400 dark:bg-green-900/30",
      titleColor: "text-green-800 dark:text-green-200",
      descColor: "text-green-700 dark:text-green-300",
      valueColor: "text-green-900 dark:text-green-100",
      avgColor: "text-green-700 dark:text-green-300",
      reason: "Technical checks, inspections",
      delay: "+7 min"
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid lg:grid-cols-[200px_1fr]">
        {/* Sidebar */}
        <aside className="border-r border-border bg-background/60 backdrop-blur-md sticky top-0 h-screen flex flex-col">
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
                placeholder="Search flights, alerts..."
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
                      {searchResults.flights.length === 0 && searchResults.alerts.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No results found</div>
                      ) : (
                        <>
                          {searchResults.flights.length > 0 && (
                            <div>
                              <div className="px-4 pt-2 pb-1 text-xs font-semibold text-muted-foreground">Flights</div>
                              {searchResults.flights.map((f: any) => (
                                <div key={f.id} className="px-4 py-2 hover:bg-muted/50 cursor-pointer" onMouseDown={() => { setActiveTab("flights"); setShowSearchDropdown(false); }}>
                                  <span className="font-medium">{f.flight}</span> <span className="text-xs text-muted-foreground">{f.route}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {searchResults.alerts.length > 0 && (
                            <div>
                              <div className="px-4 pt-2 pb-1 text-xs font-semibold text-muted-foreground">Alerts</div>
                              {searchResults.alerts.map((a: any) => (
                                <div key={a.id} className="px-4 py-2 hover:bg-muted/50 cursor-pointer" onMouseDown={() => { setActiveTab("alerts"); setShowSearchDropdown(false); }}>
                                  <span className="font-medium">{a.title}</span> <span className="text-xs text-muted-foreground">{a.type}</span>
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
              <div className="text-sm text-muted-foreground">Today, August 05, 2025 - Live Data</div>
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
                      value={metrics.flightsToday?.value?.toString() ?? "0"}
                      change={{
                        value: `${metrics.flightsToday?.change > 0 ? "+" : ""}${metrics.flightsToday?.change ?? 0}`,
                        percentage: `${metrics.flightsToday?.percentage > 0 ? "+" : ""}${metrics.flightsToday?.percentage ?? 0}%`,
                        isPositive: metrics.flightsToday?.isPositive ?? true,
                      }}
                    />
                    {expandedMetric === "flights" && (
                      <div className="absolute left-0 right-0 mt-2 z-10 bg-background border border-border/50 rounded-lg shadow-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">Flights Today Details</span>
                          <Button variant="ghost" size="icon" onClick={() => setExpandedMetric(null)} aria-label="Close details"><X className="h-4 w-4" /></Button>
                        </div>
                        <EnhancedFlightsTable 
                          statusFilter={null} 
                          onPopOutDetails={(flightId) => handlePopOutDetails('flight', flightId)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <MetricsCard
                      title={<span>Delays <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="inline h-4 w-4 text-muted-foreground ml-1 cursor-help" aria-label="Info about Delays" /></TooltipTrigger><TooltipContent>Number of delayed flights today.</TooltipContent></Tooltip></TooltipProvider></span>}
                      value={metrics.delays?.value?.toString() ?? "0"}
                      change={{
                        value: `${metrics.delays?.change > 0 ? "+" : ""}${metrics.delays?.change ?? 0}`,
                        percentage: `${metrics.delays?.percentage > 0 ? "+" : ""}${metrics.delays?.percentage ?? 0}%`,
                        isPositive: metrics.delays?.isPositive ?? true,
                      }}
                      onClick={() => {
                        setActiveTab("flights")
                        setFlightStatusFilter("Delayed")
                      }}
                    />
                  </div>
                  <div className="relative">
                    <MetricsCard
                      title={<div className="flex items-center gap-1"><span className="text-sm">OTP</span> <TooltipProvider><Tooltip><TooltipTrigger asChild><span><Info className="inline h-4 w-4 text-muted-foreground cursor-help" /></span></TooltipTrigger><TooltipContent>Percentage of flights that departed/arrived on time.</TooltipContent></Tooltip></TooltipProvider></div>}
                      value={`${metrics.onTimePerformance?.value ?? 0}%`}
                      change={{
                        value: `${metrics.onTimePerformance?.change > 0 ? "+" : ""}${metrics.onTimePerformance?.change ?? 0}%`,
                        percentage: `${metrics.onTimePerformance?.percentage > 0 ? "+" : ""}${metrics.onTimePerformance?.percentage ?? 0}%`,
                        isPositive: metrics.onTimePerformance?.isPositive ?? true,
                      }}
                    />
                  </div>
                  <div className="relative">
                    <MetricsCard
                      title={<div className="flex items-center gap-1"><span>Cancellations</span><TooltipProvider><Tooltip><TooltipTrigger asChild><span><Info className="inline h-4 w-4 text-muted-foreground cursor-help" /></span></TooltipTrigger><TooltipContent>Number of cancelled flights today.</TooltipContent></Tooltip></TooltipProvider></div>}
                      value={metrics.cancellations?.value?.toString() ?? "0"}
                      change={{
                        value: `${metrics.cancellations?.change > 0 ? "+" : ""}${metrics.cancellations?.change ?? 0}`,
                        percentage: `${metrics.cancellations?.percentage > 0 ? "+" : ""}${metrics.cancellations?.percentage ?? 0}%`,
                        isPositive: metrics.cancellations?.isPositive ?? true,
                      }}
                      onClick={() => {
                        setActiveTab("flights")
                        setFlightStatusFilter("Cancelled")
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Pop-out buttons for detailed views */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Button 
                  onClick={() => handlePopOutDetails('metrics')}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Pop Out Metrics Dashboard
                </Button>
                <Button 
                  onClick={() => handlePopOutDetails('operations')}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Pop Out Operations View
                </Button>
                <Button 
                  onClick={() => handlePopOutDetails('alerts')}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Bell className="h-4 w-4" />
                  Pop Out Alerts Dashboard
                </Button>
              </div>
              
              {/* Chart and Critical Alerts Side by Side */}
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
                    {/* Attention Required Section */}
                    <div className="mt-1">
                      <h3 className="text-sm font-semibold mb-2 text-foreground">Attention Required</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {attentionDepartments.map((dep, idx) => (
                          <Card key={dep.name + idx} className={`p-3 ${dep.color}`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <div className={`font-semibold ${dep.titleColor}`}>{dep.name}</div>
                                <div className={`text-xs ${dep.descColor}`}>{dep.reason}</div>
                              </div>
                              <div className="text-right">
                                <div className={`text-lg font-bold ${dep.valueColor}`}>{dep.delay}</div>
                                <div className={`text-xs ${dep.avgColor}`}>Avg. delay</div>
                              </div>
                            </div>
                          </Card>
                        ))}
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
              <div className="mb-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Active Flights</h2>
                    <p className="text-sm text-muted-foreground">Real-time flight status and operations</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFlightStatusFilter(null); // Show all flights
                      setActiveTab("flights");
                    }}
                  >
                    View All Flights
                  </Button>
                </div>
                {/* Always show all flights in dashboard */}
                <EnhancedFlightsTable 
                  statusFilter={null} 
                  onPopOutDetails={(flightId) => handlePopOutDetails('flight', flightId)}
                />
              </div>
            </>
          )}
          {activeTab === "weather" && (
            <Card className="p-8 bg-background/60 backdrop-blur-md border-border/50">
             <h2 className="text-xl font-bold mb-4 text-center">Weather Overview</h2>
             <WeatherDashboard />
            </Card>
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
              {/* Use the filter in the flights tab */}
              <EnhancedFlightsTable 
                statusFilter={flightStatusFilter} 
                onPopOutDetails={(flightId) => handlePopOutDetails('flight', flightId)}
              />
            </div>
          )}
          {( activeTab === "support" || activeTab === "settings") && (
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

      {/* Debug Panel Toggle */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          🔧 Debug
        </Button>
      </div>

      {/* Debug Panel */}
      {showDebugPanel && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto space-y-4">
            <MultiScreenDebug />
            <MultiScreenTest />
            <div className="mt-4 text-center">
              <Button onClick={() => setShowDebugPanel(false)} variant="outline">
                Close Debug Panel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      <RoleAssignmentModal
        isOpen={showRoleAssignment}
        onClose={() => setShowRoleAssignment(false)}
        screens={screens}
        onRoleAssign={handleRoleAssign}
      />
    </div>
  )
}