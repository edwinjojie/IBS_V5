"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, TrendingDown, RefreshCw, BarChart3, Clock, Target, Activity } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface Metric {
  kpi_name: string
  value: number
  change: number
  percentage: number
  isPositive: boolean
  unit: string
  lastUpdated: string
  target?: number
  trend?: number[]
}

interface HistoricalMetric {
  time: string
  value: number
  target?: number
}

export function DetailedMetricsView() {
  const [metrics, setMetrics] = useState<Record<string, Metric>>({})
  const [historicalMetrics, setHistoricalMetrics] = useState<HistoricalMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  useEffect(() => {
    loadMetrics()
    loadHistoricalMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/metrics")
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error("Failed to load metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadHistoricalMetrics = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/historical-metrics")
      if (response.ok) {
        const data = await response.json()
        setHistoricalMetrics(data)
      }
    } catch (error) {
      console.error("Failed to load historical metrics:", error)
    }
  }

  const getMetricIcon = (metricName: string) => {
    const name = metricName.toLowerCase()
    if (name.includes('delay')) return '⏰'
    if (name.includes('satisfaction')) return '😊'
    if (name.includes('efficiency')) return '📈'
    if (name.includes('safety')) return '🛡️'
    if (name.includes('cost')) return '💰'
    if (name.includes('fuel')) return '⛽'
    return '📊'
  }

  const getMetricColor = (metric: Metric) => {
    if (metric.isPositive) return "text-green-600"
    return "text-red-600"
  }

  const getChangeIcon = (metric: Metric) => {
    if (metric.isPositive) return <TrendingUp className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Metrics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive view of all operational KPIs and performance indicators
          </p>
        </div>
        <Button onClick={loadMetrics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Metrics Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(metrics).map(([key, metric]) => (
          <Card 
            key={key} 
            className={`hover:shadow-lg transition-all cursor-pointer ${
              selectedMetric === key ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedMetric(selectedMetric === key ? null : key)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getMetricIcon(metric.kpi_name)}</span>
                  <CardTitle className="text-lg capitalize">
                    {metric.kpi_name.replace(/_/g, ' ')}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  {metric.unit}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {metric.value.toLocaleString()}
                <span className="text-lg text-gray-500 ml-1">{metric.unit}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 ${getMetricColor(metric)}`}>
                  {getChangeIcon(metric)}
                  <span className="text-sm font-medium">
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  vs last period
                </span>
              </div>

              {metric.target && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Target className="h-4 w-4" />
                  <span>Target: {metric.target.toLocaleString()} {metric.unit}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Updated: {new Date(metric.lastUpdated).toLocaleString()}</span>
              </div>

              {/* Progress bar to target */}
              {metric.target && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metric.value >= metric.target ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed View for Selected Metric */}
      {selectedMetric && metrics[selectedMetric] && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Detailed Analysis: {metrics[selectedMetric].kpi_name.replace(/_/g, ' ')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics[selectedMetric].value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Current Value</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className={`text-2xl font-bold ${getMetricColor(metrics[selectedMetric])}`}>
                  {metrics[selectedMetric].change > 0 ? '+' : ''}{metrics[selectedMetric].change.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Change</div>
              </div>
              {metrics[selectedMetric].target && (
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics[selectedMetric].target.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Target</div>
                </div>
              )}
            </div>

            {/* Historical Chart */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Historical Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value: number) => [value.toLocaleString(), 'Value']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                    {metrics[selectedMetric].target && (
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Insights */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Performance Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">Current Status</span>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {metrics[selectedMetric].isPositive 
                      ? 'Performance is trending positively' 
                      : 'Performance needs attention'
                    }
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900 dark:text-green-100">Recommendations</span>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {metrics[selectedMetric].isPositive 
                      ? 'Maintain current performance levels' 
                      : 'Review processes and identify improvement areas'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Object.values(metrics).filter(m => m.isPositive).length}
              </div>
              <div className="text-sm text-gray-500">Improving</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {Object.values(metrics).filter(m => !m.isPositive).length}
              </div>
              <div className="text-sm text-gray-500">Declining</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(metrics).filter(m => m.target && m.value >= m.target).length}
              </div>
              <div className="text-sm text-gray-500">On Target</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {Object.values(metrics).length}
              </div>
              <div className="text-sm text-gray-500">Total KPIs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
