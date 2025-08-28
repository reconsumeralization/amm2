/**
 * Integration tests for Payload CMS integration
 */
import { PayloadIntegrationService } from '@/lib/payload-integration'

// Mock Payload
jest.mock('payload', () => ({
  getPayload: jest.fn(() => Promise.resolve({
    find: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  }))
}))

describe('Payload Integration', () => {
  let service: PayloadIntegrationService

  beforeEach(() => {
    service = new PayloadIntegrationService({
      enableCaching: true,
      cacheTimeout: 300000,
      enableAnalytics: true,
      enableNotifications: true
    })
  })

  describe('Service Initialization', () => {
    it('should initialize without errors', async () => {
      await expect(service.initialize()).resolves.not.toThrow()
    })

    it('should handle initialization errors gracefully', async () => {
      const mockService = new PayloadIntegrationService({
        enableCaching: false,
        cacheTimeout: 0,
        enableAnalytics: false,
        enableNotifications: false
      })

      // Mock getPayload to throw an error
      const { getPayload } = require('payload')
      getPayload.mockRejectedValueOnce(new Error('Connection failed'))

      await expect(mockService.initialize()).rejects.toThrow('Payload initialization failed')
    })
  })

  describe('User Synchronization', () => {
    it('should sync user data correctly', async () => {
      const mockSession = {
        user: {
          email: 'test@example.com',
          name: 'Test User'
        }
      }

      const mockPayload = {
        find: jest.fn().mockResolvedValue({ docs: [] }),
        create: jest.fn().mockResolvedValue({
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'salon_customer'
        })
      }

      // Mock the payload instance
      service['payload'] = mockPayload as any

      const result = await service.syncUserWithPayload(mockSession)

      expect(result).toBeTruthy()
      expect(result.email).toBe('test@example.com')
      expect(mockPayload.find).toHaveBeenCalled()
      expect(mockPayload.create).toHaveBeenCalled()
    })

    it('should update existing users', async () => {
      const mockSession = {
        user: {
          email: 'existing@example.com',
          name: 'Existing User'
        }
      }

      const existingUser = {
        id: 'user-1',
        email: 'existing@example.com',
        name: 'Old Name'
      }

      const mockPayload = {
        find: jest.fn().mockResolvedValue({ docs: [existingUser] }),
        update: jest.fn().mockResolvedValue({
          ...existingUser,
          name: 'Existing User',
          lastLogin: new Date()
        })
      }

      service['payload'] = mockPayload as any

      const result = await service.syncUserWithPayload(mockSession)

      expect(result).toBeTruthy()
      expect(mockPayload.find).toHaveBeenCalled()
      expect(mockPayload.update).toHaveBeenCalled()
    })
  })

  describe('Business Documentation', () => {
    it('should fetch documentation with role filtering', async () => {
      const mockDocs = [
        {
          id: 'doc-1',
          title: 'Test Doc',
          targetRole: 'salon_employee',
          status: 'published'
        }
      ]

      const mockPayload = {
        find: jest.fn().mockResolvedValue({
          docs: mockDocs,
          totalDocs: 1,
          page: 1,
          totalPages: 1
        })
      }

      service['payload'] = mockPayload as any

      const result = await service.getBusinessDocumentation('salon_employee')

      expect(result).toBeTruthy()
      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].title).toBe('Test Doc')
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'documentation',
          where: expect.objectContaining({
            and: expect.arrayContaining([
              { targetRole: { in: ['guest', 'salon_customer', 'salon_employee'] } },
              { status: { equals: 'published' } }
            ])
          })
        })
      )
    })

    it('should create documentation successfully', async () => {
      const mockDoc = {
        id: 'doc-1',
        title: 'New Doc',
        type: 'guide',
        status: 'draft'
      }

      const mockPayload = {
        create: jest.fn().mockResolvedValue(mockDoc)
      }

      service['payload'] = mockPayload as any

      const result = await service.createBusinessDocumentation({
        title: 'New Doc',
        type: 'guide',
        targetRole: 'salon_employee',
        category: 'salon-operations',
        content: 'Test content'
      }, 'user-1')

      expect(result).toBeTruthy()
      expect(result.title).toBe('New Doc')
      expect(mockPayload.create).toHaveBeenCalled()
    })
  })

  describe('Global rch', () => {
    it('should rch across multiple collections', async () => {
      const mockResults = {
        services: { docs: [{ id: 'service-1', name: 'Haircut' }] },
        customers: { docs: [{ id: 'customer-1', firstName: 'John' }] },
        documentation: { docs: [{ id: 'doc-1', title: 'Guide' }] }
      }

      const mockPayload = {
        find: jest.fn()
          .mockResolvedValueOnce(mockResults.services)
          .mockResolvedValueOnce(mockResults.customers)
          .mockResolvedValueOnce(mockResults.documentation)
      }

      service['payload'] = mockPayload as any

      const result = await service.globalrch('test', ['services', 'customers', 'documentation'])

      expect(result).toBeTruthy()
      expect(result.results).toHaveLength(3)
      expect(result.total).toBe(3)
      expect(mockPayload.find).toHaveBeenCalledTimes(3)
    })
  })

  describe('Analytics', () => {
    it('should fetch salon analytics', async () => {
      const mockCounts = {
        appointments: { totalDocs: 100 },
        customers: { totalDocs: 50 },
        services: { totalDocs: 10 }
      }

      const mockTopServices = { docs: [{ id: 'service-1', name: 'Haircut' }] }
      const mockTopStylists = { docs: [{ id: 'stylist-1', firstName: 'John' }] }

      const mockPayload = {
        count: jest.fn()
          .mockResolvedValueOnce(mockCounts.appointments)
          .mockResolvedValueOnce(mockCounts.customers)
          .mockResolvedValueOnce(mockCounts.services),
        find: jest.fn()
          .mockResolvedValueOnce(mockTopServices)
          .mockResolvedValueOnce(mockTopStylists)
      }

      service['payload'] = mockPayload as any

      const result = await service.getSalonAnalytics()

      expect(result).toBeTruthy()
      expect(result.appointments).toBe(100)
      expect(result.customers).toBe(50)
      expect(result.services).toBe(10)
      expect(result.topServices).toHaveLength(1)
      expect(result.topStylists).toHaveLength(1)
    })
  })

  describe('Error Handling', () => {
    it('should handle payload errors gracefully', async () => {
      const mockPayload = {
        find: jest.fn().mockRejectedValue(new Error('Database error'))
      }

      service['payload'] = mockPayload as any

      await expect(service.getBusinessDocumentation('salon_employee'))
        .rejects.toThrow('Failed to fetch documentation')
    })

    it('should handle null session in user sync', async () => {
      const result = await service.syncUserWithPayload(null)
      expect(result).toBeNull()
    })
  })

  describe('Caching', () => {
    it('should cache results when enabled', async () => {
      const mockDocs = {
        docs: [{ id: 'doc-1', title: 'Cached Doc' }],
        totalDocs: 1,
        page: 1,
        totalPages: 1
      }

      const mockPayload = {
        find: jest.fn().mockResolvedValue(mockDocs)
      }

      service['payload'] = mockPayload as any

      // First call
      const result1 = await service.getBusinessDocumentation('salon_employee')
      // Second call should use cache
      const result2 = await service.getBusinessDocumentation('salon_employee')

      expect(result1).toEqual(result2)
      expect(mockPayload.find).toHaveBeenCalledTimes(1) // Should only be called once due to caching
    })
  })
})