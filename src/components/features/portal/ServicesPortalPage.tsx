'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface Service {
  id: string
  name: string
  description: string
  category: string
  duration: number // in minutes
  price: number
  imageUrl?: string
  isPopular?: boolean
  isAvailable: boolean
}

interface ServicesPortalPageProps {
  initialCategory?: string
  initialService?: string
}

const sampleServices: Service[] = [
  {
    id: '1',
    name: 'Classic Haircut',
    description: 'Traditional haircut with precision styling',
    category: 'haircut',
    duration: 45,
    price: 35,
    isPopular: true,
    isAvailable: true
  },
  {
    id: '2',
    name: 'Beard Trim',
    description: 'Professional beard shaping and trimming',
    category: 'beard',
    duration: 20,
    price: 20,
    isAvailable: true
  },
  {
    id: '3',
    name: 'Hair & Beard Combo',
    description: 'Complete grooming package',
    category: 'combo',
    duration: 60,
    price: 50,
    isPopular: true,
    isAvailable: true
  },
  {
    id: '4',
    name: 'Hot Towel Shave',
    description: 'Luxurious straight razor shave with hot towel',
    category: 'shave',
    duration: 30,
    price: 25,
    isAvailable: true
  },
  {
    id: '5',
    name: 'Hair Coloring',
    description: 'Professional hair coloring services',
    category: 'coloring',
    duration: 90,
    price: 75,
    isAvailable: true
  },
  {
    id: '6',
    name: 'Scalp Treatment',
    description: 'Deep conditioning scalp massage',
    category: 'treatment',
    duration: 25,
    price: 30,
    isAvailable: false
  }
]

const categories = ['all', 'haircut', 'beard', 'combo', 'shave', 'coloring', 'treatment']

export function ServicesPortalPage({ initialCategory = 'all', initialService }: ServicesPortalPageProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [services, setServices] = useState<Service[]>(sampleServices)
  const [loading, setLoading] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  useEffect(() => {
    setSelectedCategory(initialCategory)
  }, [initialCategory])

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(service => service.category === selectedCategory)

  const handleBookService = (service: Service) => {
    // In a real app, this would navigate to booking flow
    console.log('Booking service:', service)
    // For now, just show the service details
    setSelectedService(service)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatPrice = (price: number) => {
    return `$${price}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Our Services
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Discover our professional grooming services and book your appointment today
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredServices.map(service => (
            <Card
              key={service.id}
              className={cn(
                'relative overflow-hidden transition-all duration-300 hover:shadow-xl',
                !service.isAvailable && 'opacity-50'
              )}
            >
              {service.isPopular && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-amber-500 text-white border-0">
                    Popular
                  </Badge>
                </div>
              )}

              {service.imageUrl && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.imageUrl}
                    alt={service.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{service.name}</span>
                  <span className="text-lg font-bold text-amber-600">
                    {formatPrice(service.price)}
                  </span>
                </CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Icons.clock className="h-4 w-4" />
                    <span>{formatDuration(service.duration)}</span>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {service.category}
                  </Badge>
                </div>

                <Button
                  onClick={() => handleBookService(service)}
                  disabled={!service.isAvailable}
                  className="w-full"
                >
                  {service.isAvailable ? (
                    <>
                      <Icons.calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </>
                  ) : (
                    <>
                      <Icons.x className="h-4 w-4 mr-2" />
                      Unavailable
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <Icons.search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No services found
            </h3>
            <p className="text-gray-600">
              No services available in the selected category.
            </p>
          </div>
        )}

        {/* Service Details Modal */}
        {selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedService.name}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedService(null)}
                >
                  <Icons.x className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-gray-600 mb-4">{selectedService.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{formatDuration(selectedService.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium text-amber-600">{formatPrice(selectedService.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <Badge variant="secondary" className="capitalize">
                    {selectedService.category}
                  </Badge>
                </div>
              </div>

              <Button className="w-full" onClick={() => setSelectedService(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
