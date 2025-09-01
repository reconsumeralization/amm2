"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Lock, Loader2, CheckCircle, AlertCircle } from "@/lib/icon-mapping"
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

interface CustomerForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
  marketingConsent: boolean
  paymentMethod: 'card' | 'cash' | 'deposit'
}

interface BookingData {
  service: Service
  stylist: Stylist | null
  date: string
  time: string
  customer: CustomerForm
}

interface PaymentForm {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvc: string
  nameOnCard: string
  billingAddress: {
    line1: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export default function PaymentPage() {
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    nameOnCard: '',
    billingAddress: {
      line1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    }
  })
  const [errors, setErrors] = useState<Partial<PaymentForm>>({})
  const [loading, setLoading] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Load booking data from localStorage
    const data = localStorage.getItem('completeBookingData')
    if (data) {
      setBookingData(JSON.parse(data))
    } else {
      router.push('/book')
      return
    }
  }, [router])

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const cardNumber = value.replace(/\D/g, '')

    // Add spaces every 4 digits
    const formatted = cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')

    return formatted.substring(0, 19) // Max 16 digits + 3 spaces
  }

  const formatExpiry = (value: string, field: 'month' | 'year') => {
    const digits = value.replace(/\D/g, '')

    if (field === 'month') {
      const month = parseInt(digits)
      if (month > 12) return '12'
      return digits.substring(0, 2)
    } else {
      return digits.substring(0, 2)
    }
  }

  const handleInputChange = (field: string, value: string, subField?: string) => {
    if (subField) {
      setPaymentForm(prev => ({
        ...prev,
        [field]: {
          ...prev[field as keyof PaymentForm] as any,
          [subField]: value
        }
      }))
    } else {
      setPaymentForm(prev => ({ ...prev, [field]: value }))

      // Clear error when user starts typing
      if (errors[field as keyof PaymentForm]) {
        setErrors(prev => ({ ...prev, [field]: undefined }))
      }
    }
  }

  const validatePaymentForm = (): boolean => {
    const newErrors: Partial<PaymentForm> = {}

    // Card number validation
    const cardNumberDigits = paymentForm.cardNumber.replace(/\s/g, '')
    if (!cardNumberDigits) {
      newErrors.cardNumber = 'Card number is required'
    } else if (cardNumberDigits.length < 13 || cardNumberDigits.length > 19) {
      newErrors.cardNumber = 'Invalid card number'
    }

    // Expiry validation
    if (!paymentForm.expiryMonth || !paymentForm.expiryYear) {
      newErrors.expiryMonth = 'Expiry date is required'
    } else {
      const currentYear = new Date().getFullYear() % 100
      const currentMonth = new Date().getMonth() + 1
      const expYear = parseInt(paymentForm.expiryYear)
      const expMonth = parseInt(paymentForm.expiryMonth)

      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        newErrors.expiryMonth = 'Card has expired'
      }
    }

    // CVC validation
    if (!paymentForm.cvc) {
      newErrors.cvc = 'CVC is required'
    } else if (paymentForm.cvc.length < 3 || paymentForm.cvc.length > 4) {
      newErrors.cvc = 'Invalid CVC'
    }

    // Name validation
    if (!paymentForm.nameOnCard.trim()) {
      newErrors.nameOnCard = 'Name on card is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayment = async () => {
    if (!validatePaymentForm() || !bookingData) return

    setProcessingPayment(true)
    setLoading(true)

    try {
      // Simulate Stripe payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Store payment information
      const paymentData = {
        ...bookingData,
        payment: {
          ...paymentForm,
          amount: bookingData.service.price,
          status: 'completed',
          transactionId: `txn_${Date.now()}`,
          processedAt: new Date().toISOString()
        }
      }

      localStorage.setItem('paymentData', JSON.stringify(paymentData))

      // Navigate to confirmation
      router.push('/book/confirmation')

    } catch (error) {
      console.error('Payment processing error:', error)
      setErrors({ cardNumber: 'Payment processing failed. Please try again.' })
    } finally {
      setProcessingPayment(false)
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/book/details')
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading payment details...</p>
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
              Back to Details
            </Button>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Secure Payment
              </h1>
              <p className="text-xl text-gray-600">
                Complete your booking with secure payment
              </p>
            </div>
            <div className="w-28"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Payment Form */}
          <div className="space-y-6">
            {/* Security Notice */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-800">Secure Payment</h3>
                    <p className="text-sm text-green-600">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Card Information
                </CardTitle>
                <CardDescription>
                  Enter your payment details securely
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    id="cardNumber"
                    value={paymentForm.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                    className={cn(errors.cardNumber && "border-red-500")}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  {errors.cardNumber && (
                    <p className="text-sm text-red-600">{errors.cardNumber}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="expiryMonth">Month *</Label>
                    <Input
                      id="expiryMonth"
                      value={paymentForm.expiryMonth}
                      onChange={(e) => handleInputChange('expiryMonth', formatExpiry(e.target.value, 'month'))}
                      className={cn(errors.expiryMonth && "border-red-500")}
                      placeholder="MM"
                      maxLength={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiryYear">Year *</Label>
                    <Input
                      id="expiryYear"
                      value={paymentForm.expiryYear}
                      onChange={(e) => handleInputChange('expiryYear', formatExpiry(e.target.value, 'year'))}
                      className={cn(errors.expiryYear && "border-red-500")}
                      placeholder="YY"
                      maxLength={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC *</Label>
                    <Input
                      id="cvc"
                      value={paymentForm.cvc}
                      onChange={(e) => handleInputChange('cvc', e.target.value.replace(/\D/g, '').substring(0, 4))}
                      className={cn(errors.cvc && "border-red-500")}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>

                {errors.expiryMonth && (
                  <p className="text-sm text-red-600">{errors.expiryMonth}</p>
                )}

                {errors.cvc && (
                  <p className="text-sm text-red-600">{errors.cvc}</p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="nameOnCard">Name on Card *</Label>
                  <Input
                    id="nameOnCard"
                    value={paymentForm.nameOnCard}
                    onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
                    className={cn(errors.nameOnCard && "border-red-500")}
                    placeholder="John Doe"
                  />
                  {errors.nameOnCard && (
                    <p className="text-sm text-red-600">{errors.nameOnCard}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
                <CardDescription>
                  Required for payment processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Address Line 1</Label>
                  <Input
                    id="billingAddress"
                    value={paymentForm.billingAddress.line1}
                    onChange={(e) => handleInputChange('billingAddress', e.target.value, 'line1')}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="billingCity">City</Label>
                    <Input
                      id="billingCity"
                      value={paymentForm.billingAddress.city}
                      onChange={(e) => handleInputChange('billingAddress', e.target.value, 'city')}
                      placeholder="New York"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billingState">State</Label>
                    <Input
                      id="billingState"
                      value={paymentForm.billingAddress.state}
                      onChange={(e) => handleInputChange('billingAddress', e.target.value, 'state')}
                      placeholder="NY"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="billingPostalCode">ZIP Code</Label>
                    <Input
                      id="billingPostalCode"
                      value={paymentForm.billingAddress.postalCode}
                      onChange={(e) => handleInputChange('billingAddress', e.target.value, 'postalCode')}
                      placeholder="10001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billingCountry">Country</Label>
                    <Input
                      id="billingCountry"
                      value={paymentForm.billingAddress.country}
                      onChange={(e) => handleInputChange('billingAddress', e.target.value, 'country')}
                      placeholder="US"
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handlePayment}
              disabled={loading || processingPayment}
            >
              {processingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Pay ${bookingData.service.price.toFixed(2)}
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Your payment is secured with 256-bit SSL encryption
            </p>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Service Details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{bookingData.service.name}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{bookingData.service.duration} minutes</span>
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

                <Separator />

                {/* Customer Details */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Customer Details</h4>
                  <div className="text-sm text-gray-600">
                    <div>{bookingData.customer.firstName} {bookingData.customer.lastName}</div>
                    <div>{bookingData.customer.email}</div>
                    <div>{bookingData.customer.phone}</div>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${bookingData.service.price.toFixed(2)}</span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Secure payment processing</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Instant confirmation</span>
                    </div>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Lock className="h-4 w-4" />
                      <span>SSL Secured</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      <span>PCI Compliant</span>
                    </div>
                  </div>
                </div>
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
              Questions about payment?
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <span>📞 (555) 123-4567</span>
              <span>📧 billing@modernmen.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
