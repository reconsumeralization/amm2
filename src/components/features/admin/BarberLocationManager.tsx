'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { 
  MapPinIcon as MapPin, 
  UsersIcon as Users, 
  ScissorsIcon as Scissors, 
  ClockIcon as Clock,
  BookmarkIcon as Save,
  PlusIcon as Plus,
  TrashIcon as Trash2,
  PencilIcon as Edit
} from '@heroicons/react/24/outline'

interface Location {
  id: string
  name: string
  address: string
  active: boolean
}

interface Barber {
  id: string
  name: string
  email: string
  profileImage?: { url: string }
  locations: string[]
  specializations: string[]
  isActive: boolean
}

interface BarberLocationManagerProps {
  onSave?: (data: any) => void
}

export function BarberLocationManager({ onSave }: BarberLocationManagerProps) {
  const [locations, setLocations] = useState<Location[]>([
    { id: '1', name: 'Downtown Location', address: '123 Main St, Regina, SK', active: true },
    { id: '2', name: 'Northside Branch', address: '456 North Ave, Regina, SK', active: true },
    { id: '3', name: 'Westside Studio', address: '789 West Blvd, Regina, SK', active: true },
  ])
  
  const [barbers, setBarbers] = useState<Barber[]>([
    {
      id: 'marcus-rodriguez',
      name: 'Marcus Rodriguez',
      email: 'marcus.rodriguez@modernmen.com',
      profileImage: { url: '/media/malebarber.png' },
      locations: ['1', '2', '3'], // Available at all locations
      specializations: ['Precision Fades', 'Beard Sculpting', 'Modern Cuts'],
      isActive: true
    }
  ])

  const [selectedBarber, setSelectedBarber] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const toggleBarberLocation = (barberId: string, locationId: string) => {
    setBarbers(prev => prev.map(barber => {
      if (barber.id === barberId) {
        const hasLocation = barber.locations.includes(locationId)
        return {
          ...barber,
          locations: hasLocation 
            ? barber.locations.filter(id => id !== locationId)
            : [...barber.locations, locationId]
        }
      }
      return barber
    }))
  }

  const handleSave = () => {
    const saveData = {
      barbers: barbers.map(barber => ({
        ...barber,
        locationDetails: barber.locations.map(locId => 
          locations.find(loc => loc.id === locId)
        ).filter(Boolean)
      }))
    }
    
    onSave?.(saveData)
    setIsEditing(false)
  }

  const getLocationStats = (locationId: string) => {
    const barbersAtLocation = barbers.filter(barber => 
      barber.locations.includes(locationId) && barber.isActive
    )
    return {
      totalBarbers: barbersAtLocation.length,
      specialties: [...new Set(barbersAtLocation.flatMap(b => b.specializations))]
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Barber Location Management</h2>
          <p className="text-muted-foreground">
            Manage barber assignments across different locations
          </p>
        </div>
        <div className="space-x-2">
          <Button
            variant={isEditing ? "secondary" : "outline"}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          {isEditing && (
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Location Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        {locations.map(location => {
          const stats = getLocationStats(location.id)
          return (
            <Card key={location.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-lg">{location.name}</span>
                  </div>
                  <Badge variant={location.active ? "default" : "secondary"}>
                    {location.active ? 'Active' : 'Inactive'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{location.address}</p>
                
                <div className="flex justify-between text-sm">
                  <span>Barbers:</span>
                  <Badge variant="outline">{stats.totalBarbers}</Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Available Services:</p>
                  <div className="flex flex-wrap gap-1">
                    {stats.specialties.slice(0, 3).map(specialty => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {stats.specialties.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{stats.specialties.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Barber Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Barber Assignments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {barbers.map(barber => (
              <div key={barber.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {barber.profileImage && (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src={barber.profileImage.url}
                          alt={barber.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{barber.name}</h3>
                      <p className="text-sm text-muted-foreground">{barber.email}</p>
                    </div>
                  </div>
                  <Badge variant={barber.isActive ? "default" : "secondary"}>
                    {barber.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Specializations:</h4>
                  <div className="flex flex-wrap gap-2">
                    {barber.specializations.map(spec => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        <Scissors className="w-3 h-3 mr-1" />
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Location Assignments:</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {locations.map(location => {
                      const isAssigned = barber.locations.includes(location.id)
                      return (
                        <div 
                          key={location.id} 
                          className={`p-3 border rounded-lg transition-colors ${
                            isAssigned 
                              ? 'border-blue-200 bg-blue-50' 
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={isAssigned}
                              disabled={!isEditing}
                              onCheckedChange={() => {
                                if (isEditing) {
                                  toggleBarberLocation(barber.id, location.id)
                                }
                              }}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{location.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {location.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button variant="outline" size="sm">
                        <Clock className="w-4 h-4 mr-2" />
                        Manage Schedule
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start">
              <Plus className="w-4 h-4 mr-2" />
              Add New Barber
            </Button>
            <Button variant="outline" className="justify-start">
              <MapPin className="w-4 h-4 mr-2" />
              Add New Location
            </Button>
            <Button variant="outline" className="justify-start">
              <Scissors className="w-4 h-4 mr-2" />
              Manage Services
            </Button>
            <Button variant="outline" className="justify-start">
              <Clock className="w-4 h-4 mr-2" />
              Bulk Schedule Update
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BarberLocationManager
