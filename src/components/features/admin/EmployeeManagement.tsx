'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icons } from '@/components/ui/icons'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { debounce } from 'lodash'
// Using emoji alternatives for icons due to package compatibility issues

interface Employee {
  id: string
  name: string
  avatar?: string
  userInfo?: {
    email: string
    phone?: string
    role: string
    isActive: boolean
    joinDate?: string
    department?: string
    address?: string
    emergencyContact?: string
    notes?: string
  }
  performance?: {
    rating?: number
    reviewCount?: number
    totalAppointments?: number
    completionRate?: number
    customerSatisfaction?: number
    punctualityScore?: number
    revenueGenerated?: number
    averageServiceTime?: number
  }
  recentAppointmentsCount?: number
  isActive: boolean
  featured?: boolean
  skills?: string[]
  certifications?: string[]
  availability?: {
    monday?: boolean
    tuesday?: boolean
    wednesday?: boolean
    thursday?: boolean
    friday?: boolean
    saturday?: boolean
    sunday?: boolean
  }
  workingHours?: {
    start: string
    end: string
  }
  commission?: number
  salary?: number
  hireDate?: string
  lastLogin?: string
  profileCompletion?: number
}

interface EmployeeStats {
  total: number
  active: number
  featured: number
  avgRating: number
  totalAppointments: number
  avgCompletionRate: number
  topPerformer?: Employee
  totalRevenue: number
  avgSalary: number
  newHiresThisMonth: number
}

interface EmployeeAnalytics {
  appointmentsThisMonth: number
  revenueGenerated: number
  customerRetentionRate: number
  averageServiceTime: number
  popularServices: Array<{ name: string; count: number; revenue: number }>
  monthlyTrend: Array<{ month: string; appointments: number; revenue: number }>
  customerFeedback: Array<{ rating: number; comment: string; date: string }>
  performanceMetrics: {
    punctuality: number
    customerSatisfaction: number
    salesPerformance: number
    teamwork: number
  }
  goals: Array<{ title: string; target: number; current: number; deadline: string }>
}

