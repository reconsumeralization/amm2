import { BusinessDocumentationService } from '@/lib/business-documentation-service'
import { DocumentationUser } from '@/lib/documentation-auth'
import {
  BusinessDocumentationCreateRequest,
  BusinessDocumentationUpdateRequest,
  BusinessDocumentationType,
  BusinessDocumentationCategory,
  DifficultyLevel,
  PriorityLevel
} from '@/types/business-documentation'
import { UserRole } from '@/types/documentation'

describe('BusinessDocumentationService', () => {
  const config = {
    payloadApiUrl: 'http://localhost:3000',
    enableWorkflowAutomation: false,
    enableNotifications: false,
    enableAnalytics: false
  }

  const service = new BusinessDocumentationService(config)

  const mockUser: DocumentationUser = {
    id: 'user-1',
    email: 'owner@example.com',
    name: 'Salon Owner',
    role: 'salon_owner',
    permissions: ['business.owner.access'],
    preferences: { theme: 'light', language: 'en', compactMode: false }
  }

  const createRequest: BusinessDocumentationCreateRequest = {
    title: 'Sample Guide',
    type: 'guide' as BusinessDocumentationType,
    targetRole: 'salon_owner' as UserRole,
    category: 'salon-operations' as BusinessDocumentationCategory,
    content: 'Sample content',
    tags: ['owner'],
    difficulty: 'beginner' as DifficultyLevel,
    priority: 'low' as PriorityLevel,
    relatedDocuments: []
  }

  const updateRequest: BusinessDocumentationUpdateRequest = {
    id: 'doc-1',
    title: 'Updated Guide',
    content: 'Updated content',
    type: 'guide' as BusinessDocumentationType,
    targetRole: 'salon_owner' as UserRole,
    category: 'salon-operations' as BusinessDocumentationCategory,
    tags: ['owner'],
    difficulty: 'beginner' as DifficultyLevel,
    priority: 'low' as PriorityLevel,
    relatedDocuments: []
  }

  // Mock global fetch
  beforeAll(() => {
    // @ts-ignore
    global.fetch = jest.fn((url: string, options: any) => {
      const method = options?.method || 'GET'
      const responseBody: any = {}

      if (method === 'POST' && url.endsWith('/api/documentation')) {
        responseBody.id = 'doc-1'
        responseBody.title = createRequest.title
        responseBody.author = mockUser.id
        responseBody.content = createRequest.content
        responseBody.type = createRequest.type
        responseBody.category = createRequest.category
        responseBody.targetRole = createRequest.targetRole
        responseBody.difficulty = createRequest.difficulty
        responseBody.priority = createRequest.priority
        responseBody.tags = createRequest.tags
      } else if (method === 'GET' && url.includes('/api/documentation/doc-1')) {
        responseBody.id = 'doc-1'
        responseBody.title = 'Fetched Guide'
        responseBody.author = mockUser.id
        responseBody.content = 'Fetched content'
        responseBody.type = 'guide'
        responseBody.category = 'salon-operations'
        responseBody.targetRole = 'salon_owner'
        responseBody.difficulty = 'beginner'
        responseBody.priority = 'low'
        responseBody.tags = ['owner']
      } else if (method === 'PATCH' && url.includes('/api/documentation/doc-1')) {
        responseBody.id = 'doc-1'
        responseBody.title = updateRequest.title
        responseBody.content = updateRequest.content
        responseBody.type = updateRequest.type
        responseBody.category = updateRequest.category
        responseBody.targetRole = updateRequest.targetRole
        responseBody.difficulty = updateRequest.difficulty
        responseBody.priority = updateRequest.priority
        responseBody.tags = updateRequest.tags
        responseBody.author = mockUser.id
      } else if (method === 'DELETE') {
        return Promise.resolve({ ok: true })
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responseBody)
      })
    }) as any
  })

  afterAll(() => {
    // @ts-ignore
    delete global.fetch
  })

  test('createDocumentation returns created document with author', async () => {
    const doc = await service.createDocumentation(createRequest, mockUser.id)
    expect(doc).toBeDefined()
    expect(doc.id).toBe('doc-1')
    expect(doc.title).toBe(createRequest.title)
    expect(doc.author).toBe(mockUser.id)
    expect(doc.type).toBe(createRequest.type)
    expect(doc.category).toBe(createRequest.category)
  })

  test('getDocumentationById retrieves a document by id', async () => {
    const doc = await service.getDocumentationById('doc-1')
    expect(doc).toBeDefined()
    expect(doc?.id).toBe('doc-1')
    expect(doc?.title).toBe('Fetched Guide')
    expect(doc?.type).toBe('guide')
    expect(doc?.category).toBe('salon-operations')
  })

  test('updateDocumentation updates fields correctly', async () => {
    const updated = await service.updateDocumentation(updateRequest, mockUser.id)
    expect(updated).toBeDefined()
    expect(updated?.id).toBe('doc-1')
    expect(updated?.title).toBe(updateRequest.title)
    expect(updated?.content).toBe(updateRequest.content)
    expect(updated?.type).toBe(updateRequest.type)
    expect(updated?.category).toBe(updateRequest.category)
  })

  test('getDocumentationById returns null when document not found', async () => {
    // Simulate not found response
    // @ts-ignore
    global.fetch = jest.fn(() => Promise.resolve({ ok: false })) as any
    const doc = await service.getDocumentationById('nonexistent')
    expect(doc).toBeNull()
  })
})
