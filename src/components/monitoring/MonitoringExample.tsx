'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useMonitoring,
  useComponentPerformance,
  upiPerformance,
  useInteractionTracking,
  useErrorBoundary
} from '@/hooks/useMonitoring'
import { logger } from '@/lib/logger'

export function MonitoringExample() {
  // Track component performance
  useComponentPerformance('MonitoringExample')

  // Get monitoring functions
  const {
    captureError,
    trackMetric,
    trackAction,
    addBreadcrumb,
    trackApiCall,
    trackPageView,
    trackFormSubmission,
    trackrch
  } = useMonitoring()

  // Get specialized hooks
  const { trackApiRequest } = upiPerformance()
  const { trackClick, trackFormInteraction } = useInteractionTracking()
  const { reportError } = useErrorBoundary()

  // Component state
  const [rchQuery, setrchQuery] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '' })

  // Example: Track button clicks
  const handleButtonClick = () => {
    trackClick('example-button', { timestamp: Date.now() })
    addBreadcrumb('Example button clicked', 'interaction', 'info')
  }

  // Example: Track form interactions
  const handleInputChange = (field: string, value: string) => {
    trackFormInteraction('example-form', field, 'change', { value })
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleInputFocus = (field: string) => {
    trackFormInteraction('example-form', field, 'focus')
  }

  const handleInputBlur = (field: string) => {
    trackFormInteraction('example-form', field, 'blur')
  }

  // Example: Track form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const startTime = performance.now()

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const duration = performance.now() - startTime
      trackFormSubmission('example-form', true, duration)
      trackMetric({
        name: 'form_submission_time',
        value: duration,
        unit: 'ms',
        tags: { form: 'example-form' }
      })

      addBreadcrumb('Form submitted successfully', 'form', 'info')
    } catch (error) {
      const duration = performance.now() - startTime
      trackFormSubmission('example-form', false, duration)

      const errorEvent = {
        message: 'Form submission failed',
        context: { formData },
        level: 'error' as const
      }
      captureError(errorEvent)
      reportError(error instanceof Error ? error : new Error('Form submission failed'))
    }
  }

  // Example: Track rch
  const handlerch = () => {
    if (rchQuery.trim()) {
      trackrch(rchQuery, Math.floor(Math.random() * 100)) // Mock results count
      addBreadcrumb(`rch performed: "${rchQuery}"`, 'rch', 'info')
    }
  }

  // Example: Track API call
  const handleApiCall = async () => {
    try {
      const result = await trackApiRequest(
        '/api/example',
        'GET',
        async () => {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500))
          return { success: true, data: 'Example data' }
        }
      )

      trackAction({
        type: 'api_call',
        target: '/api/example',
        data: { result: result.success }
      })

      addBreadcrumb('API call completed successfully', 'api', 'info')
    } catch (error) {
      addBreadcrumb('API call failed', 'api', 'error')
    }
  }

  // Example: Track custom metrics
  const handleCustomMetric = () => {
    trackMetric({
      name: 'custom_button_clicks',
      value: 1,
      unit: 'count',
      tags: { component: 'MonitoringExample' }
    })

    trackMetric({
      name: 'user_engagement_time',
      value: Math.random() * 1000,
      unit: 'ms',
      tags: { page: 'monitoring-example' }
    })
  }

  // Example: Simulate error for testing
  const handleSimulateError = () => {
    try {
      throw new Error('This is a test error for monitoring')
    } catch (error) {
      captureError({
        message: 'Simulated error for testing',
        stack: error instanceof Error ? error.stack : undefined,
        context: {
          component: 'MonitoringExample',
          action: 'simulate_error'
        },
        level: 'error'
      })

      if (error instanceof Error) {
        reportError(error)
      }
    }
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Integration Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Interactions */}
          <div className="space-y-2">
            <h3 className="font-medium">Basic Interactions</h3>
            <div className="flex gap-2">
              <Button onClick={handleButtonClick}>Track Click</Button>
              <Button onClick={handleCustomMetric}>Track Metric</Button>
              <Button onClick={handleApiCall}>API Call</Button>
              <Button variant="destructive" onClick={handleSimulateError}>
                Simulate Error
              </Button>
            </div>
          </div>

          {/* Form Tracking */}
          <div className="space-y-2">
            <h3 className="font-medium">Form Tracking</h3>
            <form onSubmit={handleFormSubmit} className="space-y-2">
              <div>
                <Input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onFocus={() => handleInputFocus('name')}
                  onBlur={() => handleInputBlur('name')}
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onFocus={() => handleInputFocus('email')}
                  onBlur={() => handleInputBlur('email')}
                />
              </div>
              <Button type="submit">Submit Form</Button>
            </form>
          </div>

          {/* rch Tracking */}
          <div className="space-y-2">
            <h3 className="font-medium">rch Tracking</h3>
            <div className="flex gap-2">
              <Input
                placeholder="rch query..."
                value={rchQuery}
                onChange={(e) => setrchQuery(e.target.value)}
              />
              <Button onClick={handlerch}>rch</Button>
            </div>
          </div>

          {/* Information Panel */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Monitoring Status</h3>
            <p className="text-sm text-muted-foreground">
              This component demonstrates various monitoring features:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Component performance tracking</li>
              <li>• User interaction monitoring</li>
              <li>• Form submission analytics</li>
              <li>• API call performance</li>
              <li>• Error reporting and handling</li>
              <li>• Custom metrics and breadcrumbs</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
