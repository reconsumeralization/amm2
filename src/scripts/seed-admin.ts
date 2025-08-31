import getPayloadClient from '../payload'

async function seedAdmin() {
  try {
    const payload = await getPayloadClient({ config: () => import('../payload.config').then(m => m.default) })
    
    // Check if admin user already exists
    const existingAdmin = await payload.find({
      collection: 'users',
      where: {
        email: { equals: 'admin@modernmen.ca' }
      }
    })

    if (existingAdmin.docs.length > 0) {
      console.log('Admin user already exists')
      return
    }

    // Create admin user
    const adminUser = await payload.create({
      collection: 'users',
      data: {
        email: 'admin@modernmen.ca',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
      }
    })

    console.log('Admin user created successfully:', adminUser.email)
    console.log('Login credentials:')
    console.log('Email: admin@modernmen.ca')
    console.log('Password: admin123')
    
  } catch (error) {
    console.error('Error seeding admin user:', error)
  } finally {
    process.exit(0)
  }
}

seedAdmin()
