"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, ArrowRight, User, Phone, Mail, MessageSquare, CreditCard, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

interface Stylist {
  id: string
  firstName: string
  lastName: string
}

interface BookingData {
  service: Service
  stylist: Stylist | null
  date: string
  time: string
}

interface CustomerForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
  marketingConsent: boolean
  paymentMethod: 'card' | 'cash' | 'deposit'
  emergencyContact?: string
  referralSource?: string
}

export default function BookingDetailsPage() {
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [customerForm, setCustomerForm] = useState<CustomerForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    marketingConsent: false,
    paymentMethod: 'card'
  })
  const [errors, setErrors] = useState<Partial<CustomerForm>>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Load booking data from localStorage
    const data = localStorage.getItem('finalBookingData')
    if (data) {
      setBookingData(JSON.parse(data))
    } else {
      router.push('/book')
      return
    }
  }, [router])

  const handleInputChange = (field: keyof CustomerForm, value: string | boolean) => {
    setCustomerForm(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerForm> = {}

    if (!customerForm.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!customerForm.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!customerForm.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!customerForm.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(customerForm.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = async () => {
    if (!validateForm() || !bookingData) return

    setLoading(true)

    try {
      // Store customer information
      const completeBookingData = {
        ...bookingData,
        customer: customerForm
      }

      localStorage.setItem('completeBookingData', JSON.stringify(completeBookingData))

      // Navigate to payment or confirmation
      if (customerForm.paymentMethod === 'deposit') {
        router.push('/book/deposit')
      } else if (customerForm.paymentMethod === 'card') {
        router.push('/book/payment')
      } else {
        router.push('/book/confirmation')
      }
    } catch (error) {
      console.error('Error saving booking details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/book/datetime')
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/[^\d]/g, '')

    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
    }
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    handleInputChange('phone', formatted)
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading booking details...</p>
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
              Back to Date & Time
            </Button>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Booking Details
              </h1>
              <p className="text-xl text-gray-600">
                Complete your appointment information
              </p>
            </div>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Please provide your contact details for the appointment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={customerForm.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={cn(errors.firstName && "border-red-500")}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={customerForm.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={cn(errors.lastName && "border-red-500")}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={cn(errors.email && "border-red-500")}
                      placeholder="john.doe@email.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      value={customerForm.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={cn(errors.phone && "border-red-500")}
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>
                  Choose how you'd like to pay for your service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={customerForm.paymentMethod}
                  onValueChange={(value: 'card' | 'cash' | 'deposit') =>
                    handleInputChange('paymentMethod', value)
                  }
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="card" id="card" />
                    <div className="flex-1">
                      <Label htmlFor="card" className="font-medium cursor-pointer">
                        Credit/Debit Card
                      </Label>
                      <p className="text-sm text-gray-600">Pay securely online now</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="cash" id="cash" />
                    <div className="flex-1">
                      <Label htmlFor="cash" className="font-medium cursor-pointer">
                        Pay in Person
                      </Label>
                      <p className="text-sm text-gray-600">Pay with cash or card at the salon</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="deposit" id="deposit" />
                    <div className="flex-1">
                      <Label htmlFor="deposit" className="font-medium cursor-pointer">
                        Deposit Required
                      </Label>
                      <p className="text-sm text-gray-600">Pay 50% deposit online, balance at salon</p>
                      <p className="text-xs text-blue-600 mt-1">Deposit: ${(bookingData.service.price * 0.5).toFixed(2)}</p>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Additional Information
                </CardTitle>
                <CardDescription>
                  Any special requests or notes for your appointment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Special Requests or Notes</Label>
                  <Textarea
                    id="notes"
                    value={customerForm.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any specific styles, concerns, or preferences..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact (Optional)</Label>
                  <Input
                    id="emergencyContact"
                    value={customerForm.emergencyContact || ''}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Name and phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralSource">How did you hear about us? (Optional)</Label>
                  <Input
                    id="referralSource"
                    value={customerForm.referralSource || ''}
                    onChange={(e) => handleInputChange('referralSource', e.target.value)}
                    placeholder="Google, friend, social media, etc."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketingConsent"
                    checked={customerForm.marketingConsent}
                    onCheckedChange={(checked) =>
                      handleInputChange('marketingConsent', !!checked)
                    }
                  />
                  <Label htmlFor="marketingConsent" className="text-sm">
                    I agree to receive promotional emails and special offers
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{bookingData.service.name}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{bookingData.service.duration} min</span>
                  </div>

                  {bookingData.stylist && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stylist:</span>
                      <span className="font-medium">
                        {bookingData.stylist.firstName} {bookingData.stylist.lastName}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(bookingData.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{bookingData.time}</span>
                  </div>
                </div>

                <hr />

                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${bookingData.service.price.toFixed(2)}</span>
                  </div>

                  {customerForm.paymentMethod === 'deposit' && (
                    <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                      Deposit: ${(bookingData.service.price * 0.5).toFixed(2)}
                      <br />
                      Balance: ${(bookingData.service.price * 0.5).toFixed(2)}
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleContinue}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  {customerForm.paymentMethod === 'deposit' ? 'Pay Deposit' :
                   customerForm.paymentMethod === 'card' ? 'Pay Now' : 'Complete Booking'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By completing this booking, you agree to our terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Need help with your booking?
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
