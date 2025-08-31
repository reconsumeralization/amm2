import { Metadata } from 'next'
import { BarberHeader } from '@/components/features/barber/Header'
import { Footer as BarberFooter } from '@/components/features/barber/Footer'
import TeamPage from '@/components/TeamPage'
import { unstable_noStore as noStore } from 'next/cache'

export const metadata: Metadata = {
  title: 'Meet Our Team | Modern Men Hair BarberShop',
  description: 'Meet the expert stylists and barbers at Modern Men Hair BarberShop. Our experienced team provides premium grooming services in Regina.',
  keywords: ['barbers', 'stylists', 'team', 'expert barbers', 'Regina stylists', 'hair BarberShop team'],
  openGraph: {
    title: 'Meet Our Team | Modern Men Hair BarberShop',
    description: 'Meet the expert stylists and barbers at Modern Men Hair BarberShop in Regina.',
    url: 'https://www.modernmen.ca/team',
    siteName: 'Modern Men Hair BarberShop',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meet Our Team | Modern Men Hair BarberShop',
    description: 'Meet the expert stylists and barbers at Modern Men Hair BarberShop in Regina.',
  },
}

async function fetchTeam() {
  noStore()
  try {
    const baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/stylists?where[status][equals]=active`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return json.docs?.map((stylist: any) => ({
      id: stylist.id,
      name: stylist.name,
      role: stylist.role || stylist.title,
      specialty: stylist.specialty,
      bio: stylist.bio,
      image: stylist.profileImage?.url || stylist.image?.url,
    })) || []
  } catch {
    return null
  }
}

export default async function Team() {
  const stylists = await fetchTeam()
  return (
    <>
      <BarberHeader />
      <main className="section-premium">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-8">Meet Our Team</h1>
          <TeamPage stylists={stylists} />
        </div>
      </main>
      <BarberFooter />
    </>
  )
}
