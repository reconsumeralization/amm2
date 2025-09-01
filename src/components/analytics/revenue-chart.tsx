"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const revenueData = [
  { date: "Dec 1", revenue: 1200, target: 1500 },
  { date: "Dec 2", revenue: 1800, target: 1500 },
  { date: "Dec 3", revenue: 1600, target: 1500 },
  { date: "Dec 4", revenue: 2200, target: 1500 },
  { date: "Dec 5", revenue: 1900, target: 1500 },
  { date: "Dec 6", revenue: 2400, target: 1500 },
  { date: "Dec 7", revenue: 2100, target: 1500 },
  { date: "Dec 8", revenue: 1700, target: 1500 },
  { date: "Dec 9", revenue: 2000, target: 1500 },
  { date: "Dec 10", revenue: 2300, target: 1500 },
  { date: "Dec 11", revenue: 1950, target: 1500 },
  { date: "Dec 12", revenue: 2150, target: 1500 },
  { date: "Dec 13", revenue: 2400, target: 1500 },
  { date: "Dec 14", revenue: 2600, target: 1500 },
  { date: "Dec 15", revenue: 2200, target: 1500 },
]

interface RevenueChartProps {
  timeframe: string
}

export function RevenueChart({ timeframe }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trends</CardTitle>
        <CardDescription>Daily revenue vs target for the selected period</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, ""]} />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} />
            <Line type="monotone" dataKey="target" stroke="hsl(var(--chart-2))" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
