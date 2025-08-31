#!/usr/bin/env tsx
// Seed script to set up the male barber across locations

import { getPayload } from 'payload'
import config from '../payload.config'

const BARBER_DATA = {
  name: 'Marcus Rodriguez',
  email: 'marcus.rodriguez@modernmen.com',
  bio: 'Professional barber with over 8 years of experience specializing in modern cuts, fades, and beard grooming. Known for attention to detail and creating personalized styles that enhance each client\'s unique features.',
  phone: '+1 (306) 555-0123',
  experience: 8,
  rating: 4.8,
  reviewCount: 156
}

const LOCATIONS_DATA = [
  {
    name: 'Downtown Regina',
    address: '1875 Rose Street, Regina, SK S4P 3Z1',
    phone: '+1 (306) 555-0100',
    hours: {
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '20:00' },
      friday: { start: '09:00', end: '20:00' },
      saturday: { start: '08:00', end: '17:00' },
      sunday: { start: '10:00', end: '16:00' }
    }
  },
  {
    name: 'Northgate Mall',
    address: '9456 Rochdale Blvd, Regina, SK S4X 2P7',
    phone: '+1 (306) 555-0200',
    hours: {
      monday: { start: '10:00', end: '21:00' },
      tuesday: { start: '10:00', end: '21:00' },
      wednesday: { start: '10:00', end: '21:00' },
      thursday: { start: '10:00', end: '21:00' },
      friday: { start: '10:00', end: '21:00' },
      saturday: { start: '10:00', end: '18:00' },
      sunday: { start: '11:00', end: '17:00' }
    }
  },
  {
    name: 'Westside Plaza',
    address: '3045 Dewdney Ave, Regina, SK S4T 0X6',
    phone: '+1 (306) 555-0300',
    hours: {
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '19:00' },
      friday: { start: '09:00', end: '19:00' },
      saturday: { start: '08:00', end: '16:00' },
      sunday: { start: 'closed', end: 'closed' }
    }
  }
]

const SERVICES_DATA = [
  { name: 'Precision Fade', description: 'Expert fade cuts with clean, sharp lines', price: 45, duration: 45 },
  { name: 'Beard Sculpting', description: 'Professional beard shaping and styling', price: 35, duration: 30 },
  { name: 'Modern Cut & Style', description: 'Contemporary haircut with premium styling', price: 55, duration: 60 },
  { name: 'Classic Gentleman\'s Cut', description: 'Timeless traditional cuts', price: 50, duration: 50 },
  { name: 'Hot Towel Shave', description: 'Luxurious traditional shave with hot towels', price: 40, duration: 40 },
  { name: 'Complete Grooming', description: 'Full service: cut, shave, beard trim, and style', price: 85, duration: 90 }
]

