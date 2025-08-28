// src/app/admin/payload/page.tsx
'use client' // Add this line

// Metadata cannot be exported from a client component, so this will be moved
// export const metadata: Metadata = {
//   title: 'Payload CMS Dashboard - Modern Men Hair Salon',
//   description: 'Manage salon data and content through Payload CMS integration',
// }

import { PayloadDashboard } from '@/components/admin/PayloadDashboard'
import { DocumentationProvider } from '@/contexts/DocumentationContext' // Import DocumentationProvider

export default function PayloadDashboardPage() {
  return (
    <DocumentationProvider> {/* Wrap with DocumentationProvider */}
      <PayloadDashboard />
    </DocumentationProvider>
  )
}