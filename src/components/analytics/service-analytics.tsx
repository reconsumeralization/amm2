"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const servicePopularityData = [
  { service: "Haircut", bookings: 245, revenue: 8575 },
  { service: "Haircut & Beard", bookings: 189, revenue: 12285 },
  { service: "Beard Trim", bookings: 156, revenue: 3900 },
  { service: "Premium Shave", bookings: 98, revenue: 4410 },
  { service: "Full Service", bookings: 67, revenue: 5695 },
  { service: "Modern Fade", bookings: 134, revenue: 7370 },
]

const serviceRevenueData = [
  { name: "Haircuts", value: 8575, color: "hsl(var(--chart-1))" },
  { name: "Haircut & Beard", value: 12285, color: "hsl(var(--chart-2))" },
  { name: "Beard Services", value: 3900, color: "hsl(var(--chart-3))" },
  { name: "Premium Services", value: 4410, color: "hsl(var(--chart-4))" },
  { name: "Full Service", value: 5695, color: "hsl(var(--chart-5))" },
  { name: "Modern Styles", value: 7370, color: "hsl(var(--chart-1))" },
]

interface ServiceAnalyticsProps {
  timeframe: string
}

export function ServiceAnalytics({ timeframe }: ServiceAnalyticsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service Popularity</CardTitle>
            <CardDescription>Number of bookings by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={servicePopularityData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="service" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="bookings" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service</CardTitle>
            <CardDescription>Revenue distribution across services</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceRevenueData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {serviceRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Performance Metrics</CardTitle>
          <CardDescription>Detailed breakdown of service performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {servicePopularityData.map((service) => (
              <div key={service.service} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{service.service}</h3>
                  <p className="text-sm text-muted-foreground">{service.bookings} bookings this month</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">${service.revenue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    ${Math.round(service.revenue / service.bookings)} avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
