'use client'

import React from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  MapPinIcon as MapPin,
  ClockIcon as Clock,
  StarIcon as Star,
  ScissorsIcon as Scissors,
  TrophyIcon as Award,
  CalendarIcon as Calendar,
  PhoneIcon as Phone,
  EnvelopeIcon as Mail,
  CameraIcon as Camera,
  GlobeAltIcon as Globe
} from '@heroicons/react/24/outline'

interface BarberProfileProps {
  barber: {
    id: string
    name: string
    email: string
    bio: string
    profileImage?: {
      url: string
      alt: string
    }
    specializations: Array<{
      id: string
      name: string
      price: number
      duration: number
    }>
    experience: {
      yearsExperience: number
      certifications: Array<{ certification: string }>
      previousbarbers: Array<{
        barberName: string
        position: string
        duration: string
      }>
    }
    locations: Array<{
      id: string
      name: string
      address: string
    }>
    availability: {
      [key: string]: {
        start: string
        end: string
        available: boolean
      }
    }
    rating: number
    reviewCount: number
    socialMedia?: {
      instagram?: string
      facebook?: string
    }
    portfolio?: Array<{
      image: { url: string; alt: string }
      title: string
      description: string
    }>
  }
  onBookAppointment?: (barberId: string, locationId: string) => void
  showBookingButton?: boolean
  compact?: boolean
}

export function BarberProfile({ 
  barber, 
  onBookAppointment, 
  showBookingButton = true,
  compact = false 
}: BarberProfileProps) {
  const getDayName = (day: string) => {
    const days: { [key: string]: string } = {
      monday: 'Mon',
      tuesday: 'Tue', 
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    }
    return days[day] || day
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (compact) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {barber.profileImage ? (
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={barber.profileImage.url}
                  alt={barber.profileImage.alt}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-600">
                  {barber.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{barber.name}</h3>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{barber.rating}</span>
                <span>({barber.reviewCount} reviews)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {barber.experience.yearsExperience} years experience
              </p>
            </div>
          </div>
          {showBookingButton && (
            <Button 
              className="w-full mt-4" 
              onClick={() => onBookAppointment?.(barber.id, barber.locations[0]?.id)}
            >
              Book Appointment
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {barber.profileImage ? (
              <div className="relative w-48 h-48 rounded-lg overflow-hidden mx-auto md:mx-0">
                <Image
                  src={barber.profileImage.url}
                  alt={barber.profileImage.alt}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-48 h-48 rounded-lg bg-gray-200 flex items-center justify-center mx-auto md:mx-0">
                <span className="text-6xl font-semibold text-gray-600">
                  {barber.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{barber.name}</h1>
                <p className="text-lg text-muted-foreground">Professional Barber</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{barber.rating}</span>
                  <span className="text-muted-foreground">({barber.reviewCount} reviews)</span>
                </div>
                <Badge variant="secondary">
                  <Award className="w-4 h-4 mr-1" />
                  {barber.experience.yearsExperience} Years Experience
                </Badge>
              </div>
              
              <p className="text-muted-foreground">{barber.bio}</p>
              
              <div className="flex flex-wrap gap-2">
                {barber.specializations.slice(0, 4).map((specialty) => (
                  <Badge key={specialty.id} variant="outline">
                    <Scissors className="w-3 h-3 mr-1" />
                    {specialty.name}
                  </Badge>
                ))}
                {barber.specializations.length > 4 && (
                  <Badge variant="outline">
                    +{barber.specializations.length - 4} more
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{barber.email}</span>
                </div>
                {barber.socialMedia?.instagram && (
                  <div className="flex items-center space-x-1">
                    <Camera className="w-4 h-4" />
                    <span>{barber.socialMedia.instagram}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Available Locations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {barber.locations.map((location) => (
              <div key={location.id} className="space-y-2">
                <h4 className="font-semibold">{location.name}</h4>
                <p className="text-sm text-muted-foreground">{location.address}</p>
                {showBookingButton && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onBookAppointment?.(barber.id, location.id)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book at {location.name}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Weekly Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(barber.availability).map(([day, schedule]) => (
                <div key={day} className="flex justify-between items-center">
                  <span className="capitalize font-medium">{getDayName(day)}</span>
                  {schedule.available ? (
                    <span className="text-sm text-muted-foreground">
                      {formatTime(schedule.start)} - {formatTime(schedule.end)}
                    </span>
                  ) : (
                    <span className="text-sm text-red-500">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Specializations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Scissors className="w-5 h-5" />
            <span>Specializations & Services</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {barber.specializations.map((service) => (
              <div key={service.id} className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold">{service.name}</h4>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{service.duration} min</span>
                  <span className="font-semibold">${service.price}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experience & Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Professional Experience</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Certifications */}
          <div>
            <h4 className="font-semibold mb-3">Certifications</h4>
            <div className="flex flex-wrap gap-2">
              {barber.experience.certifications.map((cert, index) => (
                <Badge key={index} variant="secondary">
                  {cert.certification}
                </Badge>
              ))}
            </div>
          </div>
          
          <Separator />
          
          {/* Previous Experience */}
          <div>
            <h4 className="font-semibold mb-3">Previous Experience</h4>
            <div className="space-y-3">
              {barber.experience.previousbarbers.map((barber, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium">{barber.barberName}</h5>
                    <p className="text-sm text-muted-foreground">{barber.position}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{barber.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio */}
      {barber.portfolio && barber.portfolio.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {barber.portfolio.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={item.image.url}
                      alt={item.image.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="font-semibold text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BarberProfile
