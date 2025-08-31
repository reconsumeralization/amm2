import { getPayloadClient } from '@/payload'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

async function seedAdmin() {
  try {
    // Get admin credentials from environment or generate secure ones
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@modernmen.ca'
    let adminPassword = process.env.ADMIN_PASSWORD

    // Generate secure password if not provided
    if (!adminPassword) {
      adminPassword = randomBytes(16).toString('hex')
      console.log('⚠️  IMPORTANT: Generated admin password (save this securely):')
      console.log(`Password: ${adminPassword}`)
      console.log('')
    }

    const payload = await getPayloadClient()
    
    // Check if admin user already exists
    const existingAdmin = await payload.find({
      collection: 'users' as any as any,
      where: {
        email: { equals: adminEmail }
      }
    })

    if (existingAdmin.docs.length > 0) {
      console.log('✅ Admin user already exists')
      return
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Create admin user
    const adminUser = await payload.create({
      collection: 'users' as any as any,
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        status: 'active',
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log(`Email: ${adminUser.email}`)
    
    if (!process.env.ADMIN_PASSWORD) {
      console.log('')
      console.log('🔐 Set ADMIN_PASSWORD environment variable to use a custom password')
      console.log('🔐 Set ADMIN_EMAIL environment variable to use a custom email')
    }
    
  } catch (error) {
    console.error('❌ Error seeding admin user:', error)
  } finally {
    process.exit(0)
  }
}

seedAdmin()
