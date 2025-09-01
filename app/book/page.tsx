"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Scissors, Star, ArrowRight, Loader2 } from "@/lib/icon-mapping"
import { cn } from "@/lib/utils"

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  category: string
  is_active: boolean
  features?: string[]
  image_url?: string
}

interface ServiceCategory {
  name: string
  services: Service[]
}

export default function BookAppointmentPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (!response.ok) throw new Error('Failed to fetch services')
      const data = await response.json()
      setServices(data)

      // Group services by category
      const grouped = data.reduce((acc: ServiceCategory[], service: Service) => {
        const existingCategory = acc.find(cat => cat.name === service.category)
        if (existingCategory) {
          existingCategory.services.push(service)
        } else {
          acc.push({
            name: service.category || 'General',
            services: [service]
          })
        }
        return acc
      }, [])
      setCategories(grouped)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    // Store selected service in localStorage for next step
    const service = services.find(s => s.id === serviceId)
    if (service) {
      localStorage.setItem('selectedService', JSON.stringify(service))
      router.push('/book/stylist')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Choose Your Service
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select from our premium barber services. Each treatment is crafted to perfection.
            </p>
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categories.map((category, categoryIndex) => (
          <div key={category.name} className={cn("mb-12", categoryIndex > 0 && "border-t pt-12")}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {category.name}
              </h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.services.map((service) => (
                <Card
                  key={service.id}
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:shadow-lg border-2",
                    selectedService === service.id
                      ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-blue-300"
                  )}
                  onClick={() => handleServiceSelect(service.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                          {service.name}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          {service.description}
                        </CardDescription>
                      </div>
                      <div className="ml-4">
                        <Badge variant="secondary" className="text-sm">
                          ${service.price}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Duration & Price Info */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>4.9</span>
                        </div>
                      </div>

                      {/* Features */}
                      {service.features && service.features.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900 text-sm">Includes:</h4>
                          <ul className="space-y-1">
                            {service.features.slice(0, 3).map((feature, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                                <Scissors className="h-3 w-3 text-blue-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        className={cn(
                          "w-full mt-4",
                          selectedService === service.id
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-900 hover:bg-gray-800"
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleServiceSelect(service.id)
                        }}
                      >
                        Select Service
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="text-center py-12">
            <Scissors className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Services Available</h3>
            <p className="text-gray-600">
              We're currently updating our services. Please check back soon!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Have questions about our services?
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <span>📞 (555) 123-4567</span>
              <span>📧 info@modernmen.com</span>
              <span>📍 123 Barber Street</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
