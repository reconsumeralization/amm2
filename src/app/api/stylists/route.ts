import { NextRequest, NextResponse } from 'next/server'

// Sample data generators
function generateSampleTestimonials(stylistName: string) {
  const sampleClients = [
    { name: 'Sarah Johnson', service: 'Hair Cut & Style', rating: 5 },
    { name: 'Mike Chen', service: 'Beard Trim', rating: 5 },
    { name: 'Emma Davis', service: 'Color Treatment', rating: 4.5 },
    { name: 'David Wilson', service: 'Full Service', rating: 5 },
  ]

  const sampleReviews = [
    `Amazing experience with ${stylistName}! The attention to detail was incredible.`,
    `${stylistName} is incredibly talented. My hair has never looked better!`,
    `Professional, friendly, and extremely skilled. Highly recommend ${stylistName}!`,
    `Best haircut I've ever had. ${stylistName} really knows what they're doing.`,
    `Outstanding service! ${stylistName} made me feel comfortable throughout the entire process.`
  ]

  return sampleClients.map((client, index) => ({
    id: `testimonial-${index}`,
    clientName: client.name,
    clientImage: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80`,
    service: client.service,
    rating: client.rating,
    review: sampleReviews[index % sampleReviews.length],
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    verified: Math.random() > 0.3
  }))
}

function generateSampleInstagramPosts() {
  const samplePosts = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      caption: '✂ Fresh cut for our amazing client! #barber #haircut #modernmen',
      likes: Math.floor(Math.random() * 200) + 50,
      comments: Math.floor(Math.random() * 20) + 5,
      timestamp: '2h ago',
      link: '#'
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      caption: 'Classic fade with a modern twist ✨ #fadedhair #barberlife',
      likes: Math.floor(Math.random() * 150) + 30,
      comments: Math.floor(Math.random() * 15) + 3,
      timestamp: '5h ago',
      link: '#'
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      caption: 'Before and after transformation! 💀➡️✨ #hairtransformation #barbershop',
      likes: Math.floor(Math.random() * 300) + 100,
      comments: Math.floor(Math.random() * 25) + 10,
      timestamp: '1d ago',
      link: '#'
    }
  ]

  return samplePosts
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const featured = searchParams.get('featured') === 'true'
    const active = searchParams.get('active') !== 'false'

    // For now, always return sample data since Payload CMS is not configured
    const sampleStylists = [
      {
        id: 'sample-1',
        name: 'Alex Rodriguez',
        bio: 'Master barber with 8 years of experience specializing in modern fades and classic cuts.',
        profileImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        specializations: ['Fades', 'Classic Cuts', 'Beard Trims'],
        experience: 8,
        performance: { rating: 4.9, totalAppointments: 1250 },
        socialMedia: { instagram: '@alexrodriguez', facebook: 'alexrodriguezbarber' },
        featured: true,
        isActive: true,
        portfolio: [],
        testimonials: generateSampleTestimonials('Alex Rodriguez'),
        instagramPosts: generateSampleInstagramPosts(),
      },
      {
        id: 'sample-2',
        name: 'Marcus Johnson',
        bio: 'Creative stylist known for contemporary styles and color treatments.',
        profileImage: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        specializations: ['Contemporary Styles', 'Color Treatments', 'Styling'],
        experience: 6,
        performance: { rating: 4.8, totalAppointments: 980 },
        socialMedia: { instagram: '@marcusjohnson', facebook: 'marcusjohnsonstylist' },
        featured: true,
        isActive: true,
        portfolio: [],
        testimonials: generateSampleTestimonials('Marcus Johnson'),
        instagramPosts: generateSampleInstagramPosts(),
      },
      {
        id: 'sample-3',
        name: 'Sarah Chen',
        bio: 'Expert colorist and stylist with 5 years of experience in modern hair trends.',
        profileImage: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        specializations: ['Hair Coloring', 'Styling', 'Consultations'],
        experience: 5,
        performance: { rating: 4.7, totalAppointments: 750 },
        socialMedia: { instagram: '@sarahchen', facebook: 'sarahchenstylist' },
        featured: true,
        isActive: true,
        portfolio: [],
        testimonials: generateSampleTestimonials('Sarah Chen'),
        instagramPosts: generateSampleInstagramPosts(),
      },
    ]

    // Filter based on parameters
    let filteredStylists = sampleStylists

    if (featured) {
      filteredStylists = sampleStylists.filter(stylist => stylist.featured)
    }

    if (active !== undefined) {
      filteredStylists = filteredStylists.filter(stylist => stylist.isActive === active)
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedStylists = filteredStylists.slice(startIndex, endIndex)

    return NextResponse.json({
      stylists: paginatedStylists,
      total: filteredStylists.length,
      page: page,
      totalPages: Math.ceil(filteredStylists.length / limit),
      hasNext: endIndex < filteredStylists.length,
      hasPrev: page > 1,
    })

  } catch (error) {
    console.error('Stylists API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch stylists',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
