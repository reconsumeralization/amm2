import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardStats } from "@/components/dashboard-stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, MapPin } from "lucide-react"

const upcomingAppointments = [
  {
    id: 1,
    customer: "John Smith",
    service: "Haircut & Beard Trim",
    time: "10:00 AM",
    barber: "Mike Johnson",
    status: "confirmed",
  },
  {
    id: 2,
    customer: "David Wilson",
    service: "Premium Shave",
    time: "11:30 AM",
    barber: "Sarah Davis",
    status: "pending",
  },
  {
    id: 3,
    customer: "Robert Brown",
    service: "Full Service",
    time: "2:00 PM",
    barber: "Mike Johnson",
    status: "confirmed",
  },
]

const recentActivity = [
  { action: "New customer registered", user: "Emma Thompson", time: "5 min ago" },
  { action: "Appointment completed", user: "John Smith", time: "15 min ago" },
  { action: "Staff member clocked in", user: "Mike Johnson", time: "1 hour ago" },
  { action: "Payment received", user: "David Wilson", time: "2 hours ago" },
]

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Welcome Section */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome back, Admin</h1>
              <p className="text-muted-foreground">Here's what's happening at your barbershop today.</p>
            </div>

            {/* Stats Cards */}
            <DashboardStats />

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Today's Appointments */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Today's Appointments
                  </CardTitle>
                  <CardDescription>Manage and track today's scheduled appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{appointment.customer}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {appointment.time}
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm">{appointment.service}</span>
                            <span className="text-xs text-muted-foreground">with {appointment.barber}</span>
                          </div>
                        </div>
                        <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                    <Button className="w-full bg-transparent" variant="outline">
                      View All Appointments
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates from your barbershop</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{activity.user}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts for efficient management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button className="h-20 flex flex-col gap-2">
                    <User className="h-6 w-6" />
                    Add Customer
                  </Button>
                  <Button className="h-20 flex flex-col gap-2 bg-transparent" variant="outline">
                    <Calendar className="h-6 w-6" />
                    Book Appointment
                  </Button>
                  <Button className="h-20 flex flex-col gap-2 bg-transparent" variant="outline">
                    <Clock className="h-6 w-6" />
                    Staff Schedule
                  </Button>
                  <Button className="h-20 flex flex-col gap-2 bg-transparent" variant="outline">
                    <MapPin className="h-6 w-6" />
                    Shop Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
