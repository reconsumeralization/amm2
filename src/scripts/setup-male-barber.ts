// Setup script for male barber across locations
import { getPayload } from 'payload'
import config from '../payload.config'

interface BarberSetupData {
  name: string
  email: string
  bio: string
  specialties: string[]
  experience: number
  certifications: string[]
  locations: string[]
}

const maleBarberData: BarberSetupData = {
  name: 'Marcus Rodriguez',
  email: 'marcus.rodriguez@modernmen.com',
  bio: 'Professional barber with over 8 years of experience specializing in modern cuts, fades, and beard grooming. Passionate about creating personalized styles that enhance each client\'s unique features.',
  specialties: [
    'Precision Fades',
    'Beard Sculpting', 
    'Modern Cuts',
    'Classic Styles',
    'Hot Towel Shaves',
    'Hair Styling'
  ],
  experience: 8,
  certifications: [
    'Master Barber Certification',
    'Beard Specialist Certificate',
    'Advanced Cutting Techniques'
  ],
  locations: [
    'Downtown Location',
    'Northside Branch',
    'Westside Studio'
  ]
}

async function setupMaleBarber() {
  console.log('🚀 Starting male barber setup...')
  
  try {
    const payload = await getPayload({ config })
    
    // Step 1: Create/find tenant (main business)
    console.log('📍 Setting up tenant...')
    let tenant = await payload.find({
      collection: 'tenants',
      where: { name: { equals: 'Modern Men Hair BarberShop' } }
    })
    
    if (tenant.docs.length === 0) {
      tenant = await payload.create({
        collection: 'tenants',
        data: {
          name: 'Modern Men Hair BarberShop',
          email: 'admin@modernmen.com',
          status: 'active'
        }
      })
      console.log('✅ Created tenant:', tenant.name)
    } else {
      tenant = tenant.docs[0]
      console.log('✅ Found existing tenant:', tenant.name)
    }

    // Step 2: Upload the barber image to media collection
    console.log('📸 Uploading barber image...')
    const mediaUpload = await payload.create({
      collection: 'media',
      data: {
        alt: `Professional headshot of ${maleBarberData.name}`,
        caption: `${maleBarberData.name} - Professional Barber`
      },
      filePath: './public/media/malebarber.png'
    })
    console.log('✅ Uploaded barber image:', mediaUpload.filename)

    // Step 3: Create user account for the barber
    console.log('👤 Creating barber user account...')
    let barberUser = await payload.find({
      collection: 'users',
      where: { email: { equals: maleBarberData.email } }
    })
    
    if (barberUser.docs.length === 0) {
      barberUser = await payload.create({
        collection: 'users',
        data: {
          name: maleBarberData.name,
          email: maleBarberData.email,
          role: 'barber',
          tenant: tenant.id,
          password: 'TempPassword123!' // Should be changed on first login
        }
      })
      console.log('✅ Created barber user:', barberUser.name)
    } else {
      barberUser = barberUser.docs[0]
      console.log('✅ Found existing barber user:', barberUser.name)
    }

    // Step 4: Create locations if they don't exist
    console.log('🏢 Setting up locations...')
    const locationIds = []
    
    for (const locationName of maleBarberData.locations) {
      let location = await payload.find({
        collection: 'locations',
        where: { 
          name: { equals: locationName },
          tenant: { equals: tenant.id }
        }
      })
      
      if (location.docs.length === 0) {
        location = await payload.create({
          collection: 'locations',
          data: {
            name: locationName,
            tenant: tenant.id,
            address: `123 Main St, ${locationName}, Regina, SK`,
            active: true,
            timezone: 'America/Regina'
          }
        })
        console.log(`✅ Created location: ${locationName}`)
      } else {
        location = location.docs[0]
        console.log(`✅ Found existing location: ${locationName}`)
      }
      
      locationIds.push(location.id)
    }

    // Step 5: Create services that the barber specializes in
    console.log('✂️ Setting up specialized services...')
    const serviceIds = []
    
    const serviceData = [
      { name: 'Precision Fade', description: 'Expert fade cuts with clean lines', price: 45, duration: 45 },
      { name: 'Beard Sculpting', description: 'Professional beard shaping and styling', price: 35, duration: 30 },
      { name: 'Modern Cut & Style', description: 'Contemporary haircut with styling', price: 55, duration: 60 },
      { name: 'Classic Gentleman\'s Cut', description: 'Timeless classic cuts', price: 50, duration: 50 },
      { name: 'Hot Towel Shave', description: 'Luxurious hot towel shave experience', price: 40, duration: 40 },
      { name: 'Complete Grooming Package', description: 'Full service cut, shave, and style', price: 85, duration: 90 }
    ]
    
    for (const service of serviceData) {
      let existingService = await payload.find({
        collection: 'services',
        where: { name: { equals: service.name } }
      })
      
      if (existingService.docs.length === 0) {
        const newService = await payload.create({
          collection: 'services',
          data: service
        })
        serviceIds.push(newService.id)
        console.log(`✅ Created service: ${service.name}`)
      } else {
        serviceIds.push(existingService.docs[0].id)
        console.log(`✅ Found existing service: ${service.name}`)
      }
    }

    // Step 6: Create stylist profile
    console.log('💼 Creating stylist profile...')
    let stylistProfile = await payload.find({
      collection: 'stylists',
      where: { user: { equals: barberUser.id } }
    })
    
    if (stylistProfile.docs.length === 0) {
      stylistProfile = await payload.create({
        collection: 'stylists',
        data: {
          user: barberUser.id,
          name: maleBarberData.name,
          bio: maleBarberData.bio,
          profileImage: mediaUpload.id,
          specializations: serviceIds,
          experience: {
            yearsExperience: maleBarberData.experience,
            certifications: maleBarberData.certifications.map(cert => ({ certification: cert })),
            previousbarbers: [
              {
                barberName: 'Elite Cuts Regina',
                position: 'Senior Barber',
                duration: '2019-2022'
              },
              {
                barberName: 'Gentleman\'s Choice',
                position: 'Lead Stylist', 
                duration: '2016-2019'
              }
            ]
          },
          availability: {
            monday: { start: '09:00', end: '18:00', available: true },
            tuesday: { start: '09:00', end: '18:00', available: true },
            wednesday: { start: '09:00', end: '18:00', available: true },
            thursday: { start: '09:00', end: '18:00', available: true },
            friday: { start: '09:00', end: '20:00', available: true },
            saturday: { start: '08:00', end: '17:00', available: true },
            sunday: { start: '10:00', end: '16:00', available: true }
          },
          locations: locationIds,
          isActive: true,
          rating: 4.8,
          reviewCount: 156,
          commission: {
            type: 'percentage',
            rate: 60, // 60% commission
            tier: 'senior'
          },
          socialMedia: {
            instagram: '@marcus_cuts_regina',
            facebook: 'MarcusBarberRegina'
          }
        }
      })
      console.log('✅ Created stylist profile:', stylistProfile.name)
    } else {
      // Update existing profile with new image
      stylistProfile = await payload.update({
        collection: 'stylists',
        id: stylistProfile.docs[0].id,
        data: {
          profileImage: mediaUpload.id,
          bio: maleBarberData.bio,
          specializations: serviceIds,
          locations: locationIds
        }
      })
      console.log('✅ Updated existing stylist profile:', stylistProfile.name)
    }

    // Step 7: Create sample portfolio entries
    console.log('🎨 Setting up portfolio...')
    const portfolioUpdates = {
      portfolio: [
        {
          image: mediaUpload.id,
          title: 'Precision Fade Showcase',
          description: 'Clean fade with textured top',
          service: serviceIds[0] // Precision Fade
        },
        {
          image: mediaUpload.id,
          title: 'Beard Sculpting Expertise',
          description: 'Professional beard shaping and grooming',
          service: serviceIds[1] // Beard Sculpting
        },
        {
          image: mediaUpload.id,
          title: 'Modern Gentleman Style',
          description: 'Contemporary cut with classic finish',
          service: serviceIds[2] // Modern Cut & Style
        }
      ]
    }

    await payload.update({
      collection: 'stylists',
      id: stylistProfile.id,
      data: portfolioUpdates
    })

    // Step 8: Create staff schedules for each location
    console.log('📅 Setting up schedules across locations...')
    for (const locationId of locationIds) {
      const existingSchedule = await payload.find({
        collection: 'staff-schedules',
        where: {
          staff: { equals: barberUser.id },
          location: { equals: locationId }
        }
      })
      
      if (existingSchedule.docs.length === 0) {
        await payload.create({
          collection: 'staff-schedules',
          data: {
            staff: barberUser.id,
            location: locationId,
            tenant: tenant.id,
            schedule: {
              monday: { start: '09:00', end: '18:00', available: true },
              tuesday: { start: '09:00', end: '18:00', available: true },
              wednesday: { start: '09:00', end: '18:00', available: true },
              thursday: { start: '09:00', end: '18:00', available: true },
              friday: { start: '09:00', end: '20:00', available: true },
              saturday: { start: '08:00', end: '17:00', available: true },
              sunday: { start: '10:00', end: '16:00', available: true }
            },
            isActive: true
          }
        })
        console.log(`✅ Created schedule for location: ${locationId}`)
      }
    }

    console.log('\n🎉 Male barber setup completed successfully!')
    console.log('\nSetup Summary:')
    console.log(`👤 Barber: ${maleBarberData.name}`)
    console.log(`📧 Email: ${maleBarberData.email}`)
    console.log(`🏢 Locations: ${maleBarberData.locations.length}`)
    console.log(`✂️ Specialties: ${maleBarberData.specialties.length}`)
    console.log(`⭐ Experience: ${maleBarberData.experience} years`)
    console.log('\n📝 Next Steps:')
    console.log('1. Login to admin panel with the barber credentials')
    console.log('2. Update the temporary password')
    console.log('3. Add more portfolio images')
    console.log('4. Configure specific availability preferences')
    console.log('5. Set up appointment booking preferences')

  } catch (error) {
    console.error('❌ Error setting up male barber:', error)
    throw error
  }
}

// Export the function for use in other scripts
export { setupMaleBarber, maleBarberData }

// Run if called directly
if (require.main === module) {
  setupMaleBarber()
    .then(() => {
      console.log('✅ Setup completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error)
      process.exit(1)
    })
}
