import { Metadata } from 'next';
import { Providers } from '@/providers/providers'
import { BarberHeader } from '@/components/features/barber/Header'
import { ServiceCard } from '@/components/features/barber/ServiceCard'
import { BarberGallery } from '@/components/features/barber/Gallery'
import { BarberTestimonial } from '@/components/features/barber/Testimonial'
import { AppointmentForm } from '@/components/features/barber/AppointmentForm'
import { HeroSection } from '@/components/features/barber/HeroSection'
import { AboutUs } from '@/components/features/barber/AboutUs'
import { PricingTable } from '@/components/features/barber/PricingTable'
import { FAQAccordion } from '@/components/features/barber/FAQAccordion'
import { Footer as BarberFooter } from '@/components/features/barber/Footer'

export const metadata: Metadata = {
  title: 'Modern Men Hair BarberShop | Premium Barber Services in Regina',
  description: 'Regina\'s premier men\'s grooming destination. Expert haircuts, classic shaves, and premium barber services. Book your appointment today.',
  keywords: ['hair BarberShop', 'barber', 'men\'s grooming', 'haircut', 'Regina', 'premium barber', 'beard trim', 'shave'],
  openGraph: {
    title: 'Modern Men Hair BarberShop | Premium Barber Services',
    description: 'Regina\'s premier men\'s grooming destination with expert stylists and premium services.',
    url: 'https://www.modernmen.ca',
    siteName: 'Modern Men Hair BarberShop',
    images: [
      {
        url: 'https://www.modernmen.ca/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Modern Men Hair BarberShop - Premium Barber Services',
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Modern Men Hair BarberShop | Premium Barber Services',
    description: 'Regina\'s premier men\'s grooming destination with expert stylists and premium services.',
    images: ['https://www.modernmen.ca/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.modernmen.ca',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function Home() {
  return (
    <Providers>
      <main className="min-h-screen">
        <BarberHeader />
        <HeroSection />
        <AboutUs />
        <ServiceCard />
        <PricingTable />
        <BarberGallery />
        <BarberTestimonial />
        <AppointmentForm />
        <FAQAccordion />
        <BarberFooter />
      </main>
    </Providers>
  )
}
