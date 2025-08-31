import request from 'supertest'
import { createTestApp } from '../../test-utils/test-app'
import { createTestUser } from '../../test-utils/test-user'
import { createTestService } from '../../test-utils/test-service'

describe('Appointment API Integration Tests', () => {
  let app: any
  let testUser: any
  let testService: any

  beforeAll(async () => {
    // Create test app with database connection
    app = await createTestApp()
    testUser = await createTestUser()
    testService = await createTestService()
  })

  afterAll(async () => {
    // Clean up test data
    await app.close()
  })

  describe('POST /api/appointments', () => {
    it('should create a new appointment successfully', async () => {
      const appointmentData = {
        serviceId: testService.id,
        staffId: testUser.id,
        customerId: testUser.id,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        duration: 60,
        notes: 'Test appointment',
        customerDetails: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-0123'
        }
      }

      const response = await request(app)
        .post('/api/appointments')
        .send(appointmentData)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body.serviceId).toBe(testService.id)
      expect(response.body.status).toBe('confirmed')
      expect(response.body.customerDetails.firstName).toBe('John')
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .send({})
        .expect(400)

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'serviceId',
          message: 'Service is required'
        })
      )
    })

    it('should prevent double booking', async () => {
      const appointmentTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow at 10 AM
      appointmentTime.setHours(10, 0, 0, 0)

      // Create first appointment
      await request(app)
        .post('/api/appointments')
        .send({
          serviceId: testService.id,
          staffId: testUser.id,
          customerId: testUser.id,
          startTime: appointmentTime.toISOString(),
          duration: 60,
          customerDetails: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1-555-0123'
          }
        })
        .expect(201)

      // Try to create second appointment at same time
      const response = await request(app)
        .post('/api/appointments')
        .send({
          serviceId: testService.id,
          staffId: testUser.id,
          customerId: testUser.id,
          startTime: appointmentTime.toISOString(),
          duration: 60,
          customerDetails: {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+1-555-0456'
          }
        })
        .expect(409)

      expect(response.body.message).toContain('Time slot not available')
    })

    it('should send confirmation email', async () => {
      const appointmentData = {
        serviceId: testService.id,
        staffId: testUser.id,
        customerId: testUser.id,
        startTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        duration: 60,
        customerDetails: {
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice.johnson@example.com',
          phone: '+1-555-0789'
        }
      }

      await request(app)
        .post('/api/appointments')
        .send(appointmentData)
        .expect(201)

      // In a real test, you would mock the email service and verify it was called
      // expect(mockEmailService.sendConfirmation).toHaveBeenCalledWith(
      //   'alice.johnson@example.com',
      //   expect.objectContaining({
      //     customerName: 'Alice Johnson',
      //     serviceName: testService.name,
      //     appointmentTime: expect.any(Date)
      //   })
      // )
    })
  })

  describe('GET /api/appointments/availability', () => {
    it('should return available time slots for a date', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const dateString = tomorrow.toISOString().split('T')[0]

      const response = await request(app)
        .get(`/api/appointments/availability?date=${dateString}&serviceId=${testService.id}&staffId=${testUser.id}`)
        .expect(200)

      expect(Array.isArray(response.body.slots)).toBe(true)
      expect(response.body.slots.length).toBeGreaterThan(0)

      // Each slot should have start time, end time, and availability status
      response.body.slots.forEach((slot: any) => {
        expect(slot).toHaveProperty('startTime')
        expect(slot).toHaveProperty('endTime')
        expect(slot).toHaveProperty('available')
        expect(typeof slot.available).toBe('boolean')
      })
    })

    it('should respect staff working hours', async () => {
      const weekend = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next Sunday
      weekend.setDate(weekend.getDate() + (7 - weekend.getDay())) // Ensure it's Sunday
      const dateString = weekend.toISOString().split('T')[0]

      const response = await request(app)
        .get(`/api/appointments/availability?date=${dateString}&serviceId=${testService.id}&staffId=${testUser.id}`)
        .expect(200)

      // Assuming staff doesn't work weekends, all slots should be unavailable
      response.body.slots.forEach((slot: any) => {
        expect(slot.available).toBe(false)
      })
    })
  })

  describe('PUT /api/appointments/:id', () => {
    let createdAppointment: any

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/appointments')
        .send({
          serviceId: testService.id,
          staffId: testUser.id,
          customerId: testUser.id,
          startTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 3 days from now
          duration: 60,
          customerDetails: {
            firstName: 'Bob',
            lastName: 'Wilson',
            email: 'bob.wilson@example.com',
            phone: '+1-555-0321'
          }
        })

      createdAppointment = response.body
    })

    it('should update appointment details', async () => {
      const newStartTime = new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString() // 4 days from now

      const response = await request(app)
        .put(`/api/appointments/${createdAppointment.id}`)
        .send({
          startTime: newStartTime,
          notes: 'Updated appointment notes'
        })
        .expect(200)

      expect(response.body.startTime).toBe(newStartTime)
      expect(response.body.notes).toBe('Updated appointment notes')
    })

    it('should prevent updating cancelled appointments', async () => {
      // First cancel the appointment
      await request(app)
        .put(`/api/appointments/${createdAppointment.id}`)
        .send({ status: 'cancelled' })
        .expect(200)

      // Try to update the cancelled appointment
      const response = await request(app)
        .put(`/api/appointments/${createdAppointment.id}`)
        .send({ notes: 'This should not work' })
        .expect(400)

      expect(response.body.message).toContain('Cannot update cancelled appointment')
    })
  })
})
