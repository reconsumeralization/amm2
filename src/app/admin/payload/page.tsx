// src/app/admin/payload/page.tsx
'use client' // Add this line

// Metadata cannot be exported from a client component, so this will be moved
// export const metadata: Metadata = {
//   title: 'Payload CMS Dashboard - Modern Men Hair BarberShop',
//   description: 'Manage BarberShop data and content through Payload CMS integration',
// }

import { PayloadDashboard } from '@/components/features/admin/PayloadDashboard'
import { DocumentationProvider } from '@/contexts/DocumentationContext' // Import DocumentationProvider

export default function PayloadDashboardPage() {
  return (
    <DocumentationProvider> {/* Wrap with DocumentationProvider */}
      <PayloadDashboard />
    </DocumentationProvider>
  )
}
