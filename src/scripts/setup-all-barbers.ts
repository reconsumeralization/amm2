#!/usr/bin/env tsx
// Comprehensive setup script for all barbers (1 male + 3 female)

import { getPayload } from 'payload'
import config from '../payload.config'
import type { Location, Media, User, Stylist } from '../payload-types'
import path from 'path'
import fs from 'fs/promises'

interface BarberProfile {
  name: string
  email: string
  bio: string
  imageFile: string
  specialties: string[]
  experience: number
  certifications: string[]
  primaryLocation: string
  availableLocations: string[]
  schedule: { [key: string]: { start: string; end: string; available: boolean } }
  socialMedia: { instagram?: string; facebook?: string }
  personality: string
  clientFocus: string[]
}

const ALL_BARBERS: BarberProfile[] = [
  // Hicham Mellouli (Male Barber)
  {
    name: 'Hicham Mellouli',
    email: 'hicham.mellouli@modernmen.com',
    bio: 'My journey in this industry began at the age of 19, when I started my apprenticeship under the guidance of Master Barber Zbi. I\'ve always been drawn to the creative and social aspects of barbering, and I feel fortunate to have found a career that aligns with my strengths and interests. Throughout my career, I\'ve had the opportunity to build strong relationships with my clients, and I take pride in making a positive impact on their lives through my work. For me, it\'s not just about giving great haircuts – it\'s about being a trusted friend and confidant, and providing a welcoming space for people to relax and connect. I believe that a great barbershop is more than just a place to get a haircut – it\'s a gathering place where people can come together, share stories, and catch up with friends. I\'m excited to continue serving the Regina community and providing top-notch service to both longtime regulars and new clients alike. Whether you\'re looking for a fresh cut or just a friendly conversation, I\'m here to listen and help.',
    imageFile: 'malebarber.png',
    specialties: ['Precision Fades', 'Beard Sculpting', 'Modern Cuts', 'Hot Towel Shaves', 'Classic Cuts', 'Consultation'],
    experience: 10, // Started at 19, assuming he\'s around 29 now
    certifications: ['Master Barber Certification (under Zbi)', 'Advanced Cutting Techniques', 'Customer Relations Specialist'],
    primaryLocation: 'Downtown Regina',
    availableLocations: ['Downtown Regina', 'Northgate Mall', 'Westside Plaza'],
    schedule: {
      monday: { start: '09:00', end: '18:00', available: true },
      tuesday: { start: '09:00', end: '18:00', available: true },
      wednesday: { start: '09:00', end: '18:00', available: true },
      thursday: { start: '09:00', end: '19:00', available: true },
      friday: { start: '09:00', end: '20:00', available: true },
      saturday: { start: '08:00', end: '17:00', available: true },
      sunday: { start: '10:00', end: '16:00', available: true }
    },
    socialMedia: { instagram: '@hicham_cuts_regina', facebook: 'HichamMellouliBarber' },
    personality: 'Friendly, social, and relationship-focused',
    clientFocus: ['Community members', 'Regular clients', 'People seeking conversation', 'All ages welcome']
  },
  
  // Sarah Mitchell (Female Barber 1 - Blonde with bangs)
  {
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@modernmen.com',
    bio: 'Creative stylist with 6 years of experience specializing in trendy cuts, color work, and styling. Expert in both men\'s and women\'s cuts with a passion for creating bold, contemporary looks.',
    imageFile: 'femalebarber.png',
    specialties: ['Trendy Cuts', 'Color & Highlights', 'Texture Styling', 'Creative Designs'],
    experience: 6,
    certifications: ['Advanced Color Certification', 'Creative Cutting Specialist', 'Texture Expert'],
    primaryLocation: 'Northgate Mall',
    availableLocations: ['Northgate Mall', 'Downtown Regina'],
    schedule: {
      monday: { start: '10:00', end: '19:00', available: true },
      tuesday: { start: '10:00', end: '19:00', available: true },
      wednesday: { start: '10:00', end: '19:00', available: true },
      thursday: { start: '10:00', end: '20:00', available: true },
      friday: { start: '10:00', end: '21:00', available: true },
      saturday: { start: '09:00', end: '18:00', available: true },
      sunday: { start: '11:00', end: '17:00', available: true }
    },
    socialMedia: { instagram: '@sarah_styles_yqr', facebook: 'SarahMitchellStylist' },
    personality: 'Creative and trend-focused',
    clientFocus: ['Young professionals', 'Fashion-forward clients', 'Color enthusiasts']
  },
  
  // Emma Thompson (Female Barber 2 - Longer blonde hair)
  {
    name: 'Emma Thompson',
    email: 'emma.thompson@modernmen.com',
    bio: 'Senior stylist with 10 years of experience specializing in classic cuts, bridal styling, and special occasion looks. Known for her gentle approach and expertise in both traditional and contemporary techniques.',
    imageFile: 'femalebarber2.png',
    specialties: ['Classic Cuts', 'Bridal Styling', 'Special Occasions', 'Gentle Cuts'],
    experience: 10,
    certifications: ['Senior Stylist Certification', 'Bridal Specialist', 'Classic Techniques Master'],
    primaryLocation: 'Westside Plaza',
    availableLocations: ['Westside Plaza', 'Downtown Regina'],
    schedule: {
      monday: { start: '08:00', end: '17:00', available: true },
      tuesday: { start: '08:00', end: '17:00', available: true },
      wednesday: { start: '08:00', end: '17:00', available: true },
      thursday: { start: '08:00', end: '18:00', available: true },
      friday: { start: '08:00', end: '18:00', available: true },
      saturday: { start: '07:00', end: '16:00', available: true },
      sunday: { start: 'closed', end: 'closed', available: false }
    },
    socialMedia: { instagram: '@emma_classic_cuts', facebook: 'EmmaThompsonStylist' },
    personality: 'Gentle and experienced',
    clientFocus: ['Mature clients', 'Bridal parties', 'Classic style lovers']
  },
  
  // Zoe Chen (Female Barber 3 - Different style)
  {
    name: 'Zoe Chen',
    email: 'zoe.chen@modernmen.com',
    bio: 'Innovative stylist with 5 years of experience specializing in edgy cuts, avant-garde styling, and precision work. Passionate about pushing creative boundaries while maintaining technical excellence.',
    imageFile: 'femalebarber3.png',
    specialties: ['Edgy Cuts', 'Avant-garde Styling', 'Precision Work', 'Creative Color'],
    experience: 5,
    certifications: ['Precision Cutting Expert', 'Creative Design Specialist', 'Advanced Styling Techniques'],
    primaryLocation: 'Downtown Regina',
    availableLocations: ['Downtown Regina', 'Northgate Mall', 'Westside Plaza'],
    schedule: {
      monday: { start: '11:00', end: '20:00', available: true },
      tuesday: { start: '11:00', end: '20:00', available: true },
      wednesday: { start: '11:00', end: '20:00', available: true },
      thursday: { start: '11:00', end: '21:00', available: true },
      friday: { start: '11:00', end: '21:00', available: true },
      saturday: { start: '10:00', end: '19:00', available: true },
      sunday: { start: '12:00', end: '18:00', available: true }
    },
    socialMedia: { instagram: '@zoe_edge_cuts', facebook: 'ZoeChenStylist' },
    personality: 'Creative and innovative',
    clientFocus: ['Creative individuals', 'Young adults', 'Artistic clients']
  }
]

