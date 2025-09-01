"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Search, Clock, DollarSign, Star, Phone, Mail, Edit, Trash2, Loader2, AlertCircle } from "@/lib/icon-mapping"
import { AddStaffDialog } from "@/components/add-staff-dialog"
import { StaffSchedule } from "@/components/staff-schedule"
import { EditStaffDialog } from "@/components/staff-management/edit-staff-dialog"
import { DeleteStaffDialog } from "@/components/staff-management/delete-staff-dialog"
import { ClockInOut } from "@/components/time-tracking/clock-in-out"
import { useUsers } from "@/hooks/useUsers"
import { useStylists } from "@/hooks/useStylists"
import { createSupabaseClient } from "@/lib/supabase"

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [editStaff, setEditStaff] = useState<any>(null)
  const [deleteStaff, setDeleteStaff] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [staffData, setStaffData] = useState<any[]>([])

  // Use the API hooks
  const {
    users: staffMembers,
    loading: usersLoading,
    error: usersError,
    fetchUsers
  } = useUsers()

  const {
    stylists,
    loading: stylistsLoading,
    error: stylistsError,
    fetchStylists
  } = useStylists()

  // Filter for staff roles (barber, manager, admin)
  const staffUsers = staffMembers.filter((user: any) =>
    ['barber', 'manager', 'admin'].includes(user.role)
  )

  // Mock payroll data
  const payrollData = [
    { name: "John Doe", hoursWorked: 40, hourlyRate: 25, grossPay: 1000, tips: 150, total: 1150 },
    { name: "Jane Smith", hoursWorked: 38, hourlyRate: 22, grossPay: 836, tips: 120, total: 956 },
    { name: "Mike Johnson", hoursWorked: 35, hourlyRate: 20, grossPay: 700, tips: 95, total: 795 },
  ]

  // Fetch data on component mount
  useEffect(() => {
    fetchUsers({ role: ['barber', 'manager', 'admin'] })
    fetchStylists()
    fetchCurrentUser()
    fetchStaffData()
  }, [fetchUsers, fetchStylists])

  const fetchCurrentUser = async () => {
    const supabase = createSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setCurrentUser(profile)
    }
  }

  const fetchStaffData = async () => {
    const supabase = createSupabaseClient()
    const { data } = await supabase
      .from("staff")
      .select(`
        *,
        profiles:id (
          first_name,
          last_name,
          email,
          phone,
          avatar_url
        )
      `)
      .eq("is_active", true)

    if (data) {
      const formattedData = data.map((staff: any) => ({
        id: staff.id,
        name: `${staff.profiles.first_name} ${staff.profiles.last_name}`,
        role: staff.employee_id || "Staff Member",
        email: staff.profiles.email,
        phone: staff.profiles.phone || "",
        status: "active",
        rating: 4.8, // This would come from reviews/ratings table
        experience: "5 years", // This would be calculated from hire_date
        specialties: staff.specialties || [],
        hourlyRate: staff.hourly_rate || 0,
        hoursThisWeek: 40, // This would come from time_entries
        avatar: staff.profiles.avatar_url,
      }))
      setStaffData(formattedData)
    }
  }

  const filteredStaff = staffData.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
                <h1 className="text-3xl font-bold text-foreground">Staff & HR Management</h1>
                <p className="text-muted-foreground">Manage your team, schedules, and payroll</p>
              </div>
              <AddStaffDialog />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{staffData.length}</div>
                  <p className="text-xs text-green-600">All active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Hours This Week</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">153</div>
                  <p className="text-xs text-green-600">+5 from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Payroll</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$5,435</div>
                  <p className="text-xs text-green-600">Including tips</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8</div>
                  <p className="text-xs text-green-600">Excellent performance</p>
                </CardContent>
              </Card>
            </div>

            {/* Time Clock section for current user if they're staff */}
            {currentUser && currentUser.role !== "customer" && (
              <ClockInOut staffId={currentUser.id} staffName={`${currentUser.first_name} ${currentUser.last_name}`} />
            )}

            {/* Main Content */}
            <Tabs defaultValue="staff" className="space-y-4">
              <TabsList>
                <TabsTrigger value="staff">Staff Directory</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="payroll">Payroll</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="staff" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Staff Directory</CardTitle>
                        <CardDescription>Manage your team members and their information</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="Search staff..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredStaff.map((staff) => (
                        <Card key={staff.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={staff.avatar || "/placeholder.svg"} alt={staff.name} />
                                  <AvatarFallback>
                                    {staff.name
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold">{staff.name}</h3>
                                  <p className="text-sm text-muted-foreground">{staff.role}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs">{staff.rating}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge variant={staff.status === "active" ? "default" : "secondary"}>
                                {staff.status}
                              </Badge>
                            </div>

                            <div className="mt-4 space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {staff.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {staff.phone}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {staff.hoursThisWeek}h this week
                              </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              <div className="text-sm">
                                <span className="font-medium">${staff.hourlyRate}/hr</span>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" onClick={() => setEditStaff(staff)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setDeleteStaff(staff)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <StaffSchedule />
              </TabsContent>

              <TabsContent value="payroll" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Payroll</CardTitle>
                    <CardDescription>Current week payroll summary</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Gross Pay</TableHead>
                          <TableHead>Tips</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payrollData.map((employee) => (
                          <TableRow key={employee.name}>
                            <TableCell className="font-medium">{employee.name}</TableCell>
                            <TableCell>{employee.hoursWorked}</TableCell>
                            <TableCell>${employee.hourlyRate}</TableCell>
                            <TableCell>${employee.grossPay}</TableCell>
                            <TableCell>${employee.tips}</TableCell>
                            <TableCell className="font-medium">${employee.total}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Track staff performance and customer satisfaction</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {staffData
                        .filter((s) => s.role.includes("Barber"))
                        .map((staff) => (
                          <Card key={staff.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage src={staff.avatar || "/placeholder.svg"} alt={staff.name} />
                                    <AvatarFallback>
                                      {staff.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-semibold">{staff.name}</h3>
                                    <p className="text-sm text-muted-foreground">{staff.role}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{staff.rating}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Experience:</span>
                                  <span className="font-medium">{staff.experience}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Specialties:</span>
                                  <span className="font-medium">{staff.specialties.join(", ")}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>This Week:</span>
                                  <span className="font-medium">{staff.hoursThisWeek} hours</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Edit and delete dialogs */}
      {editStaff && (
        <EditStaffDialog
          staff={editStaff}
          open={!!editStaff}
          onOpenChange={(open) => !open && setEditStaff(null)}
          onUpdate={() => {
            fetchStaffData()
            setEditStaff(null)
          }}
        />
      )}

      {deleteStaff && (
        <DeleteStaffDialog
          staffId={deleteStaff.id}
          staffName={deleteStaff.name}
          open={!!deleteStaff}
          onOpenChange={(open) => !open && setDeleteStaff(null)}
          onDelete={() => {
            fetchStaffData()
            setDeleteStaff(null)
          }}
        />
      )}
    </div>
  )
}
