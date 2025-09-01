'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Calendar, DollarSign, Clock, User, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface PayrollRecord {
  id: string
  employeeName: string
  periodStart: string
  periodEnd: string
  grossPay: number
  netPay: number
  status: string
  paymentMethod?: string
  payDate?: string
}

interface PayrollStats {
  totalEmployees: number
  totalGrossPay: number
  totalNetPay: number
  pendingPayrolls: number
  approvedPayrolls: number
}

export default function PayrollPage() {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [stats, setStats] = useState<PayrollStats>({
    totalEmployees: 0,
    totalGrossPay: 0,
    totalNetPay: 0,
    pendingPayrolls: 0,
    approvedPayrolls: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('current-month')
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadPayrollData()
  }, [selectedPeriod])

  const loadPayrollData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/hr/payroll?period=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setPayrollRecords(data.payrollRecords || [])
        setStats(data.stats || stats)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load payroll data',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to load payroll data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load payroll data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (payrollId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/hr/payroll/${payrollId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Payroll status updated to ${newStatus}`,
        })
        loadPayrollData() // Reload data
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.message || 'Failed to update payroll status',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Status update error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update payroll status',
        variant: 'destructive',
      })
    }
  }

  const generatePayroll = async () => {
    try {
      const response = await fetch('/api/hr/payroll/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          periodStart: format(new Date(), 'yyyy-MM-01'),
          periodEnd: format(new Date(), 'yyyy-MM-' + new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()),
        }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Payroll generated successfully',
        })
        loadPayrollData()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.message || 'Failed to generate payroll',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Generate payroll error:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate payroll',
        variant: 'destructive',
      })
    }
  }

  const filteredRecords = payrollRecords.filter(record =>
    record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100) // Assuming amounts are stored in cents
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      processing: 'outline',
      approved: 'default',
      paid: 'default',
      rejected: 'destructive',
      voided: 'destructive',
    }

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payroll Management</h1>
        <p className="text-muted-foreground">
          Manage employee payroll, view calculations, and process payments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gross Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalGrossPay)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Net Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalNetPay)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayrolls}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current-month">Current Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="last-3-months">Last 3 Months</SelectItem>
            <SelectItem value="current-year">Current Year</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={generatePayroll}>
          <FileText className="h-4 w-4 mr-2" />
          Generate Payroll
        </Button>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
          <CardDescription>
            View and manage employee payroll for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading payroll data...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell>
                      {format(new Date(record.periodStart), 'MMM d')} - {' '}
                      {format(new Date(record.periodEnd), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{formatCurrency(record.grossPay)}</TableCell>
                    <TableCell>{formatCurrency(record.netPay)}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      {record.payDate ? format(new Date(record.payDate), 'MMM d, yyyy') : '--'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {record.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(record.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(record.id, 'rejected')}
                            >
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {record.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(record.id, 'paid')}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filteredRecords.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              No payroll records found for the selected period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
