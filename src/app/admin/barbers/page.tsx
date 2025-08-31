'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BarberProfile from '@/components/features/staff/BarberProfile'
import BarberLocationManager from '@/components/features/admin/BarberLocationManager'
import { 
  Users, 
  MapPin, 
  Scissors, 
  Star,
  Calendar,
  Plus,
  Search,
  Filter
} from 'lucide-react'

// Mock data for the male barber we just set up
const MARCUS_BARBER_DATA = {
  id: 'marcus-rodriguez',
  name: 'Marcus Rodriguez',
  email: 'marcus.rodriguez@modernmen.com',
  bio: 'Professional barber with over 8 years of experience specializing in modern cuts, fades, and beard grooming. Known for attention to detail and creating personalized styles that enhance each client\'s unique features.',
  profileImage: {
    url: '/media/malebarber.png',
    alt: 'Marcus Rodriguez - Professional Barber'
  },
  specializations: [
    { id: '1', name: 'Precision Fade', price: 45, duration: 45 },
    { id: '2', name: 'Beard Sculpting', price: 35, duration: 30 },
    { id: '3', name: 'Modern Cut & Style', price: 55, duration: 60 },
    { id: '4', name: 'Classic Gentleman\'s Cut', price: 50, duration: 50 },
    { id: '5', name: 'Hot Towel Shave', price: 40, duration: 40 },
    { id: '6', name: 'Complete Grooming', price: 85, duration: 90 }
  ],
  experience: {
    yearsExperience: 8,
    certifications: [
      { certification: 'Master Barber Certification' },
      { certification: 'Beard Specialist Certificate' },
      { certification: 'Advanced Cutting Techniques' }
    ],
    previousbarbers: [
      {
        barberName: 'Elite Cuts Regina',
        position: 'Senior Barber',
        duration: '2019-2022'
      },
      {
        barberName: 'Gentleman\'s Choice',
        position: 'Lead Stylist',
        duration: '2016-2019'
      }
    ]
  },
  locations: [
    { id: '1', name: 'Downtown Regina', address: '1875 Rose Street, Regina, SK S4P 3Z1' },
    { id: '2', name: 'Northgate Mall', address: '9456 Rochdale Blvd, Regina, SK S4X 2P7' },
    { id: '3', name: 'Westside Plaza', address: '3045 Dewdney Ave, Regina, SK S4T 0X6' }
  ],
  availability: {
    monday: { start: '09:00', end: '18:00', available: true },
    tuesday: { start: '09:00', end: '18:00', available: true },
    wednesday: { start: '09:00', end: '18:00', available: true },
    thursday: { start: '09:00', end: '19:00', available: true },
    friday: { start: '09:00', end: '20:00', available: true },
    saturday: { start: '08:00', end: '17:00', available: true },
    sunday: { start: '10:00', end: '16:00', available: true }
  },
  rating: 4.8,
  reviewCount: 156,
  socialMedia: {
    instagram: '@marcus_cuts_regina',
    facebook: 'MarcusBarberRegina'
  },
  portfolio: [
    {
      image: { url: '/media/malebarber.png', alt: 'Precision fade showcase' },
      title: 'Precision Fade Showcase',
      description: 'Clean fade with textured top'
    },
    {
      image: { url: '/media/malebarber.png', alt: 'Beard sculpting example' },
      title: 'Beard Sculpting Expertise',
      description: 'Professional beard shaping and grooming'
    },
    {
      image: { url: '/media/malebarber.png', alt: 'Modern gentleman style' },
      title: 'Modern Gentleman Style',
      description: 'Contemporary cut with classic finish'
    }
  ]
}

export default function BarbersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [barberData, setBarberData] = useState(MARCUS_BARBER_DATA)

  const handleBookAppointment = (barberId: string, locationId: string) => {
    const location = barberData.locations.find(loc => loc.id === locationId)
    console.log(`Booking appointment with ${barberData.name} at ${location?.name}`)
    // Here you would integrate with your booking system
    alert(`Booking appointment with ${barberData.name} at ${location?.name}`)
  }

  const handleSaveLocationChanges = (data: any) => {
    console.log('Saving location changes:', data)
    // Here you would save the changes to your backend
    alert('Location assignments saved successfully!')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Barber Management</h1>
          <p className="text-muted-foreground">
            Manage barber profiles and location assignments
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Barber
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Barbers</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Locations</p>
                <p className="text-2xl font-bold">{barberData.locations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Scissors className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Services</p>
                <p className="text-2xl font-bold">{barberData.specializations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{barberData.rating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Barber Profile</TabsTrigger>
          <TabsTrigger value="locations">Location Management</TabsTrigger>
          <TabsTrigger value="schedule">Schedule & Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <BarberProfile 
            barber={barberData}
            onBookAppointment={handleBookAppointment}
            showBookingButton={true}
          />
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <BarberLocationManager onSave={handleSaveLocationChanges} />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Schedule Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Schedule Management</h3>
                <p>Advanced scheduling features coming soon.</p>
                <p className="text-sm">
                  Current availability: {Object.values(barberData.availability)
                    .filter(day => day.available).length} days per week
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-6">
        <Button 
          variant="outline"
          onClick={() => window.open('/admin', '_blank')}
        >
          Open PayloadCMS Admin
        </Button>
        <Button 
          onClick={() => handleBookAppointment(barberData.id, barberData.locations[0].id)}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Test Booking Flow
        </Button>
      </div>
    </div>
  )
}
