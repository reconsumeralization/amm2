"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Users,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  Star,
  TrendingUp,
  Search,
  Filter,
  Loader2
} from "@/lib/icon-mapping"
import { cn } from "@/lib/utils"
import { format, addDays, isBefore, startOfDay } from "date-fns"

interface Staff {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: 'stylist' | 'assistant' | 'manager'
  status: 'active' | 'inactive' | 'on-leave'
  hireDate: string
  rating: number
  totalBookings: number
  specializations: string[]
  workingHours: {
    monday: { start: string; end: string; isWorking: boolean }
    tuesday: { start: string; end: string; isWorking: boolean }
    wednesday: { start: string; end: string; isWorking: boolean }
    thursday: { start: string; end: string; isWorking: boolean }
    friday: { start: string; end: string; isWorking: boolean }
    saturday: { start: string; end: string; isWorking: boolean }
    sunday: { start: string; end: string; isWorking: boolean }
  }
}

interface Shift {
  id: string
  staffId: string
  staffName: string
  date: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
}

interface TimeOffRequest {
  id: string
  staffId: string
  staffName: string
  type: 'vacation' | 'sick' | 'personal' | 'training'
  startDate: string
  endDate: string
  status: 'pending' | 'approved' | 'rejected'
  reason: string
  requestedAt: string
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Mock data
  useEffect(() => {
    setStaff([
      {
        id: '1',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike@modernmen.com',
        phone: '(555) 123-4567',
        role: 'stylist',
        status: 'active',
        hireDate: '2023-01-15',
        rating: 4.8,
        totalBookings: 245,
        specializations: ['Haircut', 'Beard Trim', 'Styling'],
        workingHours: {
          monday: { start: '09:00', end: '17:00', isWorking: true },
          tuesday: { start: '09:00', end: '17:00', isWorking: true },
          wednesday: { start: '09:00', end: '17:00', isWorking: true },
          thursday: { start: '09:00', end: '17:00', isWorking: true },
          friday: { start: '09:00', end: '19:00', isWorking: true },
          saturday: { start: '08:00', end: '16:00', isWorking: true },
          sunday: { start: '10:00', end: '14:00', isWorking: false }
        }
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Davis',
        email: 'sarah@modernmen.com',
        phone: '(555) 987-6543',
        role: 'stylist',
        status: 'active',
        hireDate: '2023-03-20',
        rating: 4.9,
        totalBookings: 198,
        specializations: ['Haircut', 'Coloring', 'Styling'],
        workingHours: {
          monday: { start: '10:00', end: '18:00', isWorking: true },
          tuesday: { start: '10:00', end: '18:00', isWorking: true },
          wednesday: { start: '10:00', end: '18:00', isWorking: true },
          thursday: { start: '10:00', end: '18:00', isWorking: true },
          friday: { start: '10:00', end: '19:00', isWorking: true },
          saturday: { start: '09:00', end: '17:00', isWorking: true },
          sunday: { start: '11:00', end: '15:00', isWorking: false }
        }
      },
      {
        id: '3',
        firstName: 'Alex',
        lastName: 'Rodriguez',
        email: 'alex@modernmen.com',
        phone: '(555) 456-7890',
        role: 'assistant',
        status: 'active',
        hireDate: '2023-06-10',
        rating: 4.7,
        totalBookings: 156,
        specializations: ['Shampoo', 'Styling Assistance'],
        workingHours: {
          monday: { start: '08:00', end: '16:00', isWorking: true },
          tuesday: { start: '08:00', end: '16:00', isWorking: true },
          wednesday: { start: '08:00', end: '16:00', isWorking: true },
          thursday: { start: '08:00', end: '16:00', isWorking: true },
          friday: { start: '08:00', end: '17:00', isWorking: true },
          saturday: { start: '08:00', end: '16:00', isWorking: true },
          sunday: { start: '10:00', end: '14:00', isWorking: false }
        }
      }
    ])

    setShifts([
      {
        id: 's1',
        staffId: '1',
        staffName: 'Mike Johnson',
        date: '2024-12-16',
        startTime: '09:00',
        endTime: '17:00',
        status: 'scheduled',
        notes: 'Regular shift'
      },
      {
        id: 's2',
        staffId: '2',
        staffName: 'Sarah Davis',
        date: '2024-12-16',
        startTime: '10:00',
        endTime: '18:00',
        status: 'confirmed',
        notes: 'Coloring specialist shift'
      }
    ])

    setTimeOffRequests([
      {
        id: 'to1',
        staffId: '1',
        staffName: 'Mike Johnson',
        type: 'vacation',
        startDate: '2024-12-20',
        endDate: '2024-12-25',
        status: 'pending',
        reason: 'Family vacation',
        requestedAt: '2024-12-01T10:00:00Z'
      }
    ])
  }, [])

