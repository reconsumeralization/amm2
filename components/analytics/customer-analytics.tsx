"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const customerGrowthData = [
  { month: "Jul", newCustomers: 45, returningCustomers: 120 },
  { month: "Aug", newCustomers: 52, returningCustomers: 135 },
  { month: "Sep", newCustomers: 38, returningCustomers: 142 },
  { month: "Oct", newCustomers: 61, returningCustomers: 158 },
  { month: "Nov", newCustomers: 49, returningCustomers: 167 },
  { month: "Dec", newCustomers: 67, returningCustomers: 180 },
]

const customerSegmentData = [
  { name: "VIP", value: 85, color: "hsl(var(--chart-1))" },
  { name: "Regular", value: 234, color: "hsl(var(--chart-2))" },
  { name: "New", value: 156, color: "hsl(var(--chart-3))" },
  { name: "Inactive", value: 67, color: "hsl(var(--chart-4))" },
]

interface CustomerAnalyticsProps {
  timeframe: string
}

export function CustomerAnalytics({ timeframe }: CustomerAnalyticsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Customer Growth</CardTitle>
          <CardDescription>New vs returning customers over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customerGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="newCustomers" fill="hsl(var(--chart-1))" name="New Customers" />
              <Bar dataKey="returningCustomers" fill="hsl(var(--chart-2))" name="Returning Customers" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Segments</CardTitle>
          <CardDescription>Distribution of customer types</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerSegmentData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {customerSegmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Customer Insights</CardTitle>
          <CardDescription>Key customer metrics and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">4.2</div>
              <div className="text-sm text-muted-foreground">Avg Visits/Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">$284</div>
              <div className="text-sm text-muted-foreground">Customer LTV</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">89%</div>
              <div className="text-sm text-muted-foreground">Retention Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">23 days</div>
              <div className="text-sm text-muted-foreground">Avg Return Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
