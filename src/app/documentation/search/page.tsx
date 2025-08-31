import { Metadata } from 'next'
import { DocumentationSearchPage } from '@/components/features/documentation/DocumentationSearchPage'

export const metadata: Metadata = {
  title: 'Search Documentation - ModernMen BarberShop',
  description: 'Search through our comprehensive documentation including guides, API references, and resources.',
  keywords: ['documentation', 'search', 'guides', 'API', 'references'],
}

/**
 * Props for the DocumentationSearchPageRoute component.
 */
interface DocumentationSearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    type?: string
  }>
}

/**
 * Server component for the documentation search page route.
 * @param {DocumentationSearchPageProps} props - The search params from the URL.
 * @returns {JSX.Element} The rendered documentation search page.
 */
export default async function DocumentationSearchPageRoute({ searchParams }: DocumentationSearchPageProps) {
  // Defensive: Ensure searchParams is defined and is an object
  const params = await searchParams
  const initialQuery = typeof params.q === 'string' ? params.q : ''
  const initialCategory = typeof params.category === 'string' ? params.category : ''
  const initialType = typeof params.type === 'string' ? params.type : ''

  return (
    <DocumentationSearchPage
      initialQuery={initialQuery}
      initialCategory={initialCategory}
      initialType={initialType}
      showFilters={true}
      compact={false}
    />
  )
}
