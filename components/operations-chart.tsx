"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

const data = [
  { time: "06:00", onTime: 95, flights: 12 },
  { time: "08:00", onTime: 88, flights: 24 },
  { time: "10:00", onTime: 92, flights: 18 },
  { time: "12:00", onTime: 85, flights: 32 },
  { time: "14:00", onTime: 90, flights: 28 },
  { time: "16:00", onTime: 87, flights: 35 },
  { time: "18:00", onTime: 93, flights: 22 },
  { time: "20:00", onTime: 96, flights: 16 },
  { time: "22:00", onTime: 94, flights: 8 },
  { time: "00:00", onTime: 98, flights: 4 },
  { time: "02:00", onTime: 97, flights: 2 },
  { time: "04:00", onTime: 95, flights: 6 },
]

interface OperationsChartProps {
  selectedPeriod: string
  loading?: boolean
}

export function OperationsChart({ selectedPeriod, loading }: OperationsChartProps) {
  if (loading) {
    return <div className="h-[300px] w-full flex items-center justify-center"><Skeleton className="h-48 w-full" /></div>;
  }
  return (
    <div className="h-[150px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom:0 }}>
          <XAxis dataKey="time" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
          <YAxis axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-lg">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Time:</span>
                        <span className="text-sm">{label}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">On-Time:</span>
                        <span className="text-sm font-bold text-primary">{payload[0].value}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Flights:</span>
                        <span className="text-sm">{payload[0].payload.flights}</span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Line
            type="monotone"
            dataKey="onTime"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