  const filteredStaff = staff.filter(person => {
    const matchesSearch =
      person.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = selectedRole === 'all' || person.role === selectedRole

    return matchesSearch && matchesRole
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'on-leave':
        return <Badge className="bg-yellow-100 text-yellow-800">On Leave</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getShiftStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTimeOffStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleApproveTimeOff = (requestId: string) => {
    setTimeOffRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status: 'approved' }
          : req
      )
    )
  }

  const handleRejectTimeOff = (requestId: string) => {
    setTimeOffRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status: 'rejected' }
          : req
      )
    )
  }

  const totalStaff = staff.length
  const activeStaff = staff.filter(s => s.status === 'active').length
  const stylists = staff.filter(s => s.role === 'stylist').length
  const averageRating = staff.reduce((sum, s) => sum + s.rating, 0) / staff.length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage staff schedules, working hours, and time-off requests</p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStaff}</div>
              <p className="text-xs text-muted-foreground">
                {activeStaff} active staff members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stylists</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stylists}</div>
              <p className="text-xs text-muted-foreground">
                Professional hair stylists
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Customer satisfaction score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {timeOffRequests.filter(r => r.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Time-off requests awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="staff" className="space-y-6">
          <TabsList>
            <TabsTrigger value="staff">Staff Directory</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="time-off">Time Off</TabsTrigger>
            <TabsTrigger value="shifts">Shift Management</TabsTrigger>
          </TabsList>

          {/* Staff Directory Tab */}
          <TabsContent value="staff" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex gap-4 items-center justify-between">
              <div className="flex gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="stylist">Stylist</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </div>

            {/* Staff Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredStaff.map((person) => (
                <Card key={person.id}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {person.firstName} {person.lastName}
                        </CardTitle>
                        <CardDescription className="capitalize">{person.role}</CardDescription>
                      </div>
                      {getStatusBadge(person.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{person.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{person.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{person.rating} rating</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span>{person.totalBookings} bookings</span>
                      </div>

                      <div className="pt-3 border-t">
                        <h4 className="font-medium text-sm mb-2">Specializations</h4>
                        <div className="flex flex-wrap gap-1">
                          {person.specializations.map((spec, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle>Staff Schedule</CardTitle>
                  <CardDescription>Select a date to view staff availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              {/* Staff Availability */}
              <Card>
                <CardHeader>
                  <CardTitle>Staff Availability</CardTitle>
                  <CardDescription>
                    {selectedDate ? format(selectedDate, 'EEEE, MMMM do') : 'Select a date'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDate && (
                    <div className="space-y-4">
                      {staff
                        .filter(person => person.status === 'active')
                        .map((person) => {
                          const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase() as keyof typeof person.workingHours
                          const schedule = person.workingHours[dayOfWeek]

                          return (
                            <div key={person.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <h4 className="font-medium">
                                  {person.firstName} {person.lastName}
                                </h4>
                                <p className="text-sm text-gray-600 capitalize">{person.role}</p>
                              </div>
                              <div className="text-right">
                                {schedule.isWorking ? (
                                  <div>
                                    <Badge className="bg-green-100 text-green-800">Available</Badge>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {schedule.start} - {schedule.end}
                                    </p>
                                  </div>
                                ) : (
                                  <Badge variant="secondary">Off</Badge>
                                )}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Time Off Tab */}
          <TabsContent value="time-off" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Time Off Requests</CardTitle>
                <CardDescription>Manage staff time-off requests and approvals</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeOffRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.staffName}</div>
                            <div className="text-sm text-gray-600">
                              Requested {new Date(request.requestedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {request.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{new Date(request.startDate).toLocaleDateString()}</div>
                            <div className="text-sm text-gray-600">
                              to {new Date(request.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{request.reason}</TableCell>
                        <TableCell>{getTimeOffStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveTimeOff(request.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectTimeOff(request.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shifts Tab */}
          <TabsContent value="shifts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Shift Management</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Shift
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Current Shifts</CardTitle>
                <CardDescription>View and manage staff shifts</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell className="font-medium">{shift.staffName}</TableCell>
                        <TableCell>{new Date(shift.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {shift.startTime} - {shift.endTime}
                        </TableCell>
                        <TableCell>{getShiftStatusBadge(shift.status)}</TableCell>
                        <TableCell>{shift.notes || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
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
        </Tabs>
      </div>
    </div>
  )
}