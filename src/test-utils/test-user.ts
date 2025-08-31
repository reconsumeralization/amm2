import { faker } from '@faker-js/faker'
import { getPayloadClient } from '@/payload'
import config from '../payload.config'

export interface TestUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'customer' | 'staff' | 'admin'
}

let userCounter = 1
let payload: any = null

async function getPayloadInstance() {
  if (!payload) {
    payload = await // @ts-ignore
  getPayloadClient()
  }
  return payload
}

export async function createTestUser(overrides: Partial<TestUser> = {}): Promise<TestUser> {
  const payloadInstance = await getPayloadInstance()

  const userData = {
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: 'customer' as const,
    ...overrides,
  }

  const user = await payloadInstance.create({
    collection: 'users',
    data: userData,
  })

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  }
}

export async function createTestStaff(): Promise<TestUser> {
  return createTestUser({
    role: 'staff',
  })
}

export async function createTestAdmin(): Promise<TestUser> {
  return createTestUser({
    role: 'admin',
  })
}
