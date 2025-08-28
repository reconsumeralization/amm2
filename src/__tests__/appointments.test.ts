import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { Appointments } from '../collections/Appointments'

// Mock Payload
const mockPayload = {
  find: jest.fn(),
  findByID: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
}

const mockReq = {
  payload: mockPayload,
  user: {
    id: 'user-1',
    role: 'admin',
  },
}

describe('Appointments Collection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Configuration', () => {
    it('should have correct slug', () => {
      expect(Appointments.slug).toBe('appointments')
    })

    it('should have required fields', () => {
      const fieldNames = Appointments.fields.map(field => field.name)
      expect(fieldNames).toContain('customer')
      expect(fieldNames).toContain('stylist')
      expect(fieldNames).toContain('dateTime')
      expect(fieldNames).toContain('status')
    })

    it('should have proper admin configuration', () => {
      expect(Appointments.admin?.group).toBe('Appointments')
      expect(Appointments.admin?.defaultColumns).toContain('appointmentTitle')
    })
  })

  describe('Access Control', () => {
    it('should allow admin to read all appointments', () => {
      const result = Appointments.access?.read({ req: mockReq } as any)
      expect(result).toBe(true)
    })

    it('should allow authenticated users to create appointments', () => {
      const result = Appointments.access?.create({ req: mockReq } as any)
      expect(result).toBe(true)
    })

    it('should restrict customer access to their own appointments', () => {
      const customerReq = {
        ...mockReq,
        user: { id: 'customer-1', role: 'customer' }
      }
      const result = Appointments.access?.read({ req: customerReq } as any)
      expect(result).toEqual({
        customer: { equals: 'customer-1' }
      })
    })
  })

  describe('Hooks', () => {
    it('should calculate duration from services', async () => {
      const mockServices = [
        { id: 'service-1', duration: 30, bufferTime: 5 },
        { id: 'service-2', duration: 45, bufferTime: 10 }
      ]

      mockPayload.find.mockResolvedValue({ docs: mockServices })

      const data = {
        services: ['service-1', 'service-2'],
        dateTime: new Date('2024-01-15T10:00:00Z')
      }

      const beforeChangeHook = Appointments.hooks?.beforeChange?.[0]
      if (beforeChangeHook) {
        const result = await beforeChangeHook({ data, req: mockReq, operation: 'create' } as any)
        expect(result.duration).toBe(90) // 30 + 5 + 45 + 10
        expect(result.endTime).toBeInstanceOf(Date)
      }
    })

    it('should generate appointment title', async () => {
      const mockCustomer = {
        id: 'customer-1',
        firstName: 'John',
        lastName: 'Doe'
      }

      mockPayload.findByID.mockResolvedValue(mockCustomer)

      const data = {
        customer: 'customer-1',
        dateTime: new Date('2024-01-15T10:00:00Z')
      }

      const beforeChangeHook = Appointments.hooks?.beforeChange?.[0]
      if (beforeChangeHook) {
        const result = await beforeChangeHook({ data, req: mockReq, operation: 'create' } as any)
        expect(result.appointmentTitle).toContain('John Doe')
        expect(result.appointmentTitle).toContain('1/15/2024')
      }
    })

    it('should calculate pricing correctly', async () => {
      const mockServices = [
        { id: 'service-1', price: 2500 }, // $25.00
        { id: 'service-2', price: 3500 }  // $35.00
      ]

      mockPayload.find.mockResolvedValue({ docs: mockServices })

      const data = {
        services: ['service-1', 'service-2'],
        pricing: { discount: { amount: 500 } } // $5.00 discount
      }

      const beforeChangeHook = Appointments.hooks?.beforeChange?.[0]
      if (beforeChangeHook) {
        const result = await beforeChangeHook({ data, req: mockReq, operation: 'create' } as any)
        expect(result.pricing.subtotal).toBe(6000) // $60.00
        expect(result.pricing.tax).toBe(480) // 8% of $60.00
        expect(result.pricing.total).toBe(5980) // $60.00 + $4.80 - $5.00
      }
    })

    it('should prevent scheduling conflicts', async () => {
      const mockConflicts = {
        docs: [{
          id: 'conflict-1',
          dateTime: new Date('2024-01-15T10:30:00Z'),
          duration: 30
        }]
      }

      mockPayload.find.mockResolvedValue(mockConflicts)

      const data = {
        stylist: 'stylist-1',
        dateTime: new Date('2024-01-15T10:00:00Z'),
        duration: 60
      }

      const beforeChangeHook = Appointments.hooks?.beforeChange?.[0]
      if (beforeChangeHook) {
        await expect(
          beforeChangeHook({ data, req: mockReq, operation: 'create' } as any)
        ).rejects.toThrow('Stylist is not available at this time')
      }
    })
  })

  describe('Validation', () => {
    it('should require customer field', () => {
      const customerField = Appointments.fields.find(f => f.name === 'customer')
      expect(customerField?.required).toBe(true)
    })

    it('should require stylist field', () => {
      const stylistField = Appointments.fields.find(f => f.name === 'stylist')
      expect(stylistField?.required).toBe(true)
    })

    it('should require dateTime field', () => {
      const dateTimeField = Appointments.fields.find(f => f.name === 'dateTime')
      expect(dateTimeField?.required).toBe(true)
    })

    it('should have valid status options', () => {
      const statusField = Appointments.fields.find(f => f.name === 'status') as any
      const statusValues = statusField.options.map((opt: any) => opt.value)
      expect(statusValues).toContain('confirmed')
      expect(statusValues).toContain('pending')
      expect(statusValues).toContain('completed')
      expect(statusValues).toContain('cancelled')
    })
  })

  describe('Performance', () => {
    it('should have proper database indexes', () => {
      expect(Appointments.indexes).toBeDefined()
      expect(Appointments.indexes?.length).toBeGreaterThan(0)
      
      const indexNames = Appointments.indexes?.map(idx => idx.name)
      expect(indexNames).toContain('appointments_dateTime_status')
      expect(indexNames).toContain('appointments_stylist_dateTime')
    })

    it('should have pagination settings', () => {
      expect(Appointments.admin?.pagination).toBeDefined()
      expect(Appointments.admin?.pagination?.defaultLimit).toBe(25)
      expect(Appointments.admin?.pagination?.maxLimit).toBe(100)
    })
  })
})
