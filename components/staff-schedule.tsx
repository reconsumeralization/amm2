"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User } from "lucide-react"

const scheduleData = [
  {
    day: "Monday",
    date: "Dec 16",
    shifts: [
      { name: "Mike Johnson", time: "9:00 AM - 6:00 PM", status: "scheduled" },
      { name: "Sarah Davis", time: "10:00 AM - 7:00 PM", status: "scheduled" },
      { name: "Emma Wilson", time: "9:00 AM - 5:00 PM", status: "scheduled" },
    ],
  },
  {
    day: "Tuesday",
    date: "Dec 17",
    shifts: [
      { name: "Alex Rodriguez", time: "9:00 AM - 6:00 PM", status: "scheduled" },
      { name: "Sarah Davis", time: "11:00 AM - 8:00 PM", status: "scheduled" },
      { name: "Emma Wilson", time: "9:00 AM - 5:00 PM", status: "scheduled" },
    ],
  },
  {
    day: "Wednesday",
    date: "Dec 18",
    shifts: [
      { name: "Mike Johnson", time: "9:00 AM - 6:00 PM", status: "scheduled" },
      { name: "Alex Rodriguez", time: "10:00 AM - 7:00 PM", status: "scheduled" },
      { name: "Emma Wilson", time: "9:00 AM - 5:00 PM", status: "requested-off" },
    ],
  },
  {
    day: "Thursday",
    date: "Dec 19",
    shifts: [
      { name: "Sarah Davis", time: "9:00 AM - 6:00 PM", status: "scheduled" },
      { name: "Mike Johnson", time: "11:00 AM - 8:00 PM", status: "scheduled" },
      { name: "Alex Rodriguez", time: "10:00 AM - 7:00 PM", status: "scheduled" },
    ],
  },
  {
    day: "Friday",
    date: "Dec 20",
    shifts: [
      { name: "Mike Johnson", time: "9:00 AM - 6:00 PM", status: "scheduled" },
      { name: "Sarah Davis", time: "10:00 AM - 7:00 PM", status: "scheduled" },
      { name: "Alex Rodriguez", time: "9:00 AM - 6:00 PM", status: "scheduled" },
      { name: "Emma Wilson", time: "9:00 AM - 5:00 PM", status: "scheduled" },
    ],
  },
]

export function StaffSchedule() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
            <CardDescription>Manage staff schedules and shifts</CardDescription>
          </div>
          <Button>Edit Schedule</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {scheduleData.map((day) => (
            <Card key={day.day}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{day.day}</CardTitle>
                    <CardDescription>{day.date}</CardDescription>
                  </div>
                  <Badge variant="outline">{day.shifts.length} shifts</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {day.shifts.map((shift, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{shift.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {shift.time}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          shift.status === "scheduled"
                            ? "default"
                            : shift.status === "requested-off"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {shift.status.replace("-", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
