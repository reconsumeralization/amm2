#!/usr/bin/env tsx
// Seeds remaining collections with sample data

import { getPayload } from 'payload'
import config from '../payload.config'
import { Customer, Appointment, Order, Contact } from '../payload-types'

async function seedRemainingCollections() {
  console.log('🌱 Seeding remaining collections...')

  const payload = await getPayload({ config })

  try {
    // Seed Customers
    console.log('\n👥 Seeding customers...')
    const customersData = [
      { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '555-1234' },
      { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '555-5678' },
    ]

    const customers: Customer[] = []
    for (const customerData of customersData) {
      const customer = await payload.create({
        collection: 'customers',
        data: customerData,
      })
      customers.push(customer)
      console.log(`   ✅ Created customer: ${customer.firstName} ${customer.lastName}`)
    }

    // Seed Appointments
    console.log('\n📅 Seeding appointments...')
    const stylists = await payload.find({ collection: 'stylists', limit: 2 })
    const services = await payload.find({ collection: 'services', limit: 2 })

    if (stylists.docs.length > 0 && services.docs.length > 0) {
      const appointmentsData = [
        {
          customer: customers[0].id,
          stylist: stylists.docs[0].id,
          service: services.docs[0].id,
          date: new Date(),
          status: 'scheduled',
        },
        {
          customer: customers[1].id,
          stylist: stylists.docs[1].id,
          service: services.docs[1].id,
          date: new Date(),
          status: 'completed',
        },
      ]

      for (const appointmentData of appointmentsData) {
        await payload.create({
          collection: 'appointments',
          data: appointmentData,
        })
        console.log(`   ✅ Created appointment.`) 
      }
    }

    // Seed Orders
    console.log('\n🛒 Seeding orders...')
    const products = await payload.find({ collection: 'products', limit: 2 })
    if (products.docs.length > 0) {
      const ordersData = [
        { customer: customers[0].id, total: products.docs[0].price, status: 'completed' },
        { customer: customers[1].id, total: products.docs[1].price, status: 'pending' },
      ]

      for (const orderData of ordersData) {
        await payload.create({ collection: 'orders', data: orderData })
        console.log(`   ✅ Created order.`) 
      }
    }

    // Seed Contacts
    console.log('\n✉️ Seeding contacts...')
    const contactsData = [
      { name: 'Mark', email: 'mark@example.com', message: 'Great service!' },
      { name: 'Sarah', email: 'sarah@example.com', message: 'I have a question about pricing.' },
    ]

    for (const contactData of contactsData) {
      await payload.create({ collection: 'contacts', data: contactData })
      console.log(`   ✅ Created contact: ${contactData.name}`)
    }

    console.log('\n🎉 Remaining collections seeded successfully!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedRemainingCollections()
  .then(() => {
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
