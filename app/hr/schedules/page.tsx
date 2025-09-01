'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  Edit,
  Trash2,
  Users,
  MapPin,
  Briefcase
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns'

interface Schedule {
  id: string
  employeeName: string
  date: string
  startTime: string
  endTime: string
  position: string
  location: string
  status: string
  shiftType: string
  notes?: string
}

interface ScheduleStats {
  totalShifts: number
  scheduledEmployees: number
  openShifts: number
  conflicts: number
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [stats, setStats] = useState<ScheduleStats>({
    totalShifts: 0,
    scheduledEmployees: 0,
    openShifts: 0,
    conflicts: 0,
  })
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedWeek, setSelectedWeek] = useState({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date()),
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const { toast } = useToast()

  // Form state for creating/editing schedules
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    startTime: '',
    endTime: '',
    position: '',
    location: 'main-salon',
    shiftType: 'regular',
    notes: '',
  })

  useEffect(() => {
    loadSchedules()
  }, [selectedWeek])

  const loadSchedules = async () => {
    setIsLoading(true)
    try {
      const startDate = format(selectedWeek.start, 'yyyy-MM-dd')
      const endDate = format(selectedWeek.end, 'yyyy-MM-dd')

      const response = await fetch(`/api/hr/schedules?startDate=${startDate}&endDate=${endDate}`)
      if (response.ok) {
        const data = await response.json()
        setSchedules(data.schedules || [])
        setStats(data.stats || stats)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load schedules',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to load schedules:', error)
      toast({
        title: 'Error',
        description: 'Failed to load schedules',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const days = direction === 'next' ? 7 : -7
    const newStart = addDays(selectedWeek.start, days)
    const newEnd = addDays(selectedWeek.end, days)
    setSelectedWeek({ start: newStart, end: newEnd })
  }

  const handleCreateSchedule = async () => {
    try {
      const response = await fetch('/api/hr/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Schedule created successfully',
        })
        setIsCreateDialogOpen(false)
        resetForm()
        loadSchedules()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.message || 'Failed to create schedule',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Create schedule error:', error)
      toast({
        title: 'Error',
        description: 'Failed to create schedule',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return

    try {
      const response = await fetch(`/api/hr/schedules/${editingSchedule.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Schedule updated successfully',
        })
        setEditingSchedule(null)
        resetForm()
        loadSchedules()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.message || 'Failed to update schedule',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Update schedule error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update schedule',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return

    try {
      const response = await fetch(`/api/hr/schedules/${scheduleId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Schedule deleted successfully',
        })
        loadSchedules()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete schedule',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Delete schedule error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setFormData({
      employeeId: '',
      date: '',
      startTime: '',
      endTime: '',
      position: '',
      location: 'main-salon',
      shiftType: 'regular',
      notes: '',
    })
  }

  const openEditDialog = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      employeeId: '', // Would need to map from schedule
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      position: schedule.position,
      location: schedule.location,
      shiftType: schedule.shiftType,
      notes: schedule.notes || '',
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      scheduled: 'secondary',
      confirmed: 'default',
      'in-progress': 'outline',
      completed: 'default',
      cancelled: 'destructive',
      'no-show': 'destructive',
    }

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    )
  }

  const getShiftTypeBadge = (shiftType: string) => {
    const colors: Record<string, string> = {
      regular: 'bg-blue-100 text-blue-800',
      overtime: 'bg-orange-100 text-orange-800',
      training: 'bg-purple-100 text-purple-800',
      'special-event': 'bg-pink-100 text-pink-800',
      'on-call': 'bg-gray-100 text-gray-800',
    }

    return (
      <Badge className={colors[shiftType] || 'bg-gray-100 text-gray-800'}>
        {shiftType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    )
  }

  // Group schedules by day
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    const day = format(new Date(schedule.date), 'yyyy-MM-dd')
    if (!acc[day]) acc[day] = []
    acc[day].push(schedule)
    return acc
  }, {} as Record<string, Schedule[]>)

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Schedule Management</h1>
        <p className="text-muted-foreground">
          Manage employee schedules, shifts, and availability
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShifts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Shifts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openShifts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conflicts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => handleWeekChange('prev')}>
            Previous Week
          </Button>
          <div className="text-lg font-medium">
            {format(selectedWeek.start, 'MMM d')} - {format(selectedWeek.end, 'MMM d, yyyy')}
          </div>
          <Button variant="outline" onClick={() => handleWeekChange('next')}>
            Next Week
          </Button>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Schedule</DialogTitle>
              <DialogDescription>
                Add a new employee schedule
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stylist">Stylist</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="cleaning">Cleaning Staff</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main-salon">Main Salon</SelectItem>
                    <SelectItem value="branch-1">Branch Location 1</SelectItem>
                    <SelectItem value="branch-2">Branch Location 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="shiftType">Shift Type</Label>
                <Select value={formData.shiftType} onValueChange={(value) => setFormData({ ...formData, shiftType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="overtime">Overtime</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="special-event">Special Event</SelectItem>
                    <SelectItem value="on-call">On-Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSchedule}>
                  Create Schedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="grid grid-cols-7 gap-4">
        {Array.from({ length: 7 }, (_, i) => {
          const day = addDays(selectedWeek.start, i)
          const dayKey = format(day, 'yyyy-MM-dd')
          const daySchedules = schedulesByDay[dayKey] || []

          return (
            <Card key={dayKey} className="min-h-96">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  {format(day, 'EEE')}
                </CardTitle>
                <CardDescription>
                  {format(day, 'MMM d')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {daySchedules.map((schedule) => (
                    <div key={schedule.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-sm">
                          {schedule.employeeName}
                        </div>
                        {getStatusBadge(schedule.status)}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {schedule.position}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {schedule.location}
                        </div>
                        {getShiftTypeBadge(schedule.shiftType)}
                      </div>
                      <div className="flex gap-1 mt-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(schedule)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteSchedule(schedule.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {daySchedules.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      No shifts scheduled
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