async function seedMaleBarber() {
  console.log('🚀 Starting Male Barber Seed Process...\n')

  try {
    const payload = await getPayload({ config })

    // Step 1: Create main tenant
    console.log('1️⃣ Setting up main tenant...')
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
      console.log('   ✅ Created tenant:', tenant.name)
    } else {
      tenant = existingTenant.docs[0]
      console.log('   ✅ Using existing tenant:', tenant.name)
    }

    // Step 2: Upload barber image
    console.log('\n2️⃣ Setting up barber media...')
    let barberImage
    const existingImage = await payload.find({
      collection: 'media',
      where: { alt: { equals: `Professional headshot of ${BARBER_DATA.name}` } }
    })

    if (existingImage.docs.length === 0) {
      barberImage = await payload.create({
        collection: 'media',
        data: {
          alt: `Professional headshot of ${BARBER_DATA.name}`,
          caption: `${BARBER_DATA.name} - Professional Barber at Modern Men`
        }
      })
      console.log('   ✅ Created barber media entry')
    } else {
      barberImage = existingImage.docs[0]
      console.log('   ✅ Using existing barber image')
    }

    // Step 3: Create locations
    console.log('\n3️⃣ Setting up locations...')
    const locationIds: string[] = []

    for (const locationData of LOCATIONS_DATA) {
      let location
      const existingLocation = await payload.find({
        collection: 'locations',
        where: { 
          name: { equals: locationData.name },
          tenant: { equals: tenant.id }
        }
      })

      if (existingLocation.docs.length === 0) {
        location = await payload.create({
          collection: 'locations',
          data: {
            name: locationData.name,
            address: locationData.address,
            tenant: tenant.id,
            active: true,
            timezone: 'America/Regina'
          }
        })
        console.log(`   ✅ Created location: ${locationData.name}`)
      } else {
        location = existingLocation.docs[0]
        console.log(`   ✅ Using existing location: ${locationData.name}`)
      }
      
      locationIds.push(location.id)
    }

    // Step 4: Create services
    console.log('\n4️⃣ Setting up services...')
    const serviceIds: string[] = []

    for (const serviceData of SERVICES_DATA) {
      let service
      const existingService = await payload.find({
        collection: 'services',
        where: { name: { equals: serviceData.name } }
      })

      if (existingService.docs.length === 0) {
        service = await payload.create({
          collection: 'services',
          data: serviceData
        })
        console.log(`   ✅ Created service: ${serviceData.name} ($${serviceData.price})`)
      } else {
        service = existingService.docs[0]
        console.log(`   ✅ Using existing service: ${serviceData.name}`)
      }
      
      serviceIds.push(service.id)
    }

    // Step 5: Create barber user account
    console.log('\n5️⃣ Creating barber user account...')
    let barberUser
    const existingUser = await payload.find({
      collection: 'users',
      where: { email: { equals: BARBER_DATA.email } }
    })

    if (existingUser.docs.length === 0) {
      barberUser = await payload.create({
        collection: 'users',
        data: {
          name: BARBER_DATA.name,
          email: BARBER_DATA.email,
          role: 'barber',
          tenant: tenant.id,
          password: 'ModernMen2024!' // Should be changed on first login
        }
      })
      console.log(`   ✅ Created barber user: ${BARBER_DATA.name}`)
      console.log(`   🔑 Temporary password: ModernMen2024!`)
    } else {
      barberUser = existingUser.docs[0]
      console.log(`   ✅ Using existing barber user: ${BARBER_DATA.name}`)
    }

    // Step 6: Create stylist profile
    console.log('\n6️⃣ Setting up stylist profile...')
    let stylistProfile
    const existingStylist = await payload.find({
      collection: 'stylists',
      where: { user: { equals: barberUser.id } }
    })

    const stylistData = {
      user: barberUser.id,
      name: BARBER_DATA.name,
      bio: BARBER_DATA.bio,
      profileImage: barberImage.id,
      specializations: serviceIds,
      isActive: true,
      rating: BARBER_DATA.rating,
      reviewCount: BARBER_DATA.reviewCount,
      locations: locationIds
    }

    if (existingStylist.docs.length === 0) {
      stylistProfile = await payload.create({
        collection: 'stylists',
        data: stylistData
      })
      console.log('   ✅ Created stylist profile')
    } else {
      stylistProfile = await payload.update({
        collection: 'stylists',
        id: existingStylist.docs[0].id,
        data: stylistData
      })
      console.log('   ✅ Updated existing stylist profile')
    }

    // Step 7: Summary
    console.log('\n🎉 SETUP COMPLETE! 🎉')
    console.log('\n📊 Setup Summary:')
    console.log(`👤 Barber: ${BARBER_DATA.name}`)
    console.log(`📧 Email: ${BARBER_DATA.email}`)
    console.log(`🏢 Locations: ${LOCATIONS_DATA.length}`)
    console.log(`✂️ Services: ${SERVICES_DATA.length}`)
    console.log(`⭐ Rating: ${BARBER_DATA.rating}/5.0 (${BARBER_DATA.reviewCount} reviews)`)
    
    console.log('\n🏢 Location Details:')
    LOCATIONS_DATA.forEach((loc, index) => {
      console.log(`   ${index + 1}. ${loc.name}`)
      console.log(`      📍 ${loc.address}`)
      console.log(`      📞 ${loc.phone}`)
    })

    console.log('\n✂️ Service Offerings:')
    SERVICES_DATA.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.name} - $${service.price} (${service.duration}min)`)
    })

    console.log('\n📝 Admin Access:')
    console.log('   🌐 Admin Panel: http://localhost:3000/admin')
    console.log(`   👤 Barber Login: ${BARBER_DATA.email}`)
    console.log('   🔑 Password: ModernMen2024! (change on first login)')
    
    console.log('\n🎯 Next Steps:')
    console.log('   1. Login to admin panel and verify barber profile')
    console.log('   2. Add more portfolio images')
    console.log('   3. Configure specific availability per location')
    console.log('   4. Set up appointment booking preferences')
    console.log('   5. Test booking flow from customer perspective')

    return {
      tenant,
      barberUser,
      stylistProfile,
      locations: locationIds,
      services: serviceIds,
      image: barberImage
    }

  } catch (error) {
    console.error('❌ Error during setup:', error)
    throw error
  }
}

// Export for use in other scripts
export { seedMaleBarber, BARBER_DATA, LOCATIONS_DATA, SERVICES_DATA }

// Run if called directly
if (require.main === module) {
  seedMaleBarber()
    .then(() => {
      console.log('\n✅ Male barber setup completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error)
      process.exit(1)
    })
}
