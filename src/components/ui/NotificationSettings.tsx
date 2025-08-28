'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface NotificationPreferences {
  email: {
    userCreated: boolean
    employeeCreated: boolean
    appointmentBooked: boolean
    appointmentUpdated: boolean
    systemAlerts: boolean
    securityAlerts: boolean
  }
  sms: {
    appointmentReminders: boolean
    systemAlerts: boolean
    urgentNotifications: boolean
  }
  push: {
    newAppointments: boolean
    systemAlerts: boolean
    dailyReports: boolean
  }
  frequency: {
    emailDigest: 'none' | 'daily' | 'weekly'
    quietHours: {
      enabled: boolean
      start: string
      end: string
    }
  }
}

interface NotificationSettingsProps {
  userId: string
  className?: string
}

export function NotificationSettings({ userId, className = '' }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      userCreated: true,
      employeeCreated: true,
      appointmentBooked: true,
      appointmentUpdated: true,
      systemAlerts: true,
      securityAlerts: true
    },
    sms: {
      appointmentReminders: false,
      systemAlerts: false,
      urgentNotifications: true
    },
    push: {
      newAppointments: true,
      systemAlerts: true,
      dailyReports: false
    },
    frequency: {
      emailDigest: 'none',
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadUserPreferences()
  }, [userId])

  const loadUserPreferences = async () => {
    try {
      // In a real implementation, fetch from API
      // For demo, use default preferences
      console.log('Loading notification preferences for user:', userId)
    } catch (error) {
      console.error('Failed to load notification preferences:', error)
    }
  }

  const updatePreference = (category: keyof NotificationPreferences, field: string, value: any) => {
    setPreferences(prev => {
      const updated = { ...prev }
      if (category === 'frequency') {
        if (field === 'emailDigest') {
          updated.frequency.emailDigest = value
        } else if (field === 'enabled') {
          updated.frequency.quietHours.enabled = value
        } else if (field === 'start') {
          updated.frequency.quietHours.start = value
        } else if (field === 'end') {
          updated.frequency.quietHours.end = value
        }
      } else {
        (updated[category] as any)[field] = value
      }
      return updated
    })
    setHasChanges(true)
  }

  const savePreferences = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, save to API
      console.log('Saving notification preferences:', preferences)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success('Notification preferences saved successfully!')
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save notification preferences:', error)
      toast.error('Failed to save preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const resetToDefaults = () => {
    setPreferences({
      email: {
        userCreated: true,
        employeeCreated: true,
        appointmentBooked: true,
        appointmentUpdated: true,
        systemAlerts: true,
        securityAlerts: true
      },
      sms: {
        appointmentReminders: false,
        systemAlerts: false,
        urgentNotifications: true
      },
      push: {
        newAppointments: true,
        systemAlerts: true,
        dailyReports: false
      },
      frequency: {
        emailDigest: 'none',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      }
    })
    setHasChanges(true)
    toast.info('Preferences reset to defaults')
  }

  const testNotification = async (type: 'email' | 'sms' | 'push') => {
    try {
      const testMessage = `This is a test ${type.toUpperCase()} notification from Modern Men Salon.`

      // In a real implementation, send test notification via API
      console.log(`Sending test ${type} notification:`, testMessage)

      toast.success(`Test ${type} notification sent! Check your ${type === 'email' ? 'inbox' : type === 'sms' ? 'phone' : 'browser'}.`)
    } catch (error) {
      console.error(`Failed to send test ${type} notification:`, error)
      toast.error(`Failed to send test ${type} notification`)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icons.mail className="h-5 w-5" />
            <span>Email Notifications</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Configure which events trigger email notifications</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(preferences.email).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label htmlFor={`email-${key}`} className="text-sm font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
                <p className="text-xs text-gray-500">
                  {key === 'userCreated' && 'When new users are created'}
                  {key === 'employeeCreated' && 'When new employees join the team'}
                  {key === 'appointmentBooked' && 'When appointments are booked'}
                  {key === 'appointmentUpdated' && 'When appointments are modified'}
                  {key === 'systemAlerts' && 'System status and maintenance alerts'}
                  {key === 'securityAlerts' && 'Security and access related alerts'}
                </p>
              </div>
              <Switch
                id={`email-${key}`}
                checked={value}
                onCheckedChange={(checked: boolean) => updatePreference('email', key, checked)}
              />
            </div>
          ))}

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => testNotification('email')}
              className="text-xs"
            >
              Send Test Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icons.phone className="h-5 w-5" />
            <span>SMS Notifications</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Configure SMS alerts for time-sensitive events</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(preferences.sms).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label htmlFor={`sms-${key}`} className="text-sm font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
                <p className="text-xs text-gray-500">
                  {key === 'appointmentReminders' && '24-hour appointment reminders'}
                  {key === 'systemAlerts' && 'System status alerts'}
                  {key === 'urgentNotifications' && 'Critical system notifications'}
                </p>
              </div>
              <Switch
                id={`sms-${key}`}
                checked={value}
                onCheckedChange={(checked: boolean) => updatePreference('sms', key, checked)}
              />
            </div>
          ))}

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => testNotification('sms')}
              className="text-xs"
            >
              Send Test SMS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icons.info className="h-5 w-5" />
            <span>Push Notifications</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Browser push notifications for real-time alerts</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(preferences.push).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label htmlFor={`push-${key}`} className="text-sm font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
                <p className="text-xs text-gray-500">
                  {key === 'newAppointments' && 'New appointment bookings'}
                  {key === 'systemAlerts' && 'System and service alerts'}
                  {key === 'dailyReports' && 'Daily summary reports'}
                </p>
              </div>
              <Switch
                id={`push-${key}`}
                checked={value}
                onCheckedChange={(checked: boolean) => updatePreference('push', key, checked)}
              />
            </div>
          ))}

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => testNotification('push')}
              className="text-xs"
            >
              Send Test Push
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icons.settings className="h-5 w-5" />
            <span>Notification Frequency</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Control how often you receive notifications</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Email Digest</Label>
            <p className="text-xs text-gray-500 mb-2">Receive a summary of notifications</p>
            <select
              value={preferences.frequency.emailDigest}
              onChange={(e) => updatePreference('frequency', 'emailDigest', e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
            >
              <option value="none">No digest</option>
              <option value="daily">Daily summary</option>
              <option value="weekly">Weekly summary</option>
            </select>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Switch
                id="quiet-hours"
                checked={preferences.frequency.quietHours.enabled}
                onCheckedChange={(checked: boolean) => updatePreference('frequency', 'enabled', checked)}
              />
              <Label htmlFor="quiet-hours" className="text-sm font-medium">
                Quiet Hours
              </Label>
            </div>

            {preferences.frequency.quietHours.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex space-x-2 ml-6"
              >
                <div>
                  <Label className="text-xs text-gray-600">Start</Label>
                  <input
                    type="time"
                    value={preferences.frequency.quietHours.start}
                    onChange={(e) => updatePreference('frequency', 'start', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">End</Label>
                  <input
                    type="time"
                    value={preferences.frequency.quietHours.end}
                    onChange={(e) => updatePreference('frequency', 'end', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center p-4 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <div>
            <p className="text-sm font-medium text-amber-800">Unsaved Changes</p>
            <p className="text-xs text-amber-600">Your notification preferences have been modified</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              Reset
            </Button>
            <Button
              onClick={savePreferences}
              disabled={isLoading}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Icons.save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
