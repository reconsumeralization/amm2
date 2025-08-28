'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface AuditLog {
  id: string
  userId: string
  userName: string
  userRole: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

interface AuditStats {
  total: number
  today: number
  thisWeek: number
  critical: number
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [rchTerm, setrchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [resourceFilter, setResourceFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchAuditLogs()
  }, [rchTerm, actionFilter, resourceFilter, userFilter, currentPage])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const params = new URLrchParams()
      if (rchTerm) params.set('rch', rchTerm)
      if (actionFilter !== 'all') params.set('action', actionFilter)
      if (resourceFilter !== 'all') params.set('resource', resourceFilter)
      if (userFilter !== 'all') params.set('userId', userFilter)
      params.set('page', currentPage.toString())
      params.set('limit', '20')

      const response = await fetch(`/api/audit?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch audit logs')

      const data = await response.json()
      setLogs(data.logs)
      setTotalPages(data.totalPages)

      // Calculate stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

      const todayLogs = data.logs.filter((log: AuditLog) =>
        new Date(log.timestamp) >= today
      ).length

      const weekLogs = data.logs.filter((log: AuditLog) =>
        new Date(log.timestamp) >= weekAgo
      ).length

      const criticalLogs = data.logs.filter((log: AuditLog) =>
        ['USER_DELETED', 'EMPLOYEE_DELETED', 'SYSTEM_BACKUP', 'PERMISSION_CHANGED'].includes(log.action)
      ).length

      setStats({
        total: data.total,
        today: todayLogs,
        thisWeek: weekLogs,
        critical: criticalLogs
      })
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('ADD')) {
      return 'bg-green-100 text-green-800'
    }
    if (action.includes('UPDATE') || action.includes('EDIT')) {
      return 'bg-blue-100 text-blue-800'
    }
    if (action.includes('DELETE') || action.includes('REMOVE')) {
      return 'bg-red-100 text-red-800'
    }
    if (action.includes('LOGIN') || action.includes('LOGOUT')) {
      return 'bg-yellow-100 text-yellow-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'users':
        return <Icons.users className="h-4 w-4" />
      case 'stylists':
      case 'employees':
        return <Icons.users className="h-4 w-4" />
      case 'appointments':
        return <Icons.calendar className="h-4 w-4" />
      case 'services':
        return <Icons.scissors className="h-4 w-4" />
      case 'customers':
        return <Icons.users className="h-4 w-4" />
      default:
        return <Icons.info className="h-4 w-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const formatDetails = (details: Record<string, any>) => {
    if (!details) return null

    return Object.entries(details).map(([key, value]) => (
      <div key={key} className="text-xs text-gray-600">
        <span className="font-medium">{key}:</span>{' '}
        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
      </div>
    ))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
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
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Activities</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.today}</div>
              <div className="text-sm text-gray-600">Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.thisWeek}</div>
              <div className="text-sm text-gray-600">This Week</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
              <div className="text-sm text-gray-600">Critical Actions</div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Audit Logs</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex gap-2">
                <Input
                  placeholder="rch logs..."
                  value={rchTerm}
                  onChange={(e) => setrchTerm(e.target.value)}
                  className="w-full sm:w-64"
                />
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All actions</SelectItem>
                    <SelectItem value="USER_CREATED">User Created</SelectItem>
                    <SelectItem value="USER_UPDATED">User Updated</SelectItem>
                    <SelectItem value="USER_DELETED">User Deleted</SelectItem>
                    <SelectItem value="EMPLOYEE_CREATED">Employee Created</SelectItem>
                    <SelectItem value="EMPLOYEE_UPDATED">Employee Updated</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                    <SelectItem value="LOGOUT">Logout</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={resourceFilter} onValueChange={setResourceFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All resources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All resources</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="stylists">Stylists</SelectItem>
                    <SelectItem value="appointments">Appointments</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="customers">Customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={fetchAuditLogs}
                variant="outline"
                className="border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white"
              >
                <Icons.refreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Icons.info className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No audit logs found</h3>
              <p className="text-gray-600 mb-4">
                {rchTerm || actionFilter !== 'all' || resourceFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No activities have been logged yet'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getResourceIcon(log.resource)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getActionColor(log.action)}>
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {log.resource}
                          {log.resourceId && (
                            <span className="text-gray-500"> • {log.resourceId}</span>
                          )}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>

                    <div className="mb-2">
                      <span className="font-medium text-gray-800">{log.userName}</span>
                      <span className="text-sm text-gray-600 ml-2">({log.userRole})</span>
                    </div>

                    {log.details && (
                      <div className="mb-2 p-2 bg-gray-100 rounded text-sm">
                        {formatDetails(log.details)}
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      {log.ipAddress && log.userAgent && <span> • </span>}
                      {log.userAgent && <span>Browser: {log.userAgent.substring(0, 50)}...</span>}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
