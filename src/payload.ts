import { getPayload } from 'payload'
import config from './payload.config'

let cached = global.payload

if (!cached) {
  cached = global.payload = { client: null, promise: null }
}

const getPayloadClient = async () => {
  if (cached.client) {
    return cached.client
  }

  if (!cached.promise) {
    cached.promise = getPayload({
      config,
    })
  }

  try {
    cached.client = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.client
}

// Vercel-specific initialization
if (typeof globalThis !== 'undefined') {
  globalThis.payload = cached
}

export default getPayloadClient
export { getPayloadClient }

// Add type declaration for global
declare global {
  var payload: {
    client: any
    promise: Promise<any> | null
  } | undefined
}
