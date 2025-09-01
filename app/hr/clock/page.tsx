'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, MapPin, Calendar, Timer, Coffee, LogOut } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface ClockEntry {
  id: string
  employeeName: string
  date: string
  clockInTime: string
  clockOutTime?: string
  totalHours?: number
  status: string
  location?: string
}

interface CurrentSession {
  isClockedIn: boolean
  clockInTime?: string
  currentLocation?: string
  todaysHours?: number
}

export default function ClockPage() {
  const [currentSession, setCurrentSession] = useState<CurrentSession>({
    isClockedIn: false,
    todaysHours: 0
  })
  const [todaysEntries, setTodaysEntries] = useState<ClockEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const { toast } = useToast()

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Load today's clock entries and current session status
  useEffect(() => {
    loadTodaysData()
  }, [])

  const loadTodaysData = async () => {
    try {
      // Load current session status
      const sessionResponse = await fetch('/api/hr/clock/session')
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        setCurrentSession(sessionData)
      }

      // Load today's entries
      const today = format(new Date(), 'yyyy-MM-dd')
      const entriesResponse = await fetch(`/api/hr/clock/entries?date=${today}`)
      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json()
        setTodaysEntries(entriesData.entries || [])
      }
    } catch (error) {
      console.error('Failed to load clock data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load clock data',
        variant: 'destructive',
      })
    }
  }

  const handleClockIn = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/hr/clock/in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: 'Main Salon', // In a real app, this would come from geolocation
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentSession({
          isClockedIn: true,
          clockInTime: data.clockInTime,
          currentLocation: data.location,
        })

        toast({
          title: 'Clocked In',
          description: `Successfully clocked in at ${format(new Date(data.clockInTime), 'HH:mm:ss')}`,
        })

        // Reload data to show the new entry
        loadTodaysData()
      } else {
        const error = await response.json()
        toast({
          title: 'Clock In Failed',
          description: error.message || 'Failed to clock in',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Clock in error:', error)
      toast({
        title: 'Error',
        description: 'Failed to clock in. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockOut = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/hr/clock/out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: 'Main Salon', // In a real app, this would come from geolocation
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentSession({
          isClockedIn: false,
          todaysHours: data.totalHours || 0,
        })

        toast({
          title: 'Clocked Out',
          description: `Successfully clocked out. Total hours: ${data.totalHours?.toFixed(2) || '0.00'}`,
        })

        // Reload data to show the completed entry
        loadTodaysData()
      } else {
        const error = await response.json()
        toast({
          title: 'Clock Out Failed',
          description: error.message || 'Failed to clock out',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Clock out error:', error)
      toast({
        title: 'Error',
        description: 'Failed to clock out. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Employee Time Clock</h1>
        <p className="text-muted-foreground">
          Clock in and out to track your working hours
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clock In/Out Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Clock
            </CardTitle>
            <CardDescription>
              Current time: {format(currentTime, 'HH:mm:ss')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Status */}
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                {currentSession.isClockedIn ? 'Clocked In' : 'Clocked Out'}
              </div>
              <Badge
                variant={currentSession.isClockedIn ? 'default' : 'secondary'}
                className="text-sm"
              >
                {currentSession.isClockedIn ? 'Working' : 'Off Duty'}
              </Badge>
            </div>

            {/* Clock In/Out Button */}
            <div className="flex justify-center">
              {currentSession.isClockedIn ? (
                <Button
                  onClick={handleClockOut}
                  disabled={isLoading}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLoading ? 'Clocking Out...' : 'Clock Out'}
                </Button>
              ) : (
                <Button
                  onClick={handleClockIn}
                  disabled={isLoading}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {isLoading ? 'Clocking In...' : 'Clock In'}
                </Button>
              )}
            </div>

            {/* Current Session Info */}
            {currentSession.isClockedIn && currentSession.clockInTime && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Timer className="h-4 w-4" />
                  Clocked in at
                </div>
                <div className="font-medium">
                  {format(new Date(currentSession.clockInTime), 'HH:mm:ss')}
                </div>
                {currentSession.currentLocation && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4" />
                    {currentSession.currentLocation}
                  </div>
                )}
              </div>
            )}

            {/* Today's Summary */}
            <Separator />
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Today's Hours</div>
              <div className="text-xl font-bold">
                {currentSession.todaysHours?.toFixed(2) || '0.00'} hours
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Entries
            </CardTitle>
            <CardDescription>
              Your time entries for {format(new Date(), 'MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaysEntries.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No time entries for today
              </div>
            ) : (
              <div className="space-y-4">
                {todaysEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">
                        {entry.clockInTime ? format(new Date(entry.clockInTime), 'HH:mm') : '--:--'} - {' '}
                        {entry.clockOutTime ? format(new Date(entry.clockOutTime), 'HH:mm') : '--:--'}
                      </div>
                      <Badge variant={entry.status === 'completed' ? 'default' : 'secondary'}>
                        {entry.status}
                      </Badge>
                    </div>

                    {entry.totalHours && (
                      <div className="text-sm text-muted-foreground">
                        Duration: {entry.totalHours.toFixed(2)} hours
                      </div>
                    )}

                    {entry.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {entry.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Additional time tracking options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" size="sm">
              <Coffee className="h-4 w-4 mr-2" />
              Start Break
            </Button>
            <Button variant="outline" size="sm">
              Request Time Off
            </Button>
            <Button variant="outline" size="sm">
              View Schedule
            </Button>
            <Button variant="outline" size="sm">
              Time History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
