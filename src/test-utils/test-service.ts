import { faker } from '@faker-js/faker'

export interface TestService {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  active: boolean
}

let serviceCounter = 1

const serviceCategories = [
  'Haircut & Styling',
  'Hair Coloring',
  'Hair Treatment',
  'Shaving',
  'Beard Grooming',
  'Facial',
  'Massage',
]

const serviceNames = {
  'Haircut & Styling': [
    'Classic Men\'s Cut',
    'Modern Fade',
    'Beard Trim & Style',
    'Executive Cut',
    'Textured Crop',
  ],
  'Hair Coloring': [
    'Gray Blending',
    'Full Color',
    'Highlights',
    'Color Correction',
  ],
  'Hair Treatment': [
    'Deep Conditioning',
    'Scalp Treatment',
    'Hair Restoration',
    'Keratin Treatment',
  ],
  'Shaving': [
    'Traditional Hot Towel Shave',
    'Straight Razor Shave',
    'Head Shave',
    'Beard Shape-up',
  ],
  'Beard Grooming': [
    'Beard Trim',
    'Mustache Styling',
    'Beard Oil Treatment',
    'Full Beard Service',
  ],
  'Facial': [
    'Classic Facial',
    'Anti-Aging Facial',
    'Deep Cleansing Facial',
    'Hydrating Facial',
  ],
  'Massage': [
    'Scalp Massage',
    'Neck & Shoulder Massage',
    'Hot Stone Massage',
    'Relaxation Massage',
  ],
}

export async function createTestService(overrides: Partial<TestService> = {}): Promise<TestService> {
  const category = overrides.category || faker.helpers.arrayElement(serviceCategories)
  const categoryServices = serviceNames[category as keyof typeof serviceNames] || [category]
  
  const service: TestService = {
    id: `service_${serviceCounter++}`,
    name: faker.helpers.arrayElement(categoryServices),
    description: faker.lorem.sentence({ min: 8, max: 15 }),
    duration: faker.helpers.arrayElement([30, 45, 60, 90, 120]),
    price: faker.number.int({ min: 25, max: 150 }),
    category,
    active: faker.datatype.boolean({ probability: 0.9 }),
    ...overrides,
  }

  return service
}

export async function createTestServices(count: number): Promise<TestService[]> {
  const services: TestService[] = []

  for (let i = 0; i < count; i++) {
    services.push(await createTestService())
  }

  return services
}

export async function createTestServicesByCategory(category: string, count: number = 3): Promise<TestService[]> {
  const services: TestService[] = []

  for (let i = 0; i < count; i++) {
    services.push(await createTestService({ category }))
  }

  return services
}

export async function createTestServiceSuite(): Promise<TestService[]> {
  const services: TestService[] = []

  // Create at least one service per category
  for (const category of serviceCategories) {
    services.push(await createTestService({ category, active: true }))
  }

  // Add some additional random services
  const additionalCount = faker.number.int({ min: 3, max: 8 })
  for (let i = 0; i < additionalCount; i++) {
    services.push(await createTestService())
  }

  return services
}
