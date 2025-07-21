"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MetricsCard } from "@/components/metrics-card"
import { OperationsChart } from "@/components/operations-chart"
import { ThemeToggle } from "@/components/theme-toggle"
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
} from "lucide-react"
import { EnhancedAlertsPanel } from "@/components/enhanced-alerts-panel"
import { EnhancedFlightsTable } from "@/components/enhanced-flights-table"
import { metricsAPI, type Metrics } from "@/services/api"
import { DashboardAlerts } from "@/components/dashboard-alerts"

export default function Page() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedPeriod, setSelectedPeriod] = useState("today")
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [metrics, setMetrics] = useState<Metrics | null>(null)

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
    console.log(`Clicked on ${metric} metric`)
    // Navigate to detailed view
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
      <div className="grid lg:grid-cols-[280px_1fr]">
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
                placeholder="Search flights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/40 backdrop-blur-sm border-border/50"
              />
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
              <Button variant="outline" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" className="gap-2 bg-transparent">
                All Airports
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === "dashboard" && (
            <>
              {metrics && (
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  <MetricsCard
                    title="Flights Today"
                    value={metrics.flightsToday.value.toString()}
                    change={{
                      value: `${metrics.flightsToday.change > 0 ? "+" : ""}${metrics.flightsToday.change}`,
                      percentage: `${metrics.flightsToday.percentage > 0 ? "+" : ""}${metrics.flightsToday.percentage}%`,
                      isPositive: metrics.flightsToday.isPositive,
                    }}
                    onClick={() => handleMetricClick("flights")}
                  />
                  <MetricsCard
                    title="Delays"
                    value={metrics.delays.value.toString()}
                    change={{
                      value: `${metrics.delays.change > 0 ? "+" : ""}${metrics.delays.change}`,
                      percentage: `${metrics.delays.percentage > 0 ? "+" : ""}${metrics.delays.percentage}%`,
                      isPositive: metrics.delays.isPositive,
                    }}
                    onClick={() => handleMetricClick("delays")}
                  />
                  <MetricsCard
                    title="On-Time Performance"
                    value={`${metrics.onTimePerformance.value}%`}
                    change={{
                      value: `${metrics.onTimePerformance.change > 0 ? "+" : ""}${metrics.onTimePerformance.change}%`,
                      percentage: `${metrics.onTimePerformance.percentage > 0 ? "+" : ""}${metrics.onTimePerformance.percentage}%`,
                      isPositive: metrics.onTimePerformance.isPositive,
                    }}
                    onClick={() => handleMetricClick("performance")}
                  />
                </div>
              )}

              {/* Chart */}
              <Card className="mb-6 p-6 bg-background/60 backdrop-blur-md border-border/50">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">On-Time Performance</h2>
                  <div className="flex gap-2">
                    {timePeriods.map((period) => (
                      <Button
                        key={period.id}
                        size="sm"
                        variant={selectedPeriod === period.id ? "secondary" : "ghost"}
                        onClick={() => setSelectedPeriod(period.id)}
                      >
                        {period.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <OperationsChart selectedPeriod={selectedPeriod} />
              </Card>

              {/* Critical Alerts Section */}
              <div className="mb-6">
                <DashboardAlerts onViewAll={() => setActiveTab("alerts")} />
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
                <EnhancedFlightsTable />
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
              <EnhancedFlightsTable />
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
