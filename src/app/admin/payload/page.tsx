'use client'

import { PayloadDashboard } from '@/components/admin/PayloadDashboard'
import { DocumentationProvider } from '@/contexts/DocumentationContext'

export default function PayloadDashboardPage() {
  return (
    <DocumentationProvider>
      <PayloadDashboard />
    </DocumentationProvider>
  )
}