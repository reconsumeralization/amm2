import { NextRequest } from 'next/server'
import { GET } from '@/app/api/healthcheck/route'

// Mock the payload client
jest.mock('@/payload', () => ({
  getPayloadClient: jest.fn(() => ({
    db: {
      collections: {
        users: { count: jest.fn().mockResolvedValue(10) },
        appointments: { count: jest.fn().mockResolvedValue(25) },
        services: { count: jest.fn().mockResolvedValue(15) },
      },
    },
  })),
}))

describe('/api/healthcheck', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns healthy status when database is accessible', async () => {
    const request = new NextRequest('http://localhost:3000/api/healthcheck')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      status: 'healthy',
      timestamp: expect.any(String),
      services: {
        database: 'healthy',
        payload: 'healthy',
      },
      counts: {
        users: 10,
        appointments: 25,
        services: 15,
      },
    })
  })

  it('returns unhealthy status when database is inaccessible', async () => {
    // Mock database failure
    const { getPayloadClient } = require('@/payload')
    getPayloadClient.mockRejectedValueOnce(new Error('Database connection failed'))

    const request = new NextRequest('http://localhost:3000/api/healthcheck')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      status: 'unhealthy',
      timestamp: expect.any(String),
      error: 'Database connection failed',
      services: {
        database: 'unhealthy',
        payload: 'unhealthy',
      },
    })
  })

  it('handles partial database failures', async () => {
    // Mock partial database failure
    const { getPayloadClient } = require('@/payload')
    const mockPayload = {
      db: {
        collections: {
          users: { count: jest.fn().mockRejectedValue(new Error('Users collection error')) },
          appointments: { count: jest.fn().mockResolvedValue(25) },
          services: { count: jest.fn().mockResolvedValue(15) },
        },
      },
    }
    getPayloadClient.mockResolvedValueOnce(mockPayload)

    const request = new NextRequest('http://localhost:3000/api/healthcheck')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.status).toBe('unhealthy')
    expect(data.services.database).toBe('unhealthy')
  })

  it('includes timestamp in response', async () => {
    const request = new NextRequest('http://localhost:3000/api/healthcheck')

    const response = await GET(request)
    const data = await response.json()

    expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('sets correct content type header', async () => {
    const request = new NextRequest('http://localhost:3000/api/healthcheck')

    const response = await GET(request)

    expect(response.headers.get('Content-Type')).toBe('application/json')
  })
})
