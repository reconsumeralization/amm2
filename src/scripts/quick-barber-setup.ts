// Quick setup script for Marcus Rodriguez barber
// This script works with the current minimal PayloadCMS configuration

import path from 'path'

// Barber data that can be manually entered through the admin interface
const MARCUS_RODRIGUEZ_DATA = {
  // User Account Data
  user: {
    name: 'Marcus Rodriguez',
    email: 'marcus.rodriguez@modernmen.com',
    role: 'barber',
    password: 'ModernMen2024!' // Change on first login
  },
  
  // Tenant Data
  tenant: {
    name: 'Modern Men Hair BarberShop',
    email: 'admin@modernmen.com',
    status: 'active'
  },
  
  // Media Data
  media: {
    filename: 'malebarber.png',
    alt: 'Marcus Rodriguez - Professional Barber',
    caption: 'Marcus Rodriguez showcasing his professional barber skills',
    filepath: path.resolve(process.cwd(), 'public/media/malebarber.png')
  },
  
  // Location Data
  locations: [
    {
      name: 'Downtown Regina',
      address: '1875 Rose Street, Regina, SK S4P 3Z1',
      phone: '+1 (306) 555-0100',
      timezone: 'America/Regina'
    },
    {
      name: 'Northgate Mall',
      address: '9456 Rochdale Blvd, Regina, SK S4X 2P7', 
      phone: '+1 (306) 555-0200',
      timezone: 'America/Regina'
    },
    {
      name: 'Westside Plaza',
      address: '3045 Dewdney Ave, Regina, SK S4T 0X6',
      phone: '+1 (306) 555-0300', 
      timezone: 'America/Regina'
    }
  ],
  
  // Service Data
  services: [
    { name: 'Precision Fade', description: 'Expert fade cuts with clean, sharp lines', price: 45, duration: 45 },
    { name: 'Beard Sculpting', description: 'Professional beard shaping and styling', price: 35, duration: 30 },
    { name: 'Modern Cut & Style', description: 'Contemporary haircut with premium styling', price: 55, duration: 60 },
    { name: 'Classic Gentleman\'s Cut', description: 'Timeless traditional cuts', price: 50, duration: 50 },
    { name: 'Hot Towel Shave', description: 'Luxurious traditional shave with hot towels', price: 40, duration: 40 },
    { name: 'Complete Grooming', description: 'Full service: cut, shave, beard trim, and style', price: 85, duration: 90 }
  ],
  
  // Stylist Profile Data
  stylist: {
    bio: 'Professional barber with over 8 years of experience specializing in modern cuts, fades, and beard grooming. Known for attention to detail and creating personalized styles that enhance each client\'s unique features.',
    yearsExperience: 8,
    rating: 4.8,
    reviewCount: 156,
    certifications: [
      'Master Barber Certification',
      'Beard Specialist Certificate', 
      'Advanced Cutting Techniques'
    ],
    specialties: [
      'Precision Fades',
      'Beard Sculpting',
      'Modern Cuts', 
      'Classic Styles',
      'Hot Towel Shaves',
      'Hair Styling'
    ],
    socialMedia: {
      instagram: '@marcus_cuts_regina',
      facebook: 'MarcusBarberRegina'
    },
    availability: {
      monday: { start: '09:00', end: '18:00', available: true },
      tuesday: { start: '09:00', end: '18:00', available: true },
      wednesday: { start: '09:00', end: '18:00', available: true },
      thursday: { start: '09:00', end: '19:00', available: true },
      friday: { start: '09:00', end: '20:00', available: true },
      saturday: { start: '08:00', end: '17:00', available: true },
      sunday: { start: '10:00', end: '16:00', available: true }
    }
  }
}

// Instructions for manual setup
const SETUP_INSTRUCTIONS = `
🎯 MARCUS RODRIGUEZ BARBER SETUP INSTRUCTIONS

📋 Manual Setup Steps (via PayloadCMS Admin):

1️⃣ CREATE TENANT:
   - Go to Admin > Tenants > Add New
   - Name: "${MARCUS_RODRIGUEZ_DATA.tenant.name}"
   - Email: "${MARCUS_RODRIGUEZ_DATA.tenant.email}"
   - Status: "${MARCUS_RODRIGUEZ_DATA.tenant.status}"

2️⃣ UPLOAD MEDIA:
   - Go to Admin > Media > Add New
   - Upload: public/media/malebarber.png
   - Alt Text: "${MARCUS_RODRIGUEZ_DATA.media.alt}"
   - Caption: "${MARCUS_RODRIGUEZ_DATA.media.caption}"

3️⃣ CREATE USER ACCOUNT:
   - Go to Admin > Users > Add New
   - Name: "${MARCUS_RODRIGUEZ_DATA.user.name}"
   - Email: "${MARCUS_RODRIGUEZ_DATA.user.email}"
   - Role: "${MARCUS_RODRIGUEZ_DATA.user.role}"
   - Password: "${MARCUS_RODRIGUEZ_DATA.user.password}"
   - Tenant: Select the tenant created in step 1

4️⃣ CREATE LOCATIONS:
   ${MARCUS_RODRIGUEZ_DATA.locations.map((loc, i) => `
   Location ${i + 1}:
   - Name: "${loc.name}"
   - Address: "${loc.address}"
   - Phone: "${loc.phone}"
   - Timezone: "${loc.timezone}"
   - Tenant: Select the tenant from step 1`).join('\n')}

5️⃣ CREATE SERVICES:
   ${MARCUS_RODRIGUEZ_DATA.services.map((service, i) => `
   Service ${i + 1}:
   - Name: "${service.name}"
   - Description: "${service.description}"
   - Price: $${service.price}
   - Duration: ${service.duration} minutes`).join('\n')}

6️⃣ CREATE STYLIST PROFILE:
   - Go to Admin > Stylists > Add New
   - User: Select Marcus Rodriguez user
   - Bio: "${MARCUS_RODRIGUEZ_DATA.stylist.bio}"
   - Profile Image: Select uploaded image
   - Specializations: Select all created services
   - Locations: Select all created locations
   - Rating: ${MARCUS_RODRIGUEZ_DATA.stylist.rating}
   - Review Count: ${MARCUS_RODRIGUEZ_DATA.stylist.reviewCount}

🎯 VERIFICATION STEPS:

✅ Admin Panel Access:
   - URL: http://localhost:3000/admin
   - Login: ${MARCUS_RODRIGUEZ_DATA.user.email}
   - Password: ${MARCUS_RODRIGUEZ_DATA.user.password}

✅ Check Profile:
   - Navigate to Stylists collection
   - Verify Marcus Rodriguez profile
   - Confirm image is displayed
   - Check location assignments

✅ Test Booking Flow:
   - Visit: http://localhost:3000/admin/barbers
   - Verify barber appears in all locations
   - Test appointment booking functionality

📱 SOCIAL MEDIA INTEGRATION:
   - Instagram: ${MARCUS_RODRIGUEZ_DATA.stylist.socialMedia.instagram}
   - Facebook: ${MARCUS_RODRIGUEZ_DATA.stylist.socialMedia.facebook}

💡 ADDITIONAL FEATURES TO CONFIGURE:
   - Portfolio images (add more work samples)
   - Specific availability per location
   - Commission rates and payment settings
   - Customer review system integration
   - Appointment preferences and booking rules
`

console.log(SETUP_INSTRUCTIONS)

export { MARCUS_RODRIGUEZ_DATA, SETUP_INSTRUCTIONS }
