"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, ArrowRight, Star, Users, Clock, Calendar, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Stylist {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  bio?: string
  avatar?: string
  specializations: string[]
  experience_years: number
  rating: number
  review_count: number
  is_active: boolean
  working_hours: {
    monday: { start: string; end: string; is_open: boolean }
    tuesday: { start: string; end: string; is_open: boolean }
    wednesday: { start: string; end: string; is_open: boolean }
    thursday: { start: string; end: string; is_open: boolean }
    friday: { start: string; end: string; is_open: boolean }
    saturday: { start: string; end: string; is_open: boolean }
    sunday: { start: string; end: string; is_open: boolean }
  }
}

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  category: string
}

export default function SelectStylistPage() {
  const [stylists, setStylists] = useState<Stylist[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStylist, setSelectedStylist] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Load selected service from localStorage
    const serviceData = localStorage.getItem('selectedService')
    if (serviceData) {
      setSelectedService(JSON.parse(serviceData))
    } else {
      router.push('/book')
      return
    }

    fetchStylists()
  }, [router])

  const fetchStylists = async () => {
    try {
      const response = await fetch('/api/staff')
      if (!response.ok) throw new Error('Failed to fetch stylists')
      const data = await response.json()

      // Filter active stylists and those who can perform the selected service
      const filteredStylists = data.filter((stylist: Stylist) =>
        stylist.is_active &&
        selectedService &&
        stylist.specializations.includes(selectedService.category)
      )

      setStylists(filteredStylists)
    } catch (error) {
      console.error('Error fetching stylists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStylistSelect = (stylistId: string) => {
    setSelectedStylist(stylistId)
    const stylist = stylists.find(s => s.id === stylistId)
    if (stylist && selectedService) {
      const bookingData = {
        service: selectedService,
        stylist: stylist
      }
      localStorage.setItem('bookingData', JSON.stringify(bookingData))
      router.push('/book/datetime')
    }
  }

  const handleBack = () => {
    router.push('/book')
  }

  const getAvailabilityStatus = (stylist: Stylist) => {
    const now = new Date()
    const dayOfWeek = now.toLocaleLowerCase('en-US', { weekday: 'long' })
    const todaySchedule = stylist.working_hours[dayOfWeek as keyof typeof stylist.working_hours]

    if (!todaySchedule?.is_open) return 'Closed Today'

    const currentTime = now.getHours() * 60 + now.getMinutes()
    const [startHour, startMinute] = todaySchedule.start.split(':').map(Number)
    const [endHour, endMinute] = todaySchedule.end.split(':').map(Number)
    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute

    if (currentTime < startTime) return `Opens at ${todaySchedule.start}`
    if (currentTime > endTime) return 'Closed for Today'
    return 'Available Now'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Finding available stylists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Services
            </Button>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Choose Your Stylist
              </h1>
              <p className="text-xl text-gray-600">
                {selectedService && `Selected: ${selectedService.name}`}
              </p>
            </div>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Stylist Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stylists.map((stylist) => (
            <Card
              key={stylist.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-lg border-2",
                selectedStylist === stylist.id
                  ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-blue-300"
              )}
              onClick={() => handleStylistSelect(stylist.id)}
            >
              <CardHeader className="text-center pb-4">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={stylist.avatar} alt={`${stylist.firstName} ${stylist.lastName}`} />
                  <AvatarFallback className="text-lg">
                    {stylist.firstName[0]}{stylist.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl font-bold">
                  {stylist.firstName} {stylist.lastName}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {stylist.experience_years} years experience
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Rating */}
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{stylist.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-600">
                      {stylist.review_count} reviews
                    </span>
                  </div>

                  {/* Specializations */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm text-center">Specializations</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {stylist.specializations.slice(0, 3).map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  {stylist.bio && (
                    <p className="text-sm text-gray-600 text-center line-clamp-3">
                      {stylist.bio}
                    </p>
                  )}

                  {/* Availability Status */}
                  <div className="text-center">
                    <Badge
                      variant={getAvailabilityStatus(stylist) === 'Available Now' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {getAvailabilityStatus(stylist)}
                    </Badge>
                  </div>

                  {/* Action Button */}
                  <Button
                    className={cn(
                      "w-full mt-4",
                      selectedStylist === stylist.id
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-900 hover:bg-gray-800"
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStylistSelect(stylist.id)
                    }}
                  >
                    Select This Stylist
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {stylists.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Stylists Available</h3>
            <p className="text-gray-600 mb-6">
              No stylists are currently available for {selectedService?.name}.
            </p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Choose Different Service
            </Button>
          </div>
        )}

        {/* Any Stylist Option */}
        {stylists.length > 0 && (
          <div className="mt-8 text-center">
            <Card className="max-w-md mx-auto cursor-pointer transition-all duration-300 hover:shadow-lg border-2 border-dashed border-gray-300 hover:border-blue-300">
              <CardContent className="py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Any Available Stylist
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  We'll assign the best available stylist for your service
                </p>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    if (selectedService) {
                      const bookingData = {
                        service: selectedService,
                        stylist: null // Any available stylist
                      }
                      localStorage.setItem('bookingData', JSON.stringify(bookingData))
                      router.push('/book/datetime')
                    }
                  }}
                >
                  Continue with Any Stylist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Questions about our stylists?
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <span>📞 (555) 123-4567</span>
              <span>📧 info@modernmen.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