const ENHANCED_SERVICES = [
  // Hicham\'s specialties
  { name: 'Precision Fades', description: 'Expert fade cuts with clean, sharp lines', price: 45, duration: 45, specialist: 'Hicham Mellouli' },
  { name: 'Beard Sculpting', description: 'Professional beard shaping and styling', price: 35, duration: 30, specialist: 'Hicham Mellouli' },
  { name: 'Modern Cuts', description: 'Contemporary haircut with premium styling', price: 55, duration: 60, specialist: 'Hicham Mellouli' },
  { name: 'Hot Towel Shaves', description: 'Luxurious traditional shave with hot towels', price: 40, duration: 40, specialist: 'Hicham Mellouli' },
  { name: 'Classic Cuts', description: 'Timeless traditional cuts', price: 50, duration: 50, specialist: 'Hicham Mellouli' },
  
  // Sarah\'s specialties
  { name: 'Trendy Cuts', description: 'Modern cuts with contemporary styling', price: 65, duration: 75, specialist: 'Sarah Mitchell' },
  { name: 'Color & Highlights', description: 'Professional color work and highlights', price: 85, duration: 120, specialist: 'Sarah Mitchell' },
  { name: 'Texture Styling', description: 'Specialized texture work and styling', price: 50, duration: 60, specialist: 'Sarah Mitchell' },
  { name: 'Creative Designs', description: 'Unique and artistic haircut designs', price: 70, duration: 80, specialist: 'Sarah Mitchell' },
  
  // Emma\'s specialties
  { name: 'Bridal Styling', description: 'Special occasion and bridal styling', price: 95, duration: 120, specialist: 'Emma Thompson' },
  { name: 'Special Occasions', description: 'Elegant styling for special events', price: 75, duration: 90, specialist: 'Emma Thompson' },
  { name: 'Gentle Cuts', description: 'Comfortable cuts with gentle approach', price: 45, duration: 50, specialist: 'Emma Thompson' },
  
  // Zoe\'s specialties
  { name: 'Edgy Cuts', description: 'Bold and innovative cutting techniques', price: 70, duration: 80, specialist: 'Zoe Chen' },
  { name: 'Avant-garde Styling', description: 'Cutting-edge artistic styling', price: 80, duration: 90, specialist: 'Zoe Chen' },
  { name: 'Precision Work', description: 'Meticulous precision cutting', price: 60, duration: 70, specialist: 'Zoe Chen' },
  { name: 'Creative Color', description: 'Artistic color applications and designs', price: 90, duration: 120, specialist: 'Zoe Chen' },
  
  // Universal services (all barbers)
  { name: 'Standard Cut', description: 'Basic haircut service', price: 35, duration: 30, specialist: 'All' },
  { name: 'Wash & Style', description: 'Hair wash and basic styling', price: 25, duration: 25, specialist: 'All' },
  { name: 'Consultation', description: 'Style consultation and recommendations', price: 15, duration: 15, specialist: 'All' }
]

