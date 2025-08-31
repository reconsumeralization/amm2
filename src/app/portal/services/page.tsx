import { Metadata } from 'next'
import { ServicesPortalPage } from '@/components/features/portal/ServicesPortalPage'

export const metadata: Metadata = {
  title: 'Services - ModernMen BarberShop Portal',
  description: 'Browse and book our professional hair care and grooming services through your client portal.',
  keywords: ['services', 'haircut', 'styling', 'beard', 'grooming', 'booking'],
}

/**
 * Props for the ServicesPageRoute component.
 */
interface ServicesPageProps {
  searchParams: Promise<{
    category?: string
    service?: string
  }>
}

/**
 * Server component for the portal services page route.
 * @param {ServicesPageProps} props - The search params from the URL.
 * @returns {JSX.Element} The rendered services portal page.
 */
export default async function ServicesPageRoute({ searchParams }: ServicesPageProps) {
  // Defensive: Ensure searchParams is defined and is an object
  const params = await searchParams
  const initialCategory = typeof params.category === 'string' ? params.category : ''
  const initialService = typeof params.service === 'string' ? params.service : ''

  return (
    <ServicesPortalPage
      initialCategory={initialCategory}
      initialService={initialService}
    />
  )
}
