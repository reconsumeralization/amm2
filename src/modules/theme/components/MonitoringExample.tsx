'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useMonitoring,
  useComponentPerformance,
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
    trackApiCall,
    trackPageView,
    trackFormSubmission
  } = useMonitoring()

  // Get specialized hooks
  const componentPerformance = useComponentPerformance('MonitoringExample')
  const { trackClick, trackFormInteraction } = useInteractionTracking()
  const { reportError } = useErrorBoundary()

  // Component state
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '' })

  // Example: Track button clicks
  const handleButtonClick = () => {
    trackClick('example-button', { timestamp: Date.now() })
    logger.info('Example button clicked', { component: 'MonitoringExample' })
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
      trackFormSubmission('example-form', true)
      trackMetric({
        name: 'form_submission_time',
        value: duration,
        unit: 'ms',
        tags: { form: 'example-form' }
      })

      // Form submitted successfully
    } catch (err) {
      const duration = performance.now() - startTime
      trackFormSubmission('example-form', false)

      const submissionError = new Error('Form submission failed')
      captureError(submissionError)
      reportError(err instanceof Error ? err : new Error('Form submission failed'))
    }
  }

  // Example: Track search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      trackAction('search', { component: 'monitoring-example' })
      logger.info(`Search performed: "${searchQuery}"`, { 
        component: 'MonitoringExample',
        query: searchQuery 
      })
    }
  }

  // Example: Track API call
  const handleApiCall = async () => {
    const startTime = Date.now()
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const duration = Date.now() - startTime
      const result = { success: true, data: 'Example data' }

      trackApiCall('/api/example', 'GET', duration, result.success)
      trackAction('api_call', { endpoint: '/api/example' })

      // API call completed successfully
    } catch (error) {
      // API call failed
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
      const testError = new Error('Simulated error for testing')
      testError.stack = error instanceof Error ? error.stack : undefined
      
      captureError(testError)

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

          {/* Search Tracking */}
          <div className="space-y-2">
            <h3 className="font-medium">Search Tracking</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Search query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={handleSearch}>Search</Button>
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
