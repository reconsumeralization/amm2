import { Metadata } from 'next'
import { unstable_noStore as noStore } from 'next/cache'
import { BarberHeader } from '@/components/features/barber/Header'
import { ContactInfo } from '@/components/features/barber/ContactInfo'
import { MapEmbed } from '@/components/features/barber/MapEmbed'
import { Footer as BarberFooter } from '@/components/features/barber/Footer'
import { ContactForm } from '@/components/forms/contact-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Contact Us | Modern Men Hair BarberShop',
  description:
    "Get in touch with Modern Men Hair BarberShop. Visit us, call us, or send us a message. We're here to help with all your grooming needs.",
  keywords: ['contact', 'modern men barbershop', 'regina', 'phone', 'email', 'location'],
  openGraph: {
    title: 'Contact Us | Modern Men Hair BarberShop',
    description: 'Get in touch with Modern Men Hair BarberShop. Visit us, call us, or send us a message.',
    url: 'https://www.modernmen.ca/contact',
    siteName: 'Modern Men Hair BarberShop',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Modern Men Hair BarberShop',
    description: 'Get in touch with Modern Men Hair BarberShop. Visit us, call us, or send us a message.',
  },
}

async function fetchContact() {
  noStore()
  try {
    const base = process.env.PAYLOAD_PUBLIC_SERVER_URL || ''
    const res = await fetch(`${base}/api/settings`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export default async function ContactPage() {
  const settings = await fetchContact()
  const contact = settings?.contact || {}

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <BarberHeader />
      <main className="flex-grow container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            Get in Touch
          </h1>
          <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 dark:text-gray-400 sm:text-xl md:mt-5 md:max-w-3xl">
            We're here to help with all your grooming needs. Reach out to us anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
              <CardDescription>
                Have a question or want to book an appointment? Fill out the form below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactInfo
                  address={contact.address}
                  phone={contact.phone}
                  email={contact.email}
                  hours={contact.hours}
                />
              </CardContent>
            </Card>
            
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Find Us</CardTitle>
              </CardHeader>
              <CardContent>
                <MapEmbed src={contact.mapEmbedUrl} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <BarberFooter />
    </div>
  )
}
