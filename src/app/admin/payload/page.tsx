'use client'

import { PayloadDashboard } from '@/components/features/admin/PayloadDashboard'
import { DocumentationProvider } from '@/contexts/DocumentationContext'

export default function PayloadDashboardPage() {
  return (
    <DocumentationProvider>
      <PayloadDashboard />
    </DocumentationProvider>
  )
}