async function setupAllBarbers() {
  console.log('🚀 Setting up ALL BARBERS (1 Male + 3 Female)...\n')

  try {
    const payload = await getPayload({ config })

    // Step 1: Setup main tenant
    console.log('1️⃣ Setting up main business tenant...')
    let tenant
    const existingTenant = await payload.find({
      collection: 'tenants',
      where: { name: { equals: 'Modern Men Hair BarberShop' } }
    })

    if (existingTenant.docs.length === 0) {
      tenant = await payload.create({
        collection: 'tenants',
        data: {
          name: 'Modern Men Hair BarberShop',
          email: 'admin@modernmen.com',
          status: 'active'
        }
      })
      console.log('   ✅ Created main tenant')
    } else {
      tenant = existingTenant.docs[0]
      console.log('   ✅ Using existing tenant')
    }

    // Step 2: Setup all locations
    console.log('\n2️⃣ Setting up locations...')
    const locations = [
      { name: 'Downtown Regina', address: '1875 Rose Street, Regina, SK S4P 3Z1', phone: '+1 (306) 555-0100' },
      { name: 'Northgate Mall', address: '9456 Rochdale Blvd, Regina, SK S4X 2P7', phone: '+1 (306) 555-0200' },
      { name: 'Westside Plaza', address: '3045 Dewdney Ave, Regina, SK S4T 0X6', phone: '+1 (306) 555-0300' }
    ]
    
    const locationIds: string[] = []
    for (const locationData of locations) {
      const locationResult = await payload.find({
        collection: 'locations',
        where: { name: { equals: locationData.name } }
      })
      
      let locationDoc: Location
      if (locationResult.docs.length === 0) {
        locationDoc = await payload.create({
          collection: 'locations',
          data: {
            name: locationData.name,
            address: locationData.address,
            tenant: tenant.id as any as any
          }
        })
        console.log(`   ✅ Created: ${locationData.name}`)
      } else {
        locationDoc = locationResult.docs[0]
        console.log(`   ✅ Found: ${locationData.name}`)
      }
      locationIds.push(locationDoc.id.toString())
    }

    // Step 3: Upload all barber images
    console.log('\n3️⃣ Uploading barber images...')
    const mediaIds: Record<string, string> = {}
    
    for (const barber of ALL_BARBERS) {
      const imagePath = path.resolve(__dirname, '../public', barber.imageFile)
      const seoFilename = `${barber.name.toLowerCase().replace(/\s+/g, '-')}-modern-men-barber.png`

      const mediaResult = await payload.find({
        collection: 'media',
        where: { filename: { equals: seoFilename } }
      })
      
      let mediaDoc: Media
      if (mediaResult.docs.length === 0) {
        mediaDoc = await payload.create({
          collection: 'media',
          data: {
            alt: `Professional headshot of ${barber.name}, a talented barber at Modern Men.`,
            caption: `${barber.name} - Professional Stylist at Modern Men`
          },
          filePath: imagePath
        })
        console.log(`   ✅ Uploaded image for: ${barber.name}`)
      } else {
        mediaDoc = mediaResult.docs[0]
        console.log(`   ✅ Found existing image for: ${barber.name}`)
      }
      mediaIds[barber.name] = mediaDoc.id.toString()
    }

    // Step 4: Create all services
    console.log('\n4️⃣ Setting up services...')
    const serviceIds: Record<string, string> = {}
    
    for (const service of ENHANCED_SERVICES) {
      let existingService = await payload.find({
        collection: 'services',
        where: { name: { equals: service.name } } as any
      })
      
      if (existingService.docs.length === 0) {
        const newService = await payload.create({
          collection: 'services',
          data: {
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration
          }
        })
        serviceIds[service.name] = newService.id.toString()
        console.log(`   ✅ Created: ${service.name} (${service.price})`)
      } else {
        serviceIds[service.name] = existingService.docs[0].id.toString()
        console.log(`   ✅ Found: ${service.name}`)
      }
    }

    // Step 5: Create user accounts for all barbers
    console.log('\n5️⃣ Creating barber user accounts...')
    const userIds: Record<string, string> = {}
    
    for (const barber of ALL_BARBERS) {
      const userResult = await payload.find({
        collection: 'users',
        where: { email: { equals: barber.email } } as any
      })
      
      let userDoc: User
      if (userResult.docs.length === 0) {
        userDoc = await payload.create({
          collection: 'users',
          data: {
            name: barber.name,
            email: barber.email,
            role: 'barber',
            tenant: tenant.id as any as any,
            password: 'ModernMen2024!' // Should be changed on first login
          }
        })
        console.log(`   ✅ Created user: ${barber.name}`)
      } else {
        userDoc = userResult.docs[0]
        console.log(`   ✅ Found user: ${barber.name}`)
      }
      userIds[barber.name] = userDoc.id.toString()
    }

    // Step 6: Create stylist profiles
    console.log('\n6️⃣ Creating stylist profiles...')
    const stylistIds: Record<string, string> = {}
    
    for (const barber of ALL_BARBERS) {
      // Get service IDs for this barber\'s specialties
      const barberServiceIds = barber.specialties
        .map(specialty => serviceIds[specialty])
        .filter(Boolean)
      
      // Get location IDs for this barber
      const barberLocationIds = barber.availableLocations
        .map(locationName => {
          const locationIndex = locations.findIndex(loc => loc.name === locationName)
          return locationIndex !== -1 ? locationIds[locationIndex] : null
        })
        .filter(Boolean) as string[]

      const stylistResult = await payload.find({
        collection: 'stylists',
        where: { user: { equals: userIds[barber.name] as any as string } } as any
      })
      
      const stylistData = {
        user: userIds[barber.name] as any,
        name: barber.name,
        email: barber.email,
        bio: barber.bio,
        profileImage: mediaIds[barber.name],
        specializations: barberServiceIds,
        isActive: true,
        rating: (4.5 + (Math.random() * 0.5)).toString(), // Random rating between 4.5-5.0
        reviewCount: (Math.floor(Math.random() * 100) + 50).toString(), // Random reviews 50-150
        locations: barberLocationIds
      }
      
      let stylistDoc: Stylist
      if (stylistResult.docs.length === 0) {
        stylistDoc = await payload.create({
          collection: 'stylists',
          data: stylistData as any
        })
        console.log(`   ✅ Created stylist profile: ${barber.name}`)
      } else {
        stylistDoc = await payload.update({
          collection: 'stylists',
          id: stylistResult.docs[0].id as any as string,
          data: stylistData as any
        })
        console.log(`   ✅ Updated stylist profile: ${barber.name}`)
      }
      stylistIds[barber.name] = stylistDoc.id.toString()
    }

    // Step 7: Display comprehensive summary
    console.log('\n🎉 ALL BARBERS SETUP COMPLETE! 🎉')
    console.log('\n📊 TEAM SUMMARY:')
    console.log(`👥 Total Barbers: ${ALL_BARBERS.length}`)
    console.log(`🏢 Locations: ${locations.length}`)
    console.log(`✂️ Total Services: ${ENHANCED_SERVICES.length}`)
    
    console.log('\n👨‍💼👩‍💼 BARBER TEAM:')
    ALL_BARBERS.forEach((barber, index) => {
      console.log(`\n${index + 1}. ${barber.name} (${barber.experience} years)`)
      console.log(`   📧 ${barber.email}`)
      console.log(`   🏢 Primary: ${barber.primaryLocation}`)
      console.log(`   📍 Available at: ${barber.availableLocations.join(', ')}`)
      console.log(`   ✂️ Specialties: ${barber.specialties.join(', ')}`)
      console.log(`   🎯 Focus: ${barber.clientFocus.join(', ')}`)
      console.log(`   📱 Instagram: ${barber.socialMedia.instagram || 'Not set'}`)
    })

    console.log('\n🏢 LOCATION COVERAGE:')
    locations.forEach((location, index) => {
      const barbersAtLocation = ALL_BARBERS.filter(barber => 
        barber.availableLocations.includes(location.name)
      )
      console.log(`\n${index + 1}. ${location.name}`)
      console.log(`   📍 ${location.address}`)
      console.log(`   📞 ${location.phone}`)
      console.log(`   👥 Barbers: ${barbersAtLocation.map(b => b.name).join(', ')}`)
      console.log(`   ✂️ Services: ${barbersAtLocation.flatMap(b => b.specialties).length} total`)
    })

    console.log('\n🎯 ADMIN ACCESS:')
    console.log('   🌐 Admin Panel: http://localhost:3000/admin')
    console.log('   📊 Stylists Page: http://localhost:3000/admin/stylists')
    console.log('   🔑 Default Password: ModernMen2024! (change on first login)')
    
    console.log('\n📝 NEXT STEPS:')
    console.log('   1. Login to admin panel with each barber account')
    console.log('   2. Update passwords and personal preferences')
    console.log('   3. Add portfolio images for each barber')
    console.log('   4. Configure specific availability per location')
    console.log('   5. Set up commission rates and payment preferences')
    console.log('   6. Test booking flow for each barber/location combination')
    console.log('   7. Add customer reviews and testimonials')
        // End of Selection
    console.log('   8. Configure appointment preferences and booking rules')

    return {
      tenant,
      locations: locationIds,
      services: Object.values(serviceIds),
      barbers: Object.values(stylistIds),
      users: Object.values(userIds),
      media: Object.values(mediaIds)
    }

  } catch (error) {
    console.error('❌ Error during barber setup:', error)
    throw error
  }
}

// Export for use in other scripts
export { setupAllBarbers, ALL_BARBERS, ENHANCED_SERVICES }

// Run if called directly
if (require.main === module) {
  setupAllBarbers()
    .then(() => {
      console.log('\n✅ All barbers setup completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error)
      process.exit(1)
    })
}
