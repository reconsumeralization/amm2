"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Scissors, Plus, Filter } from "lucide-react"
import { Loading, Skeleton } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Appointment {
  id: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  service: {
    id: string
    name: string
    duration: number
    price: number
  }
  stylist: {
    id: string
    name: string
  }
  date: string
  time: string
  duration: number
  price: number
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  createdAt: string
  updatedAt: string
}

interface AppointmentCalendarProps {
  appointments?: Appointment[]
  onAppointmentClick?: (appointment: Appointment) => void
  onDateClick?: (date: Date) => void
  onCreateAppointment?: (date: Date, time?: string) => void
  isLoading?: boolean
  error?: string | null
  className?: string
  viewMode?: 'month' | 'week' | 'day'
  selectedDate?: Date
  onViewModeChange?: (mode: 'month' | 'week' | 'day') => void
  onDateChange?: (date: Date) => void
}

export function AppointmentCalendar({
  appointments = [],
  onAppointmentClick,
  onDateClick,
  onCreateAppointment,
  isLoading = false,
  error = null,
  className,
  viewMode = 'month',
  selectedDate,
  onViewModeChange,
  onDateChange
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterStylist, setFilterStylist] = useState<string>('all')
  const { toast } = useToast()

  // Sync current date with selectedDate prop
  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate)
    }
  }, [selectedDate])

  // Notify parent of date changes
  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date)
    onDateChange?.(date)
  }, [onDateChange])

  // Memoized calculations
  const { daysInMonth, firstDayOfMonth, days, emptyDays } = useMemo(() => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

    return { daysInMonth, firstDayOfMonth, days, emptyDays }
  }, [currentDate])

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const statusMatch = filterStatus === 'all' || apt.status === filterStatus
      const stylistMatch = filterStylist === 'all' || apt.stylist.id === filterStylist
      return statusMatch && stylistMatch
    })
  }, [appointments, filterStatus, filterStylist])

  // Get appointments for a specific date
  const getAppointmentsForDate = useCallback((day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return filteredAppointments.filter((apt) => apt.date === dateStr)
  }, [currentDate, filteredAppointments])

  // Navigate months
  const navigateMonth = useCallback((direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(currentDate.getMonth() - 1)
    } else {
      newDate.setMonth(currentDate.getMonth() + 1)
    }
    handleDateChange(newDate)
  }, [currentDate, handleDateChange])

  // Handle appointment click
  const handleAppointmentClick = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setAppointmentDialogOpen(true)
    onAppointmentClick?.(appointment)
  }, [onAppointmentClick])

  // Handle date click
  const handleDateClick = useCallback((day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    onDateClick?.(clickedDate)
  }, [currentDate, onDateClick])

  // Handle create appointment
  const handleCreateAppointment = useCallback((day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    onCreateAppointment?.(date)
  }, [currentDate, onCreateAppointment])

  // Get status styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "no-show":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "scheduled":
        return "secondary"
      case "in-progress":
        return "secondary"
      case "completed":
        return "outline"
      case "cancelled":
        return "destructive"
      case "no-show":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Check if date is today
  const isToday = useCallback((day: number) => {
    const today = new Date()
    return today.toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
  }, [currentDate])

  // Check if date is in the past
  const isPastDate = useCallback((day: number) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return checkDate < today
  }, [currentDate])

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers skeleton */}
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
            {/* Calendar days skeleton */}
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="text-red-500">
              <Calendar className="h-12 w-12 mx-auto" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Failed to load calendar</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendar View
              </CardTitle>
              <CardDescription>
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric"
                })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* View mode selector */}
              <Select
                value={viewMode}
                onValueChange={(value: 'month' | 'week' | 'day') => onViewModeChange?.(value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>

              {/* Filters */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Filter Appointments</DialogTitle>
                    <DialogDescription>
                      Filter appointments by status and stylist
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="no-show">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Stylist</label>
                      <Select value={filterStylist} onValueChange={setFilterStylist}>
                        <SelectTrigger>
                          <SelectValue placeholder="All stylists" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Stylists</SelectItem>
                          {/* This would be populated with actual stylists */}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Navigation */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
                aria-label={`${day} column`}
              >
                {day}
              </div>
            ))}

            {/* Empty days */}
            {emptyDays.map((day) => (
              <div
                key={`empty-${day}`}
                className="p-2 h-24"
                aria-hidden="true"
              />
            ))}

            {/* Calendar days */}
            {days.map((day) => {
              const dayAppointments = getAppointmentsForDate(day)
              const today = isToday(day)
              const pastDate = isPastDate(day)
              const hasAppointments = dayAppointments.length > 0

              return (
                <div
                  key={day}
                  className={cn(
                    "p-2 h-24 border border-border rounded-lg cursor-pointer transition-colors hover:bg-accent/5",
                    today && "bg-accent/10 border-accent",
                    pastDate && "opacity-60"
                  )}
                  onClick={() => handleDateClick(day)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Day ${day}, ${dayAppointments.length} appointments`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleDateClick(day)
                    }
                  }}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1 flex items-center justify-between",
                    today && "text-accent"
                  )}>
                    <span>{day}</span>
                    {hasAppointments && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {dayAppointments.length}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map((apt) => (
                      <button
                        key={apt.id}
                        className={cn(
                          "w-full text-left text-xs p-1 rounded border truncate transition-colors hover:opacity-80",
                          getStatusColor(apt.status)
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAppointmentClick(apt)
                        }}
                        title={`${apt.time} - ${apt.customer.name} (${apt.service.name})`}
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {apt.time} - {apt.customer.name}
                          </span>
                        </div>
                      </button>
                    ))}

                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayAppointments.length - 2} more
                      </div>
                    )}

                    {/* Add appointment button for future dates */}
                    {!pastDate && (
                      <button
                        className="w-full text-xs p-1 rounded border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCreateAppointment(day)
                        }}
                        title="Create new appointment"
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {selectedAppointment && `${selectedAppointment.customer.name} - ${selectedAppointment.service.name}`}
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedAppointment.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.customer.email}</p>
                </div>
              </div>

              {/* Service Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Scissors className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedAppointment.service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.duration} min • ${selectedAppointment.price}
                  </p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}
                  </p>
                  <Badge variant={getStatusBadgeVariant(selectedAppointment.status)}>
                    {selectedAppointment.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Notes:</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    // Handle appointment actions (edit, cancel, etc.)
                    toast({
                      title: "Appointment actions",
                      description: "This feature will be implemented soon.",
                    })
                    setAppointmentDialogOpen(false)
                  }}
                >
                  Manage Appointment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