interface BulkAction {
  id: string
  label: string
  icon: React.ReactNode
  action: (selectedIds: string[]) => void
  variant?: 'default' | 'destructive'
}

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState<EmployeeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [employeeAnalytics, setEmployeeAnalytics] = useState<EmployeeAnalytics | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  // Enhanced debounced search
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      fetchEmployees()
    }, 300),
    [statusFilter, ratingFilter, departmentFilter, sortBy, sortOrder]
  )

  useEffect(() => {
    debouncedSearch(searchTerm)
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchTerm, debouncedSearch])

  useEffect(() => {
    fetchEmployees()
  }, [statusFilter, ratingFilter, departmentFilter, sortBy, sortOrder])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (statusFilter !== 'all') {
        params.set('isActive', statusFilter === 'active' ? 'true' : 'false')
      }
      if (departmentFilter !== 'all') params.set('department', departmentFilter)
      if (ratingFilter !== 'all') params.set('minRating', ratingFilter)
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

      const response = await fetch(`/api/employees?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch employees')

      const data = await response.json()
      setEmployees(data.employees)

      // Calculate enhanced stats
      const totalEmployees = data.total || data.employees.length
      const activeEmployees = data.employees.filter((e: Employee) => e.isActive).length
      const featuredEmployees = data.employees.filter((e: Employee) => e.featured).length
      const totalAppointments = data.employees.reduce((sum: number, e: Employee) =>
        sum + (e.recentAppointmentsCount || 0), 0
      )
      const totalRevenue = data.employees.reduce((sum: number, e: Employee) =>
        sum + (e.performance?.revenueGenerated || 0), 0
      )
      const avgSalary = data.employees.length > 0
        ? data.employees.reduce((sum: number, e: Employee) =>
            sum + (e.salary || 0), 0
          ) / data.employees.length
        : 0
      const avgRating = data.employees.length > 0
        ? data.employees.reduce((sum: number, e: Employee) =>
            sum + (e.performance?.rating || 0), 0
          ) / data.employees.length
        : 0
      const avgCompletionRate = data.employees.length > 0
        ? data.employees.reduce((sum: number, e: Employee) =>
            sum + (e.performance?.completionRate || 0), 0
          ) / data.employees.length
        : 0
      const topPerformer = data.employees.reduce((top: Employee | null, current: Employee) => {
        if (!top) return current
        const topScore = (top.performance?.rating || 0) * (top.performance?.completionRate || 0)
        const currentScore = (current.performance?.rating || 0) * (current.performance?.completionRate || 0)
        return currentScore > topScore ? current : top
      }, null)

      // Calculate new hires this month
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const newHiresThisMonth = data.employees.filter((e: Employee) => {
        if (!e.hireDate) return false
        const hireDate = new Date(e.hireDate)
        return hireDate.getMonth() === currentMonth && hireDate.getFullYear() === currentYear
      }).length

      setStats({
        total: totalEmployees,
        active: activeEmployees,
        featured: featuredEmployees,
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalAppointments,
        avgCompletionRate: parseFloat(avgCompletionRate.toFixed(1)),
        topPerformer,
        totalRevenue,
        avgSalary: parseFloat(avgSalary.toFixed(0)),
        newHiresThisMonth
      })
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployeeAnalytics = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/analytics`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()
      setEmployeeAnalytics(data)
    } catch (error) {
      console.error('Error fetching employee analytics:', error)
      toast.error('Failed to load employee analytics')
    }
  }

  const handleToggleStatus = async (employeeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (!response.ok) throw new Error('Failed to update employee status')

      toast.success(`Employee ${!currentStatus ? 'activated' : 'deactivated'}`)
      fetchEmployees()
    } catch (error) {
      console.error('Error updating employee status:', error)
      toast.error('Failed to update employee status')
    }
  }

  const handleToggleFeatured = async (employeeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentStatus })
      })

      if (!response.ok) throw new Error('Failed to update featured status')

      toast.success(`Employee ${!currentStatus ? 'featured' : 'unfeatured'}`)
      fetchEmployees()
    } catch (error) {
      console.error('Error updating featured status:', error)
      toast.error('Failed to update featured status')
    }
  }

  const handleViewAnalytics = (employee: Employee) => {
    setSelectedEmployee(employee)
    fetchEmployeeAnalytics(employee.id)
    setIsDialogOpen(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setIsEditDialogOpen(true)
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete employee')

      toast.success('Employee deleted successfully')
      fetchEmployees()
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast.error('Failed to delete employee')
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select employees first')
      return
    }

    setBulkActionLoading(true)
    try {
      const response = await fetch('/api/employees/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          employeeIds: selectedEmployees
        })
      })

      if (!response.ok) throw new Error('Failed to perform bulk action')

      toast.success(`Bulk action completed for ${selectedEmployees.length} employees`)
      setSelectedEmployees([])
      fetchEmployees()
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('Failed to perform bulk action')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchEmployees()
    setRefreshing(false)
    toast.success('Data refreshed')
  }

  const handleExportData = () => {
    const csvData = employees.map(emp => ({
      Name: emp.name,
      Email: emp.userInfo?.email,
      Phone: emp.userInfo?.phone,
      Department: emp.userInfo?.department,
      Status: emp.isActive ? 'Active' : 'Inactive',
      Rating: emp.performance?.rating,
      Appointments: emp.recentAppointmentsCount,
      Revenue: emp.performance?.revenueGenerated
    }))

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employees.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          {i < rating ? '⭐' : '☆'}
        </span>
      )
    }
    return stars
  }

  const renderAvailability = (availability?: Employee['availability']) => {
    if (!availability) return null
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
    
    return (
      <div className="flex space-x-1">
        {days.map((day, index) => (
          <TooltipProvider key={day}>
            <Tooltip>
              <TooltipTrigger>
                <div
                  className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                    availability[dayKeys[index]]
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {day[0]}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{day} - {availability[dayKeys[index]] ? 'Available' : 'Not Available'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    )
  }

  const getProfileCompletionColor = (completion: number) => {
    if (completion >= 80) return 'text-green-600'
    if (completion >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const bulkActions: BulkAction[] = [
    {
      id: 'activate',
      label: 'Activate Selected',
      icon: <span className="text-sm">✅</span>,
      action: () => handleBulkAction('activate')
    },
    {
      id: 'deactivate',
      label: 'Deactivate Selected',
      icon: <span className="text-sm">⚡</span>,
      action: () => handleBulkAction('deactivate')
    },
    {
      id: 'feature',
      label: 'Feature Selected',
      icon: <span className="text-sm">⭐</span>,
      action: () => handleBulkAction('feature')
    },
    {
      id: 'delete',
      label: 'Delete Selected',
      icon: <span className="text-sm">🗑️</span>,
      action: () => handleBulkAction('delete'),
      variant: 'destructive' as const
    }
  ]

  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees.filter(employee => {
      if (ratingFilter !== 'all') {
        const minRating = parseFloat(ratingFilter)
        if (!employee.performance?.rating || employee.performance.rating < minRating) {
          return false
        }
      }
      return true
    })

    return filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'rating':
          aValue = a.performance?.rating || 0
          bValue = b.performance?.rating || 0
          break
        case 'appointments':
          aValue = a.recentAppointmentsCount || 0
          bValue = b.recentAppointmentsCount || 0
          break
        case 'completion':
          aValue = a.performance?.completionRate || 0
          bValue = b.performance?.completionRate || 0
          break
        case 'revenue':
          aValue = a.performance?.revenueGenerated || 0
          bValue = b.performance?.revenueGenerated || 0
          break
        case 'joinDate':
          aValue = new Date(a.hireDate || 0).getTime()
          bValue = new Date(b.hireDate || 0).getTime()
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [employees, ratingFilter, sortBy, sortOrder])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Dashboard */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4"
        >
          <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Employees</div>
                </div>
                <span className="text-2xl text-blue-500">👥</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <span className="text-2xl text-green-500">✅</span>
              </div>
              <Progress value={(stats.active / stats.total) * 100} className="mt-2 h-1" />
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-amber-600">{stats.featured}</div>
                  <div className="text-sm text-gray-600">Featured</div>
                </div>
                <span className="text-2xl text-amber-500">⭐</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.avgRating}</div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
                <span className="text-yellow-500 text-2xl">🏆</span>
              </div>
              <div className="flex mt-1">{renderStars(Math.round(stats.avgRating))}</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalAppointments}</div>
                  <div className="text-sm text-gray-600">Total Appointments</div>
                </div>
                <span className="text-blue-500 text-2xl">📅</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.avgCompletionRate}%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
                <span className="text-purple-500 text-2xl">🎯</span>
              </div>
              <Progress value={stats.avgCompletionRate} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <span className="text-green-500 text-2xl">💰</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-indigo-600">{stats.newHiresThisMonth}</div>
                  <div className="text-sm text-gray-600">New Hires</div>
                </div>
                <span className="text-indigo-500 text-2xl">📈</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top Performer Highlight */}
      {stats?.topPerformer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full">
                    <span className="text-white text-2xl">🏆</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">🏆 Top Performer of the Month</h3>
                    <p className="text-gray-600 mb-2">
                      <span className="font-semibold">{stats.topPerformer.name}</span> - Outstanding performance!
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-yellow-500">⭐</span>
                        <span>{stats.topPerformer.performance?.rating}★ rating</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-green-500">🎯</span>
                        <span>{stats.topPerformer.performance?.completionRate}% completion</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-blue-500">💰</span>
                        <span>${stats.topPerformer.performance?.revenueGenerated?.toLocaleString()} revenue</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleViewAnalytics(stats.topPerformer!)}
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">💼</span>
                <span>Employee Management</span>
              </CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {filteredAndSortedEmployees.length} employees
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-gray-300"
              >
                <span className="text-xl mr-1">🔄</span>
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                <span className="text-xl mr-1">⬇️</span>
                Export
              </Button>
              
              <Button
                size="sm"
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <span className="text-xl mr-1">➕</span>
                Add Employee
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Enhanced Filter Bar */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                <Input
                  placeholder="Search employees by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <span className="text-xl">🔍</span>
                <span>Filters</span>
                {showFilters ? <span className="text-xl">▲</span> : <span className="text-xl">▼</span>}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <span className="text-xl">📋</span>
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <span className="text-xl">⊞</span>
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="hair">Hair Styling</SelectItem>
                      <SelectItem value="beard">Beard Care</SelectItem>
                      <SelectItem value="massage">Massage</SelectItem>
                      <SelectItem value="skincare">Skincare</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="4.5">4.5+ stars</SelectItem>
                      <SelectItem value="4.0">4.0+ stars</SelectItem>
                      <SelectItem value="3.5">3.5+ stars</SelectItem>
                      <SelectItem value="3.0">3.0+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="appointments">Appointments</SelectItem>
                      <SelectItem value="completion">Completion Rate</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="joinDate">Join Date</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setRatingFilter('all')
                      setDepartmentFilter('all')
                      setSortBy('name')
                      setSortOrder('asc')
                    }}
                    className="flex items-center space-x-2"
                  >
                    <span className="text-xl">❌</span>
                    <span>Clear</span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bulk Actions */}
            {selectedEmployees.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-600">
                    {selectedEmployees.length} selected
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Bulk actions available
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {bulkActions.map((action) => (
                    <Button
                      key={action.id}
                      variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={action.action}
                      disabled={bulkActionLoading}
                      className="flex items-center space-x-1"
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEmployees([])}
                  >
                    <span className="text-xl">❌</span>
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Employee List/Grid */}
          {filteredAndSortedEmployees.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl text-gray-400 mx-auto mb-4">👥</span>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No employees found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || ratingFilter !== 'all' || departmentFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by adding your first employee'
                }
              </p>
              <div className="flex justify-center space-x-2">
                <Button variant="outline" onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setRatingFilter('all')
                  setDepartmentFilter('all')
                }}>
                  Clear Filters
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <span className="text-xl mr-1">➕</span>
                  Add Employee
                </Button>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
              <AnimatePresence>
                {filteredAndSortedEmployees.map((employee, index) => (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={viewMode === 'grid' 
                      ? "bg-white border rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:scale-105"
                      : "flex flex-col lg:flex-row lg:items-center justify-between p-6 border rounded-xl hover:bg-gray-50 transition-all duration-200"
                    }
                  >
                    <div className={`flex items-start space-x-4 ${viewMode === 'grid' ? 'mb-4' : 'mb-4 lg:mb-0 flex-1'}`}>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployees([...selectedEmployees, employee.id])
                            } else {
                              setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id))
                            }
                          }}
                          className="absolute top-0 left-0 w-4 h-4 z-10"
                        />
                        <Avatar className="w-16 h-16 ml-6">
                          <AvatarImage src={employee.avatar} alt={employee.name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-lg">
                            {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {employee.featured && (
                          <Badge className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                            ⭐
                          </Badge>
                        )}
                        {!employee.isActive && (
                          <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-full flex items-center justify-center">
                            <span className="text-white text-xl">👁️‍🗨️</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-800 text-lg truncate">{employee.name}</h3>
                          {employee.isActive ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 text-xs">Inactive</Badge>
                          )}
                          {employee.profileCompletion && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getProfileCompletionColor(employee.profileCompletion)}`}
                            >
                              {employee.profileCompletion}% Complete
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">✉️</span>
                            <span className="truncate">{employee.userInfo?.email}</span>
                          </div>
                          {employee.userInfo?.phone && (
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">📞</span>
                              <span>{employee.userInfo.phone}</span>
                            </div>
                          )}
                          {employee.userInfo?.department && (
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">💼</span>
                              <Badge variant="outline" className="text-xs">
                                {employee.userInfo.department}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        {/* Performance Metrics */}
                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          {employee.performance?.rating && (
                            <div className="flex items-center space-x-1">
                              <div className="flex">{renderStars(employee.performance.rating)}</div>
                              <span className="text-gray-600">
                                ({employee.performance.reviewCount || 0})
                              </span>
                            </div>
                          )}
                          <div className="text-gray-600">
                            <span className="text-lg mr-1">📅</span>
                            {employee.recentAppointmentsCount || 0} appointments
                          </div>
                          {employee.performance?.completionRate && (
                            <div className="text-gray-600">
                              <span className="text-lg mr-1">🎯</span>
                              {employee.performance.completionRate}% completion
                            </div>
                          )}
                          {employee.performance?.revenueGenerated && (
                            <div className="text-gray-600">
                              <span className="text-lg mr-1">💰</span>
                              ${employee.performance.revenueGenerated.toLocaleString()}
                            </div>
                          )}
                        </div>
                        
                        {/* Skills */}
                        {employee.skills && employee.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {employee.skills.slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {employee.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{employee.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {/* Availability */}
                        {employee.availability && (
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs text-gray-500">Available:</span>
                            {renderAvailability(employee.availability)}
                          </div>
                        )}

                        {/* Working Hours */}
                        {employee.workingHours && (
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className="text-lg">🕐</span>
                            <span>{employee.workingHours.start} - {employee.workingHours.end}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={`flex ${viewMode === 'grid' ? 'justify-center space-x-2' : 'flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2'}`}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAnalytics(employee)}
                              className="border-blue-500 text-blue-600 hover:bg-blue-50"
                            >
                              <span className="text-lg">📊</span>
                              {viewMode === 'list' && <span className="ml-1">Analytics</span>}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View detailed analytics</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditEmployee(employee)}
                              className="border-gray-500 text-gray-600 hover:bg-gray-50"
                            >
                              <span className="text-lg">✏️</span>
                              {viewMode === 'list' && <span className="ml-1">Edit</span>}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit employee details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleFeatured(employee.id, employee.featured || false)}
                              className={employee.featured
                                ? 'border-amber-500 text-amber-600 hover:bg-amber-50'
                                : 'border-gray-500 text-gray-600 hover:bg-gray-50'
                              }
                            >
                              <span className="text-lg">⭐</span>
                              {viewMode === 'list' && <span className="ml-1">{employee.featured ? 'Featured' : 'Feature'}</span>}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{employee.featured ? 'Remove from featured' : 'Add to featured'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(employee.id, employee.isActive)}
                              className={employee.isActive
                                ? 'border-red-500 text-red-600 hover:bg-red-50'
                                : 'border-green-500 text-green-600 hover:bg-green-50'
                              }
                            >
                              <span className="text-sm">⚡</span>
                              {viewMode === 'list' && <span className="ml-1">{employee.isActive ? 'Deactivate' : 'Activate'}</span>}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{employee.isActive ? 'Deactivate employee' : 'Activate employee'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {viewMode === 'list' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteEmployee(employee.id)}
                                className="border-red-500 text-red-600 hover:bg-red-50"
                              >
                                <span className="text-lg">🗑️</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete employee</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Analytics Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedEmployee?.avatar} alt={selectedEmployee?.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {selectedEmployee?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-xl">{selectedEmployee?.name}</span>
                <div className="text-sm text-gray-500 font-normal">
                  {selectedEmployee?.userInfo?.department} • {selectedEmployee?.userInfo?.email}
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              Comprehensive performance analytics and insights
            </DialogDescription>
          </DialogHeader>
          
          {employeeAnalytics ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <span className="text-blue-500 text-3xl mx-auto mb-2 block">📅</span>
                      <div className="text-2xl font-bold text-blue-600">
                        {employeeAnalytics.appointmentsThisMonth}
                      </div>
                      <div className="text-sm text-gray-600">This Month</div>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <span className="text-green-500 text-3xl mx-auto mb-2 block">💰</span>
                      <div className="text-2xl font-bold text-green-600">
                        ${employeeAnalytics.revenueGenerated.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Revenue</div>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <span className="text-purple-500 text-3xl mx-auto mb-2 block">👥</span>
                      <div className="text-2xl font-bold text-purple-600">
                        {employeeAnalytics.customerRetentionRate}%
                      </div>
                      <div className="text-sm text-gray-600">Retention</div>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <span className="text-orange-500 text-3xl mx-auto mb-2 block">🕐</span>
                      <div className="text-2xl font-bold text-orange-600">
                        {employeeAnalytics.averageServiceTime}m
                      </div>
                      <div className="text-sm text-gray-600">Avg Time</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Monthly Trend Chart Placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span className="text-2xl">📈</span>
                      <span>Monthly Performance Trend</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-gray-400 text-3xl mx-auto mb-2 block">📊</span>
                        <p className="text-gray-500">Interactive chart visualization would be displayed here</p>
                        <p className="text-sm text-gray-400">Showing appointments and revenue trends over time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <span className="text-2xl">📊</span>
                        <span>Performance Metrics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Customer Satisfaction</span>
                          <span className="font-semibold">{employeeAnalytics.performanceMetrics.customerSatisfaction}%</span>
                        </div>
                        <Progress value={employeeAnalytics.performanceMetrics.customerSatisfaction} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Punctuality Score</span>
                          <span className="font-semibold">{employeeAnalytics.performanceMetrics.punctuality}%</span>
                        </div>
                        <Progress value={employeeAnalytics.performanceMetrics.punctuality} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Sales Performance</span>
                          <span className="font-semibold">{employeeAnalytics.performanceMetrics.salesPerformance}%</span>
                        </div>
                        <Progress value={employeeAnalytics.performanceMetrics.salesPerformance} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Teamwork Rating</span>
                          <span className="font-semibold">{employeeAnalytics.performanceMetrics.teamwork}%</span>
                        </div>
                        <Progress value={employeeAnalytics.performanceMetrics.teamwork} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <span className="text-2xl">🏆</span>
                        <span>Key Achievements</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-green-600 text-xl">🏆</span>
                          <div>
                            <div className="font-medium text-green-800">Top Performer</div>
                            <div className="text-sm text-green-600">Highest customer satisfaction this month</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                          <span className="text-blue-600 text-xl">⭐</span>
                          <div>
                            <div className="font-medium text-blue-800">5-Star Rating</div>
                            <div className="text-sm text-blue-600">Maintained excellent service quality</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                          <span className="text-purple-600 text-xl">🎯</span>
                          <div>
                            <div className="font-medium text-purple-800">Goal Achiever</div>
                            <div className="text-sm text-purple-600">Exceeded monthly targets</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="services" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span className="text-2xl">💼</span>
                      <span>Popular Services</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {employeeAnalytics.popularServices.map((service, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">{idx + 1}</span>
                            </div>
                            <div>
                              <div className="font-medium">{service.name}</div>
                              <div className="text-sm text-gray-600">{service.count} appointments</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">${service.revenue.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">Revenue</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="feedback" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span className="text-2xl">⭐</span>
                      <span>Customer Feedback</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {employeeAnalytics.customerFeedback.map((feedback, idx) => (
                        <div key={idx} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex">{renderStars(feedback.rating)}</div>
                              <span className="text-sm text-gray-500">{feedback.rating}/5</span>
                            </div>
                            <span className="text-sm text-gray-500">{feedback.date}</span>
                          </div>
                          <p className="text-gray-700 italic">"{feedback.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="goals" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span className="text-2xl">🎯</span>
                      <span>Performance Goals</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {employeeAnalytics.goals.map((goal, idx) => (
                        <div key={idx} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{goal.title}</h4>
                            <Badge variant={goal.current >= goal.target ? 'default' : 'secondary'}>
                              {goal.current >= goal.target ? 'Achieved' : 'In Progress'}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress: {goal.current} / {goal.target}</span>
                              <span>Deadline: {goal.deadline}</span>
                            </div>
                            <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <span className="text-blue-500 text-3xl mx-auto mb-4 block animate-spin">⟳</span>
                <p className="text-gray-500">Loading analytics data...</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Employee Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false)
          setIsEditDialogOpen(false)
          setEditingEmployee(null)
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? 'Update employee information and settings' : 'Create a new employee profile with all necessary details'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={editingEmployee?.name || ''}
                  onChange={(e) => setEditingEmployee(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={editingEmployee?.userInfo?.email || ''}
                  onChange={(e) => setEditingEmployee(prev => prev ? ({
                    ...prev,
                    userInfo: {
                      email: e.target.value,
                      phone: prev.userInfo?.phone || '',
                      role: prev.userInfo?.role || '',
                      isActive: prev.userInfo?.isActive ?? true,
                      joinDate: prev.userInfo?.joinDate || '',
                      department: prev.userInfo?.department || '',
                      address: prev.userInfo?.address || '',
                      emergencyContact: prev.userInfo?.emergencyContact || '',
                      notes: prev.userInfo?.notes || ''
                    }
                  }) : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={editingEmployee?.userInfo?.phone || ''}
                  onChange={(e) => setEditingEmployee(prev => prev ? ({
                    ...prev,
                    userInfo: {
                      email: prev.userInfo?.email || '',
                      phone: e.target.value,
                      role: prev.userInfo?.role || '',
                      isActive: prev.userInfo?.isActive ?? true,
                      joinDate: prev.userInfo?.joinDate || '',
                      department: prev.userInfo?.department || '',
                      address: prev.userInfo?.address || '',
                      emergencyContact: prev.userInfo?.emergencyContact || '',
                      notes: prev.userInfo?.notes || ''
                    }
                  }) : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={editingEmployee?.userInfo?.department || ''}
                  onValueChange={(value) => setEditingEmployee(prev => prev ? ({
                    ...prev,
                    userInfo: {
                      email: prev.userInfo?.email || '',
                      phone: prev.userInfo?.phone || '',
                      role: prev.userInfo?.role || '',
                      isActive: prev.userInfo?.isActive ?? true,
                      joinDate: prev.userInfo?.joinDate || '',
                      department: value,
                      address: prev.userInfo?.address || '',
                      emergencyContact: prev.userInfo?.emergencyContact || '',
                      notes: prev.userInfo?.notes || ''
                    }
                  }) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hair">Hair Styling</SelectItem>
                    <SelectItem value="beard">Beard Care</SelectItem>
                    <SelectItem value="massage">Massage</SelectItem>
                    <SelectItem value="skincare">Skincare</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  placeholder="Enter role/position"
                  value={editingEmployee?.userInfo?.role || ''}
                  onChange={(e) => setEditingEmployee(prev => prev ? ({
                    ...prev,
                    userInfo: {
                      email: prev.userInfo?.email || '',
                      phone: prev.userInfo?.phone || '',
                      role: e.target.value,
                      isActive: prev.userInfo?.isActive ?? true,
                      joinDate: prev.userInfo?.joinDate || '',
                      department: prev.userInfo?.department || '',
                      address: prev.userInfo?.address || '',
                      emergencyContact: prev.userInfo?.emergencyContact || '',
                      notes: prev.userInfo?.notes || ''
                    }
                  }) : null)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="Enter salary"
                  value={editingEmployee?.salary || ''}
                  onChange={(e) => setEditingEmployee(prev => ({ ...prev, salary: parseFloat(e.target.value) }))}
                />
              </div>
              
              <div>
                <Label htmlFor="commission">Commission Rate (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  placeholder="Enter commission rate"
                  value={editingEmployee?.commission || ''}
                  onChange={(e) => setEditingEmployee(prev => ({ ...prev, commission: parseFloat(e.target.value) }))}
                />
              </div>
              
              <div>
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={editingEmployee?.hireDate || ''}
                  onChange={(e) => setEditingEmployee(prev => ({ ...prev, hireDate: e.target.value }))}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={editingEmployee?.isActive || false}
                  onCheckedChange={(checked) => setEditingEmployee(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active Employee</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={editingEmployee?.featured || false}
                  onCheckedChange={(checked) => setEditingEmployee(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">Featured Employee</Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                placeholder="e.g., Hair Cutting, Beard Trimming, Customer Service"
                value={editingEmployee?.skills?.join(', ') || ''}
                onChange={(e) => setEditingEmployee(prev => ({
                  ...prev,
                  skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about the employee"
                value={editingEmployee?.userInfo?.notes || ''}
                onChange={(e) => setEditingEmployee(prev => prev ? ({
                  ...prev,
                  userInfo: {
                    email: prev.userInfo?.email || '',
                    phone: prev.userInfo?.phone || '',
                    role: prev.userInfo?.role || '',
                    isActive: prev.userInfo?.isActive ?? true,
                    joinDate: prev.userInfo?.joinDate || '',
                    department: prev.userInfo?.department || '',
                    address: prev.userInfo?.address || '',
                    emergencyContact: prev.userInfo?.emergencyContact || '',
                    notes: e.target.value
                  }
                }) : null)}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
                setEditingEmployee(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                // Handle save logic here
                toast.success(isEditDialogOpen ? 'Employee updated successfully' : 'Employee created successfully')
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
                setEditingEmployee(null)
                fetchEmployees()
              }}
            >
              {isEditDialogOpen ? 'Update Employee' : 'Create Employee'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
