"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Search, Clock, User, Scissors, Phone } from "lucide-react"
import { AppointmentCalendar } from "@/components/appointment-calendar"
import { BookAppointmentDialog } from "@/components/book-appointment-dialog"
import { AppointmentFilters } from "@/components/appointment-filters"

const appointments = [
  {
    id: 1,
    customer: "John Smith",
    customerEmail: "john@email.com",
    customerPhone: "(555) 123-4567",
    service: "Haircut & Beard Trim",
    barber: "Mike Johnson",
    date: "2024-12-16",
    time: "10:00 AM",
    duration: 45,
    price: 65,
    status: "confirmed",
    notes: "Regular customer, prefers short sides",
  },
  {
    id: 2,
    customer: "David Wilson",
    customerEmail: "david@email.com",
    customerPhone: "(555) 234-5678",
    service: "Premium Shave",
    barber: "Sarah Davis",
    date: "2024-12-16",
    time: "11:30 AM",
    duration: 30,
    price: 45,
    status: "pending",
    notes: "First time customer",
  },
  {
    id: 3,
    customer: "Robert Brown",
    customerEmail: "robert@email.com",
    customerPhone: "(555) 345-6789",
    service: "Full Service",
    barber: "Mike Johnson",
    date: "2024-12-16",
    time: "2:00 PM",
    duration: 60,
    price: 85,
    status: "confirmed",
    notes: "Wedding preparation",
  },
  {
    id: 4,
    customer: "Michael Davis",
    customerEmail: "michael@email.com",
    customerPhone: "(555) 456-7890",
    service: "Modern Fade",
    barber: "Alex Rodriguez",
    date: "2024-12-16",
    time: "3:30 PM",
    duration: 40,
    price: 55,
    status: "confirmed",
    notes: "",
  },
  {
    id: 5,
    customer: "James Wilson",
    customerEmail: "james@email.com",
    customerPhone: "(555) 567-8901",
    service: "Beard Styling",
    barber: "Sarah Davis",
    date: "2024-12-17",
    time: "9:00 AM",
    duration: 25,
    price: 35,
    status: "pending",
    notes: "Prefers natural look",
  },
]

const todayAppointments = appointments.filter((apt) => apt.date === "2024-12-16")
const upcomingAppointments = appointments.filter((apt) => apt.date > "2024-12-16")

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.barber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "pending":
        return "secondary"
      case "completed":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Appointments & Scheduling</h1>
                <p className="text-muted-foreground">Manage bookings and schedule appointments</p>
              </div>
              <BookAppointmentDialog />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayAppointments.length}</div>
                  <p className="text-xs text-green-600">
                    {todayAppointments.filter((a) => a.status === "confirmed").length} confirmed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">47</div>
                  <p className="text-xs text-green-600">+12% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Today</CardTitle>
                  <Scissors className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${todayAppointments.reduce((sum, apt) => sum + apt.price, 0)}
                  </div>
                  <p className="text-xs text-green-600">From {todayAppointments.length} appointments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42min</div>
                  <p className="text-xs text-green-600">Optimal scheduling</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="list" className="space-y-4">
              <TabsList>
                <TabsTrigger value="list">Appointment List</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                <TabsTrigger value="today">Today's Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>All Appointments</CardTitle>
                        <CardDescription>View and manage all scheduled appointments</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <AppointmentFilters onStatusChange={setStatusFilter} />
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="Search appointments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Barber</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{appointment.customer}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {appointment.customerPhone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{appointment.service}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {appointment.barber
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                {appointment.barber}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{new Date(appointment.date).toLocaleDateString()}</div>
                                <div className="text-sm text-muted-foreground">{appointment.time}</div>
                              </div>
                            </TableCell>
                            <TableCell>{appointment.duration} min</TableCell>
                            <TableCell>${appointment.price}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  Edit
                                </Button>
                                <Button size="sm" variant="outline">
                                  Cancel
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar" className="space-y-4">
                <AppointmentCalendar appointments={appointments} />
              </TabsContent>

              <TabsContent value="today" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Today's Schedule</CardTitle>
                      <CardDescription>December 16, 2024</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {todayAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="font-medium text-sm">{appointment.time}</div>
                                <div className="text-xs text-muted-foreground">{appointment.duration}min</div>
                              </div>
                              <div>
                                <div className="font-medium">{appointment.customer}</div>
                                <div className="text-sm text-muted-foreground">{appointment.service}</div>
                                <div className="text-xs text-muted-foreground">with {appointment.barber}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                              <div className="text-sm font-medium mt-1">${appointment.price}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Stats</CardTitle>
                      <CardDescription>Today's performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Appointments:</span>
                          <span className="font-medium">{todayAppointments.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Confirmed:</span>
                          <span className="font-medium text-green-600">
                            {todayAppointments.filter((a) => a.status === "confirmed").length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pending:</span>
                          <span className="font-medium text-yellow-600">
                            {todayAppointments.filter((a) => a.status === "pending").length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Revenue:</span>
                          <span className="font-medium">
                            ${todayAppointments.reduce((sum, apt) => sum + apt.price, 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Service Time:</span>
                          <span className="font-medium">
                            {Math.round(
                              todayAppointments.reduce((sum, apt) => sum + apt.duration, 0) / todayAppointments.length,
                            )}{" "}
                            min
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
