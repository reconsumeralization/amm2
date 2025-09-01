"use client"

import { useState, useEffect } from "react"

// Define proper types for appointments
interface AppointmentUser {
  firstName?: string
  lastName?: string
  email?: string
}

interface AppointmentService {
  name?: string
  price?: number
  duration?: number
}

interface AppointmentStylist {
  firstName?: string
  lastName?: string
}

interface Appointment {
  id: string
  date: string
  time?: string
  status: string
  price?: number
  duration?: number
  user?: AppointmentUser | string
  service?: AppointmentService | string
  stylist?: AppointmentStylist | string
  customer?: string
  barber?: string
}
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Search, Clock, Users, Phone, Loader2, AlertTriangle, User, Loader, AlertCircle, Scissors } from "@/lib/icon-mapping"

// Icons imported successfully
import { AppointmentCalendar } from "@/components/appointment-calendar"
import { BookAppointmentDialog } from "@/components/book-appointment-dialog"
import { AppointmentFilters } from "@/components/appointment-filters"
import { useAppointments } from "@/hooks/useAppointments"

// Remove static data - will use API hook instead

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Use the appointments API hook
  const {
    appointments,
    loading,
    error,
    fetchAppointments
  } = useAppointments()

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Filter appointments based on search and status
  const filteredAppointments = appointments.filter((appointment: Appointment) => {
    const customerName = typeof appointment.user === 'string' ? appointment.user :
      `${appointment.user?.firstName || ''} ${appointment.user?.lastName || ''}`.trim()
    const serviceName = typeof appointment.service === 'string' ? appointment.service :
      appointment.service?.name || ''
    const barberName = typeof appointment.stylist === 'string' ? appointment.stylist :
      `${appointment.stylist?.firstName || ''} ${appointment.stylist?.lastName || ''}`.trim()

    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barberName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Filter for today's appointments
  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter((apt: Appointment) =>
    new Date(apt.date).toISOString().split('T')[0] === today
  )

  // Filter for upcoming appointments
  const upcomingAppointments = appointments.filter((apt: Appointment) =>
    new Date(apt.date).toISOString().split('T')[0] > today
  )

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

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading appointments...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">Failed to load appointments</p>
                <Button onClick={() => fetchAppointments()}>
                  Try Again
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
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
                    {todayAppointments.filter((a: Appointment) => a.status === "confirmed").length} confirmed
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
                    ${todayAppointments.reduce((sum: number, apt: Appointment) => sum + (apt.price || 0), 0)}
                  </div>
                  <p className="text-xs text-green-600">From {todayAppointments.length} appointments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
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
                        {filteredAppointments.map((appointment: Appointment) => {
                          const customerName = typeof appointment.user === 'string' ? appointment.user :
                            `${appointment.user?.firstName || ''} ${appointment.user?.lastName || ''}`.trim()
                          const customerEmail = typeof appointment.user === 'string' ? '' :
                            appointment.user?.email || ''
                          const serviceName = typeof appointment.service === 'string' ? appointment.service :
                            appointment.service?.name || ''
                          const barberName = typeof appointment.stylist === 'string' ? appointment.stylist :
                            `${appointment.stylist?.firstName || ''} ${appointment.stylist?.lastName || ''}`.trim()
                          const price = appointment.price || (typeof appointment.service === 'string' ? 0 : appointment.service?.price || 0)
                          const duration = appointment.duration || (typeof appointment.service === 'string' ? 0 : appointment.service?.duration || 0)

                          return (
                            <TableRow key={appointment.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{customerName}</div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {customerEmail}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{serviceName}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {barberName
                                        .split(" ")
                                        .map((name: string) => name[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  {barberName}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{new Date(appointment.date).toLocaleDateString()}</div>
                                  <div className="text-sm text-muted-foreground">{new Date(appointment.date).toLocaleTimeString()}</div>
                                </div>
                              </TableCell>
                              <TableCell>{duration} min</TableCell>
                              <TableCell>${price}</TableCell>
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
                          )
                        })}
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
                        {todayAppointments.map((appointment: Appointment) => (
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
                            {todayAppointments.filter((a: Appointment) => a.status === "confirmed").length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pending:</span>
                          <span className="font-medium text-yellow-600">
                            {todayAppointments.filter((a: Appointment) => a.status === "pending").length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Revenue:</span>
                          <span className="font-medium">
                            ${todayAppointments.reduce((sum: number, apt: Appointment) => sum + (apt.price || 0), 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Service Time:</span>
                          <span className="font-medium">
                            {Math.round(
                              todayAppointments.reduce((sum: number, apt: Appointment) => sum + (apt.duration || 0), 0) / todayAppointments.length,
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
