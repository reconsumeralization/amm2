import { getPayloadClient as payloadClient } from '@/payload'

// Wrapper to handle getPayload configuration issues
export async function getPayloadClient() {
  try {
    return await payloadClient()
  } catch (error) {
    console.error('Error getting payload client:', error)
    throw error
  }
}

export default getPayloadClient
