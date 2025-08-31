// Universal session type fixes
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      permissions: string[]
      customerId?: string | null
      stylistId?: string | null
      phone?: string | null
      address?: string | null
      specialties?: string[] | null
    } & DefaultSession['user']
  }
}

// Global session type helper
declare global {
  type SessionUser = {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
    permissions: string[]
    customerId?: string | null
    stylistId?: string | null
    phone?: string | null
    address?: string | null
    specialties?: string[] | null
  }
}

export {}
