"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

const appointmentTrendsData = [
  { date: "Dec 1", appointments: 18, noShows: 2, cancellations: 1 },
  { date: "Dec 2", appointments: 22, noShows: 1, cancellations: 0 },
  { date: "Dec 3", appointments: 19, noShows: 3, cancellations: 2 },
  { date: "Dec 4", appointments: 25, noShows: 1, cancellations: 1 },
  { date: "Dec 5", appointments: 21, noShows: 2, cancellations: 0 },
  { date: "Dec 6", appointments: 28, noShows: 0, cancellations: 1 },
  { date: "Dec 7", appointments: 24, noShows: 1, cancellations: 2 },
  { date: "Dec 8", appointments: 20, noShows: 2, cancellations: 1 },
  { date: "Dec 9", appointments: 23, noShows: 1, cancellations: 0 },
  { date: "Dec 10", appointments: 26, noShows: 0, cancellations: 1 },
  { date: "Dec 11", appointments: 22, noShows: 2, cancellations: 1 },
  { date: "Dec 12", appointments: 24, noShows: 1, cancellations: 0 },
  { date: "Dec 13", appointments: 27, noShows: 1, cancellations: 2 },
  { date: "Dec 14", appointments: 29, noShows: 0, cancellations: 1 },
  { date: "Dec 15", appointments: 25, noShows: 2, cancellations: 0 },
]

const hourlyDistributionData = [
  { hour: "9 AM", appointments: 12 },
  { hour: "10 AM", appointments: 18 },
  { hour: "11 AM", appointments: 24 },
  { hour: "12 PM", appointments: 20 },
  { hour: "1 PM", appointments: 16 },
  { hour: "2 PM", appointments: 22 },
  { hour: "3 PM", appointments: 26 },
  { hour: "4 PM", appointments: 28 },
  { hour: "5 PM", appointments: 24 },
  { hour: "6 PM", appointments: 18 },
  { hour: "7 PM", appointments: 14 },
]

interface AppointmentTrendsProps {
  timeframe: string
}

export function AppointmentTrends({ timeframe }: AppointmentTrendsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Appointment Trends</CardTitle>
            <CardDescription>Appointments, no-shows, and cancellations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={appointmentTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="appointments" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                <Line type="monotone" dataKey="noShows" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                <Line type="monotone" dataKey="cancellations" stroke="hsl(var(--chart-3))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
            <CardDescription>Appointment distribution by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">94.2%</div>
              <div className="text-sm text-muted-foreground">Show Rate</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">3.8%</div>
              <div className="text-sm text-muted-foreground">No-Show Rate</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">2.0%</div>
              <div className="text-sm text-muted-foreground">Cancellation Rate</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">4:00 PM</div>
              <div className="text-sm text-muted-foreground">Peak Hour</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
