import { Metadata } from 'next'
import { redirect } from 'next/navigation' // Next.js 14+ redirect
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Client Portal - ModernMen BarberShop',
  description: 'Access your client portal to book appointments, manage your profile, and view services at ModernMen BarberShop.',
  keywords: ['client portal', 'appointments', 'booking', 'profile', 'services'],
}

interface PortalLayoutProps {
  children: React.ReactNode
}

export default async function PortalLayout({ children }: PortalLayoutProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin?callbackUrl=/portal')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">ModernMen Portal</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {(session as any)?.user?.name || (session as any)?.user?.email}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {(session as any)?.user?.role}
              </span>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
