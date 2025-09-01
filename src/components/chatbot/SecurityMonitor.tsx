'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Shield, Eye, Lock, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useMCPController } from '@/hooks/useMCPController'

interface SecurityEvent {
  id: string
  type: 'jailbreak_attempt' | 'suspicious_activity' | 'auth_failure' | 'permission_violation' | 'data_access'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  userId?: string
  sessionId?: string
  timestamp: Date
  context: {
    userAgent?: string
    ip?: string
    path?: string
    input?: string
  }
  actions: string[]
}

interface SecurityMetrics {
  totalEvents: number
  criticalEvents: number
  activeThreats: number
  blockedAttempts: number
  responseTime: number
}

export function SecurityMonitor() {
  const mcp = useMCPController()
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    activeThreats: 0,
    blockedAttempts: 0,
    responseTime: 0
  })
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  // Monitor security events
  const monitorEvents = useCallback(async () => {
    try {
      const securityData = await mcp.execute({
        method: 'get_security_events',
        params: {
          limit: 10,
          since: Date.now() - (24 * 60 * 60 * 1000) // Last 24 hours
        }
      })

      if (securityData.events) {
        setEvents(securityData.events)
      }

      if (securityData.metrics) {
        setMetrics(securityData.metrics)
      }
    } catch (error) {
      console.error('Failed to fetch security events:', error)
    }
  }, [mcp])

  // Real-time security monitoring
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(monitorEvents, 5000) // Check every 5 seconds
    monitorEvents() // Initial load

    return () => clearInterval(interval)
  }, [isMonitoring, monitorEvents])

  // Handle security alerts
  const handleSecurityAlert = useCallback(async (event: SecurityEvent) => {
    if (event.severity === 'critical') {
      // Immediate alert for critical events
      await mcp.execute({
        method: 'send_security_alert',
        params: {
          event,
          recipients: ['admin', 'security_team']
        }
      })
    }
  }, [mcp])

  // Process security events
  useEffect(() => {
    events.forEach(event => {
      if (event.severity === 'critical' && !event.actions.includes('alerted')) {
        handleSecurityAlert(event)
      }
    })
  }, [events, handleSecurityAlert])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      case 'high': return <Shield className="w-4 h-4" />
      case 'medium': return <Eye className="w-4 h-4" />
      case 'low': return <Lock className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Security Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.totalEvents}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.criticalEvents}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.activeThreats}</p>
                <p className="text-sm text-muted-foreground">Active Threats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.blockedAttempts}</p>
                <p className="text-sm text-muted-foreground">Blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Security Events</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                {isMonitoring ? 'Pause' : 'Resume'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-muted-foreground">No security events detected</p>
                <p className="text-sm text-muted-foreground">All systems secure</p>
              </div>
            ) : (
              events.map((event) => (
                <Alert
                  key={event.id}
                  className={`border-l-4 ${
                    event.severity === 'critical' ? 'border-l-red-500' :
                    event.severity === 'high' ? 'border-l-orange-500' :
                    event.severity === 'medium' ? 'border-l-yellow-500' :
                    'border-l-green-500'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${getSeverityColor(event.severity)}`}>
                      {getSeverityIcon(event.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={event.severity === 'critical' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {event.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {event.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {event.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      <AlertDescription className="mb-2">
                        {event.message}
                      </AlertDescription>

                      {showDetails && (
                        <div className="space-y-2 text-sm">
                          {event.userId && (
                            <div>
                              <strong>User ID:</strong> {event.userId}
                            </div>
                          )}
                          {event.sessionId && (
                            <div>
                              <strong>Session:</strong> {event.sessionId}
                            </div>
                          )}
                          {event.context.path && (
                            <div>
                              <strong>Path:</strong> {event.context.path}
                            </div>
                          )}
                          {event.actions.length > 0 && (
                            <div>
                              <strong>Actions:</strong> {event.actions.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      {metrics.criticalEvents > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Security Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                Recent critical security events detected. Consider taking the following actions:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Review user access permissions</li>
                <li>Check authentication logs for suspicious activity</li>
                <li>Update security policies if needed</li>
                <li>Notify security team for investigation</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
