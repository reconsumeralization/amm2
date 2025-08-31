import { Metadata } from 'next'
import { BarberHeader } from '@/components/features/barber/Header'
import { ContactInfo } from '@/components/features/barber/ContactInfo'
import { MapEmbed } from '@/components/features/barber/MapEmbed'
import { Footer as BarberFooter } from '@/components/features/barber/Footer'
import { unstable_noStore as noStore } from 'next/cache'

export const metadata: Metadata = {
  title: 'Contact Us | Modern Men Hair BarberShop',
  description: 'Get in touch with Modern Men Hair BarberShop. Visit us, call us, or send us a message. We\'re here to help with all your grooming needs.',
  keywords: ['contact', 'modern men BarberShop', 'regina', 'phone', 'email', 'location'],
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
    <>
      <BarberHeader />
      <main className="section-premium">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          <h1 className="text-3xl font-bold text-black dark:text-white">Contact Us</h1>
          <ContactInfo
            address={contact.address}
            phone={contact.phone}
            email={contact.email}
            hours={contact.hours}
          />
          <MapEmbed src={contact.mapEmbedUrl} />
        </div>
      </main>
      <BarberFooter />
    </>
  );
}
