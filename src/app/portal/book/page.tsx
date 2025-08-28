'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { Calendar, Clock, Scissors, Star, Users, Award, CheckCircle, MapPin, Phone } from '@/lib/icon-mapping'
import { toast } from 'sonner'

export default function BookAppointmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    notes: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/portal/login')
    }
  }, [session, status, router])

  const services = [
    { 
      id: 'classic-haircut', 
      name: 'Classic Haircut', 
      price: '$35', 
      duration: '30 min',
      description: 'Professional cut and style',
      popular: true,
      category: 'Haircut'
    },
    { 
      id: 'premium-haircut', 
      name: 'Premium Haircut', 
      price: '$45', 
      duration: '45 min',
      description: 'Cut, wash, and style',
      popular: false,
      category: 'Haircut'
    },
    { 
      id: 'beard-trim', 
      name: 'Beard Trim & Shape', 
      price: '$25', 
      duration: '20 min',
      description: 'Professional beard grooming',
      popular: true,
      category: 'Beard'
    },
    { 
      id: 'beard-shave', 
      name: 'Hot Towel Shave', 
      price: '$40', 
      duration: '30 min',
      description: 'Traditional hot towel shave',
      popular: false,
      category: 'Beard'
    },
    { 
      id: 'hair-color', 
      name: 'Hair Coloring', 
      price: '$85', 
      duration: '90 min',
      description: 'Professional hair coloring',
      popular: false,
      category: 'Color'
    },
    { 
      id: 'styling', 
      name: 'Hair Styling', 
      price: '$45', 
      duration: '45 min',
      description: 'Special occasion styling',
      popular: false,
      category: 'Styling'
    },
    { 
      id: 'facial', 
      name: 'Facial Treatment', 
      price: '$65', 
      duration: '60 min',
      description: 'Deep cleansing facial',
      popular: false,
      category: 'Facial'
    },
    { 
      id: 'complete-package', 
      name: 'Complete Package', 
      price: '$150', 
      duration: '2 hours',
      description: 'Haircut, beard trim, and facial',
      popular: true,
      category: 'Package'
    }
  ]

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success('Appointment booked successfully!', {
        description: `Your ${formData.service} appointment is scheduled for ${formData.date} at ${formData.time}`
      })

      router.push('/portal')
    } catch (error) {
      toast.error('Failed to book appointment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
                  Book Appointment
                </h1>
                <p className="text-sm text-gray-600">Schedule your next visit</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge 
            variant="secondary" 
            className="bg-amber-100 text-amber-800 px-4 py-2 text-sm font-medium mb-4"
          >
            📅 Book Your Appointment
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Schedule Your <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">Perfect Look</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our premium services and book your appointment with our expert stylists
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Booking Form */}
          <motion.div 
            className="xl:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-t-xl">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 rounded-full bg-white/20">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <span>Appointment Details</span>
                </CardTitle>
                <CardDescription className="text-amber-100">
                  Fill in your appointment preferences and we'll confirm your booking
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Service Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="service" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Scissors className="h-4 w-4 text-amber-600" />
                      Select Service
                    </Label>
                    <select
                      id="service"
                      value={formData.service}
                      onChange={(e) => handleInputChange('service', e.target.value)}
                      required
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-amber-500 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <option value="">Choose a service...</option>
                      {services.map(service => (
                        <option key={service.id} value={service.name}>
                          {service.name} - {service.price} ({service.duration})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-amber-600" />
                      Preferred Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-amber-500 shadow-sm hover:shadow-md transition-all duration-300"
                    />
                  </div>

                  {/* Time Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="time" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      Preferred Time
                    </Label>
                    <select
                      id="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      required
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-amber-500 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <option value="">Choose a time...</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-3">
                    <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-amber-600">📝</span>
                      Special Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Any special requests or notes for your stylist..."
                      rows={4}
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-amber-500 resize-none shadow-sm hover:shadow-md transition-all duration-300"
                    />
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Booking Appointment...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Book Appointment
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Services Preview */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-xl">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 rounded-full bg-white/20">
                    <Scissors className="h-5 w-5" />
                  </div>
                  <span>Our Services</span>
                </CardTitle>
                <CardDescription className="text-slate-200">
                  Professional hair care services
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                      className="group cursor-pointer"
                      onClick={() => handleInputChange('service', service.name)}
                    >
                      <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        formData.service === service.name 
                          ? 'border-amber-500 bg-amber-50 shadow-lg' 
                          : 'border-gray-200 bg-gray-50 hover:border-amber-300 hover:bg-amber-50/50'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-800 group-hover:text-amber-600 transition-colors">
                                {service.name}
                              </h4>
                              {service.popular && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{service.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {service.duration}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {service.category}
                              </Badge>
                            </div>
                          </div>
                          <span className="font-bold text-lg text-amber-600">{service.price}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Booking Tips */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-800 to-amber-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Icons.info className="h-5 w-5" />
                  <span>Booking Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Appointments can be rescheduled up to 24 hours in advance</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Please arrive 5-10 minutes early for your appointment</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>We'll send you a confirmation email with appointment details</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Cancellation policy: 24 hours notice required</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
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
