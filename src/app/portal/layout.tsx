import { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Client Portal - ModernMen BarberShop',
  description: 'Access your client portal to book appointments, manage your profile, and view services at ModernMen BarberShop.',
  keywords: ['client portal', 'appointments', 'booking', 'profile', 'services'],
}

/**
 * Props for the PortalLayout component.
 */
interface PortalLayoutProps {
  children: React.ReactNode
}

/**
 * Layout component for the client portal section.
 * Provides consistent navigation and footer for all portal pages.
 * @param {PortalLayoutProps} props - The layout props containing children.
 * @returns {JSX.Element} The rendered portal layout.
 */
export default function PortalLayout({
  children,
}: PortalLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
