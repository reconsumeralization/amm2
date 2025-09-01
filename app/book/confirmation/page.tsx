"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  Scissors,
  Mail,
  Phone,
  Download,
  Home,
  Loader2,
  AlertCircle
} from "@/lib/icon-mapping"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

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

interface PaymentData {
  amount: number
  status: string
  transactionId: string
  processedAt: string
}

export default function BookingConfirmationPage() {
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Load booking data from localStorage
    const data = localStorage.getItem('completeBookingData') || localStorage.getItem('paymentData')
    if (data) {
      const parsedData = JSON.parse(data)
      setBookingData(parsedData)

      if (parsedData.payment) {
        setPaymentData(parsedData.payment)
      }

      // Generate appointment ID
      setAppointmentId(`APT-${Date.now()}`)
    } else {
      router.push('/book')
      return
    }
  }, [router])

  const sendConfirmationEmail = async () => {
    if (!bookingData || !appointmentId) return

    setLoading(true)
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real application, you would call your email API here
      console.log('Sending confirmation email to:', bookingData.customer.email)

      setEmailSent(true)
    } catch (error) {
      console.error('Error sending email:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadReceipt = () => {
    if (!bookingData || !appointmentId) return

    // Create a simple receipt text
    const receiptText = `
MODERN MEN BARBERSHOP
Appointment Confirmation Receipt

Appointment ID: ${appointmentId}
Date: ${new Date().toLocaleDateString()}

Customer: ${bookingData.customer.firstName} ${bookingData.customer.lastName}
Email: ${bookingData.customer.email}
Phone: ${bookingData.customer.phone}

Service: ${bookingData.service.name}
Duration: ${bookingData.service.duration} minutes
Price: $${bookingData.service.price.toFixed(2)}

${bookingData.stylist ? `Stylist: ${bookingData.stylist.firstName} ${bookingData.stylist.lastName}` : 'Stylist: Any Available'}

Appointment Date: ${new Date(bookingData.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}
Time: ${bookingData.time}

Payment Method: ${bookingData.customer.paymentMethod === 'card' ? 'Credit Card' :
                  bookingData.customer.paymentMethod === 'deposit' ? 'Deposit' : 'Pay at Salon'}

${paymentData ? `Transaction ID: ${paymentData.transactionId}
Payment Date: ${new Date(paymentData.processedAt).toLocaleDateString()}` : ''}

Thank you for choosing Modern Men Barbershop!
We look forward to seeing you.

Location: 123 Barber Street, City, State 12345
Phone: (555) 123-4567
Email: info@modernmen.com
`

    // Create and download the receipt
    const blob = new Blob([receiptText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${appointmentId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleNewBooking = () => {
    // Clear localStorage and start new booking
    localStorage.removeItem('selectedService')
    localStorage.removeItem('bookingData')
    localStorage.removeItem('finalBookingData')
    localStorage.removeItem('completeBookingData')
    localStorage.removeItem('paymentData')
    router.push('/book')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  if (!bookingData || !appointmentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-xl text-gray-600">
              Your appointment has been successfully scheduled
            </p>
            <div className="mt-4">
              <Badge variant="default" className="text-lg px-4 py-2">
                Appointment #{appointmentId}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Confirmation Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Scissors className="h-4 w-4" />
                      <span className="font-medium">Service</span>
                    </div>
                    <p className="text-lg font-semibold">{bookingData.service.name}</p>
                    <p className="text-sm text-gray-600">
                      {bookingData.service.duration} minutes • ${bookingData.service.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Stylist</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {bookingData.stylist
                        ? `${bookingData.stylist.firstName} ${bookingData.stylist.lastName}`
                        : 'Any Available Stylist'
                      }
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Date</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {format(new Date(bookingData.date), 'EEEE, MMMM do, yyyy')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Time</span>
                    </div>
                    <p className="text-lg font-semibold">{bookingData.time}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-gray-900">Name</h4>
                    <p className="text-gray-600">
                      {bookingData.customer.firstName} {bookingData.customer.lastName}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">Phone</h4>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {bookingData.customer.phone}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Email</h4>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {bookingData.customer.email}
                  </p>
                </div>

                {bookingData.customer.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900">Special Requests</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg mt-1">
                      {bookingData.customer.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Method:</span>
                    <Badge variant="outline">
                      {bookingData.customer.paymentMethod === 'card' ? 'Credit Card' :
                       bookingData.customer.paymentMethod === 'deposit' ? 'Deposit Paid' : 'Pay at Salon'}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span>${bookingData.service.price.toFixed(2)}</span>
                  </div>

                  {paymentData && (
                    <>
                      <Separator />
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Transaction ID:</span>
                          <span>{paymentData.transactionId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Date:</span>
                          <span>{format(new Date(paymentData.processedAt), 'MMM do, yyyy hh:mm a')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            {paymentData.status}
                          </Badge>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Confirmation Email</h4>
                      <p className="text-sm text-gray-600">
                        Check your email for appointment details
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">24-Hour Reminder</h4>
                      <p className="text-sm text-gray-600">
                        We'll send a reminder 24 hours before
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Arrival Time</h4>
                      <p className="text-sm text-gray-600">
                        Please arrive 10 minutes early
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={sendConfirmationEmail}
                disabled={emailSent || loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : emailSent ? (
                  <CheckCircle className="mr-2 h-4 w-4" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {emailSent ? 'Email Sent!' : 'Send Confirmation Email'}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={downloadReceipt}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleNewBooking}
              >
                Book Another Appointment
              </Button>

              <Button
                variant="default"
                className="w-full"
                onClick={handleGoHome}
              >
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </div>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>info@modernmen.com</span>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  Our team is here to help with any questions about your appointment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Thank you for choosing Modern Men Barbershop!
            </p>
            <p className="text-sm text-gray-500">
              We look forward to providing you with an exceptional grooming experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
