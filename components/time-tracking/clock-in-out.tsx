"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, Square, Coffee } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface TimeEntry {
  id: string
  staff_id: string
  clock_in: string
  clock_out: string | null
  break_minutes: number
  total_hours: number | null
  date: string
}

interface ClockInOutProps {
  staffId: string
  staffName: string
}

export function ClockInOut({ staffId, staffName }: ClockInOutProps) {
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchCurrentEntry()
  }, [staffId])

  const fetchCurrentEntry = async () => {
    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]

    const { data } = await supabase
      .from("time_entries")
      .select("*")
      .eq("staff_id", staffId)
      .eq("date", today)
      .is("clock_out", null)
      .single()

    setCurrentEntry(data)
  }

  const handleClockIn = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const now = new Date()

    const { data, error } = await supabase
      .from("time_entries")
      .insert({
        staff_id: staffId,
        clock_in: now.toISOString(),
        date: now.toISOString().split("T")[0],
        break_minutes: 0,
      })
      .select()
      .single()

    if (!error && data) {
      setCurrentEntry(data)
    }
    setIsLoading(false)
  }

  const handleClockOut = async () => {
    if (!currentEntry) return

    setIsLoading(true)
    const supabase = createClient()
    const now = new Date()

    const { data, error } = await supabase
      .from("time_entries")
      .update({
        clock_out: now.toISOString(),
      })
      .eq("id", currentEntry.id)
      .select()
      .single()

    if (!error) {
      setCurrentEntry(null)
    }
    setIsLoading(false)
  }

  const getWorkedHours = () => {
    if (!currentEntry) return "0:00"

    const clockIn = new Date(currentEntry.clock_in)
    const now = new Date()
    const diffMs = now.getTime() - clockIn.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}:${minutes.toString().padStart(2, "0")}`
  }

  return (
    <Card className="bg-gradient-to-br from-black to-gray-900 text-white border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Clock className="h-5 w-5" />
          Time Clock - {staffName}
        </CardTitle>
        <CardDescription className="text-gray-300">
          {currentTime.toLocaleTimeString()} • {currentTime.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentEntry ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div>
                <p className="text-green-400 font-medium">Currently Clocked In</p>
                <p className="text-sm text-gray-300">Started: {new Date(currentEntry.clock_in).toLocaleTimeString()}</p>
              </div>
              <Badge className="bg-green-500 text-white">{getWorkedHours()}</Badge>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleClockOut}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <Square className="w-4 h-4 mr-2" />
                Clock Out
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent">
                <Coffee className="w-4 h-4 mr-2" />
                Break
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center p-6 border border-gray-700 rounded-lg">
              <p className="text-gray-400 mb-4">Ready to start your shift?</p>
              <Button
                onClick={handleClockIn}
                disabled={isLoading}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Clock In
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
