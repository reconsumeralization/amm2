'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, Database, Users, Cog, CheckCircle, XCircle, AlertTriangle, RefreshCw, Zap, Calendar, User, Edit, BarChart } from '@/lib/icon-mapping'
import { useMonitoring } from '@/hooks/useMonitoring'

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'unknown'
  timestamp: string
  error?: string
  details?: {
    database: boolean
    collections: number
    endpoints: boolean
  }
}

interface AnalyticsData {
  services: number
  customers: number
  appointments: number
  stylists: number
}

export function PayloadHealthCheck() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(false)

  const { trackEvent } = useMonitoring()

  const checkHealth = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/payload/init?action=health')
      const data = await response.json()
      setHealth(data)
    } catch (error) {
      setHealth({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/payload/analytics')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    }
  }

  const initializePayload = async () => {
    try {
      setIsInitializing(true)
      trackEvent('payload_initialization_started')

      const response = await fetch('/api/payload/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'full-setup' })
      })

      if (response.ok) {
        trackEvent('payload_initialization_successful')
        await checkHealth()
        await loadAnalytics()
      } else {
        const error = await response.json()
        trackEvent('payload_initialization_failed', { error: error.message })
      }
    } catch (error) {
      trackEvent('payload_initialization_error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsInitializing(false)
    }
  }

  useEffect(() => {
    checkHealth()
    loadAnalytics()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'unhealthy':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Health Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Payload CMS Health Status
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={checkHealth}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {health?.status !== 'healthy' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={initializePayload}
                  disabled={isInitializing}
                >
                  <Zap className={`h-4 w-4 mr-2 ${isInitializing ? 'animate-pulse' : ''}`} />
                  {isInitializing ? 'Initializing...' : 'Initialize'}
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Checking health...</span>
            </div>
          ) : health ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(health.status)}
                <Badge className={getStatusColor(health.status)}>
                  {health.status.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Last checked: {new Date(health.timestamp).toLocaleString()}
                </span>
              </div>

              {health.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">Error:</p>
                  <p className="text-sm text-red-700">{health.error}</p>
                </div>
              )}

              {health.details && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Database className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Database</p>
                      <p className="text-xs text-muted-foreground">
                        {health.details.database ? 'Connected' : 'Disconnected'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Settings className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Collections</p>
                      <p className="text-xs text-muted-foreground">
                        {health.details.collections} available
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Activity className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">API Endpoints</p>
                      <p className="text-xs text-muted-foreground">
                        {health.details.endpoints ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-muted-foreground">Unable to check health status</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{analytics.customers}</div>
              <div className="text-sm text-muted-foreground">Total Customers</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Settings className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{analytics.services}</div>
              <div className="text-sm text-muted-foreground">Active Services</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{analytics.appointments}</div>
              <div className="text-sm text-muted-foreground">Total Appointments</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">{analytics.stylists}</div>
              <div className="text-sm text-muted-foreground">Active Stylists</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open('/admin', '_blank')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Open Admin Panel
            </Button>

            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open('/editor', '_blank')}
            >
              <Edit className="h-4 w-4 mr-2" />
              Open Image Editor
            </Button>

            <Button
              variant="outline"
              className="justify-start"
              onClick={loadAnalytics}
            >
              <BarChart className="h-4 w-4 mr-2" />
              Refresh Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
