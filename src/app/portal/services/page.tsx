'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

export default function ServicesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/portal/login')
    }
  }, [session, status, router])

  const services = [
    {
      id: 'haircut',
      name: 'Classic Haircut',
      price: '$35',
      duration: '30 minutes',
      description: 'Professional haircut tailored to your face shape and hair type. Includes consultation, precision cutting, and styling.',
      features: ['Face shape analysis', 'Precision cutting', 'Professional styling', 'Aftercare advice'],
      popular: true,
      image: '✂'
    },
    {
      id: 'hair-color',
      name: 'Hair Coloring',
      price: '$85',
      duration: '90 minutes',
      description: 'Expert hair coloring service using premium products. Full consultation to achieve your desired look.',
      features: ['Color consultation', 'Premium products', 'Full coverage', 'Tone matching', 'Color maintenance advice'],
      popular: true,
      image: '🎨'
    },
    {
      id: 'styling',
      name: 'Hair Styling',
      price: '$45',
      duration: '45 minutes',
      description: 'Professional styling for special occasions or everyday looks. Perfect for weddings, events, or daily style.',
      features: ['Special occasion styling', 'Product application', 'Style consultation', 'Long-lasting hold'],
      popular: false,
      image: '💇'
    },
    {
      id: 'beard-trim',
      name: 'Beard Trim & Shaping',
      price: '$25',
      duration: '20 minutes',
      description: 'Expert beard grooming and shaping. Clean lines and professional maintenance for a polished look.',
      features: ['Beard consultation', 'Precision trimming', 'Line definition', 'Product recommendations'],
      popular: false,
      image: '🪒'
    },
    {
      id: 'facial',
      name: 'Facial Treatment',
      price: '$65',
      duration: '60 minutes',
      description: 'Deep cleansing facial treatment to refresh and rejuvenate your skin. Perfect complement to hair services.',
      features: ['Deep cleansing', 'Exfoliation', 'Moisturizing', 'Relaxing massage', 'Skin analysis'],
      popular: false,
      image: '🧴'
    },
    {
      id: 'package',
      name: 'Complete Package',
      price: '$150',
      duration: '2 hours',
      description: 'Full experience package including haircut, styling, and premium treatment. Best value for comprehensive care.',
      features: ['Full haircut', 'Premium styling', 'Facial treatment', 'Priority booking', 'Complimentary consultation'],
      popular: true,
      image: '👑'
    }
  ]

  const handleBookService = (serviceId: string, serviceName: string) => {
    router.push(`/portal/book?service=${encodeURIComponent(serviceName)}`)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Icons.spinner className="h-6 w-6 animate-spin text-amber-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-amber-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xl text-white font-bold">✂</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-amber-600 to-blue-800 bg-clip-text text-transparent">
                  Our Services
                </h1>
                <p className="text-sm text-gray-600">Professional hair care and grooming services</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/portal')}
              className="border-amber-200 hover:border-amber-300 hover:bg-amber-50"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map(service => (
            <Card key={service.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 relative">
              {service.popular && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  POPULAR
                </div>
              )}

              <CardHeader className="bg-gradient-to-r from-blue-600 to-amber-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="text-2xl">{service.image}</div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{service.price}</div>
                    <div className="text-sm text-blue-100">{service.duration}</div>
                  </div>
                </div>
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <CardDescription className="text-blue-100">
                  {service.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-gray-800">What's included:</h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => handleBookService(service.id, service.name)}
                  className="w-full bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Icons.calendar className="mr-2 h-4 w-4" />
                  Book {service.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Icons.scissors className="h-5 w-5" />
                <span>Men's Haircuts</span>
              </CardTitle>
              <CardDescription className="text-amber-100">
                Professional cuts for every style and occasion
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-800">Classic Cut</h4>
                    <p className="text-sm text-gray-600">Traditional styling</p>
                  </div>
                  <span className="font-bold text-blue-600">$35</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-800">Modern Fade</h4>
                    <p className="text-sm text-gray-600">Contemporary styling</p>
                  </div>
                  <span className="font-bold text-blue-600">$40</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-800">Buzz Cut</h4>
                    <p className="text-sm text-gray-600">Low maintenance</p>
                  </div>
                  <span className="font-bold text-blue-600">$25</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-800 to-amber-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Icons.users className="h-5 w-5" />
                <span>Beard & Grooming</span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Complete grooming experience
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-800">Beard Trim</h4>
                    <p className="text-sm text-gray-600">Shape and maintain</p>
                  </div>
                  <span className="font-bold text-blue-600">$25</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-800">Hot Towel Shave</h4>
                    <p className="text-sm text-gray-600">Traditional straight razor</p>
                  </div>
                  <span className="font-bold text-blue-600">$45</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-800">Face & Beard</h4>
                    <p className="text-sm text-gray-600">Complete package</p>
                  </div>
                  <span className="font-bold text-blue-600">$65</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Ready to Book?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/portal/book')}
              className="bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Icons.calendar className="mr-2 h-5 w-5" />
              Book Appointment Now
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/portal')}
              className="border-amber-200 hover:border-amber-300 hover:bg-amber-50 py-3 px-8"
            >
              <Icons.arrowLeft className="mr-2 h-5 w-5" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 bg-white border-t border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © 2025 Modern Men Barbershop. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
