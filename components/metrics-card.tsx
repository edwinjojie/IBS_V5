"use client"

import { Card } from "@/components/ui/card"
import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react"
import type React from "react"

interface MetricsCardProps {
  title: React.ReactNode
  value: string
  change: {
    value: string
    percentage: string
    isPositive: boolean
  }
  chart?: React.ReactNode
  onClick?: () => void
}

export function MetricsCard({ title, value, change, chart, onClick }: MetricsCardProps) {
  return (
    <Card
      className="p-3 bg-background/60 backdrop-blur-md border-border/50 hover:bg-background/80 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-foreground leading-tight">{title}</h3>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-extrabold text-foreground leading-none">{value}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-sm text-muted-foreground">{change.value}</span>
            <div className="flex items-center gap-1">
              {change.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-sm ${change.isPositive ? "text-green-500" : "text-red-500"}`}>
                {change.percentage}
              </span>
            </div>
          </div>
        </div>
        {chart}
      </div>
    </Card>
  )
}
