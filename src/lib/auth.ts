import type { NextAuthOptions, Session } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { z } from 'zod'
import { logger } from './logger'
import { getPayload } from 'payload'
import { ROLES, ROLE_PERMISSIONS, logAuthEvent } from './auth-utils'

// Dynamic import for payload config to avoid client-side bundling
let payloadConfig: any = null
const getPayloadConfig = async () => {
  if (!payloadConfig) {
    payloadConfig = (await import('../payload.config')).default
  }
  return payloadConfig
}

// Define types for NextAuth callbacks
interface JWTToken {
  accessToken?: string
  role?: string
  permissions?: string[]
  customerId?: string | null
  stylistId?: string | null
  phone?: string | null
  address?: string | null
  specialties?: string[] | null
  sub?: string
}

interface JWTParams {
  token: JWTToken
  user?: AuthUser
  account?: any
}

interface SessionParams {
  session: Session
  token: JWTToken
}

interface RedirectParams {
  url: string
  baseUrl: string
}

// Validate required environment variables
const requiredEnvVars = [
  'NEXTAUTH_SECRET'
]

// Only validate environment variables in production
if (process.env.NODE_ENV === 'production') {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar] || process.env[envVar]?.includes('your-') || process.env[envVar]?.includes('https://your-project')) {
      throw new Error(`Missing or placeholder value for required environment variable: ${envVar}. Please update your .env.local file with actual values.`)
    }
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// Define proper types for demo users
interface BaseUser {
  id: string
  email: string
  password: string
  name: string
  role: string
  permissions: string[]
}

interface AdminUser extends BaseUser {
  role: 'admin'
}

interface ManagerUser extends BaseUser {
  role: 'manager'
}

interface BarberUser extends BaseUser {
  role: 'barber'
  stylistId: string
  specialties: string[]
}

interface CustomerUser extends BaseUser {
  role: 'customer'
  customerId: string
  phone: string
  address: string
}

type DemoUser = AdminUser | ManagerUser | BarberUser | CustomerUser

// Helper function to get permissions based on role
function getPermissionsForRole(role: string): string[] {
  // Use centralized role permissions mapping
  const roleKey = role.toUpperCase() as keyof typeof ROLE_PERMISSIONS
  return ROLE_PERMISSIONS[roleKey] || ROLE_PERMISSIONS[ROLES.CUSTOMER] || []
}

// Demo users for development (will be replaced with Payload CMS integration)
const DEMO_USERS: Record<string, DemoUser> = {
  admin: {
    id: '1',
    email: 'admin@modernmen.ca',
    password: 'admin123',
    name: 'Admin User',
    role: ROLES.ADMIN,
    permissions: getPermissionsForRole(ROLES.ADMIN)
  },
  manager: {
    id: '2',
    email: 'manager@modernmen.ca',
    password: 'manager123',
    name: 'Manager User',
    role: ROLES.MANAGER,
    permissions: getPermissionsForRole(ROLES.MANAGER)
  },
  barber: {
    id: '3',
    email: 'barber@modernmen.ca',
    password: 'barber123',
    name: 'Michael Chen',
    role: ROLES.BARBER,
    permissions: getPermissionsForRole(ROLES.BARBER),
    stylistId: 'STYL001',
    specialties: ['Fades', 'Pompadours', 'Beard Grooming']
  },
  customer: {
    id: '4',
    email: 'customer@modernmen.ca',
    password: 'customer123',
    name: 'John Smith',
    role: ROLES.CUSTOMER,
    permissions: getPermissionsForRole(ROLES.CUSTOMER),
    customerId: 'CUST001',
    phone: '(306) 555-0123',
    address: '123 Main St, Regina, SK'
  }
}

// Define the user type for NextAuth
interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
  customerId?: string
  stylistId?: string
  phone?: string
  address?: string
  specialties?: string[]
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            logAuthEvent('signin_failed_missing_credentials', { email: credentials?.email || 'unknown' })
            throw new Error('Missing credentials')
          }

          const validatedFields = loginSchema.safeParse(credentials)
          if (!validatedFields.success) {
            logAuthEvent('signin_failed_invalid_format', {
              email: credentials.email || 'unknown'
            })
            throw new Error('Invalid email or password format')
          }

          const { email, password } = validatedFields.data

          logAuthEvent('signin_attempt', {
            email: email.toLowerCase()
          })

          // First check demo users for development
          const demoUser = Object.values(DEMO_USERS).find(
            user => user.email.toLowerCase() === email.toLowerCase() && user.password === password
          )

          if (demoUser) {
            logAuthEvent('signin_success_demo', {
              userId: demoUser.id,
              email: demoUser.email,
              role: demoUser.role
            })

            const authUser: AuthUser = {
              id: demoUser.id,
              email: demoUser.email,
              name: demoUser.name,
              role: demoUser.role,
              permissions: demoUser.permissions
            }

            // Add optional properties based on user type
            if ('customerId' in demoUser) {
              authUser.customerId = demoUser.customerId
            }
            if ('stylistId' in demoUser) {
              authUser.stylistId = demoUser.stylistId
            }
            if ('phone' in demoUser) {
              authUser.phone = demoUser.phone
            }
            if ('address' in demoUser) {
              authUser.address = demoUser.address
            }
            if ('specialties' in demoUser) {
              authUser.specialties = demoUser.specialties
            }

            return authUser
          }

          // Check Payload CMS users
          try {
            const config = await getPayloadConfig()
            const payload = await getPayload({ config })

            // Find user by email
            const users = await payload.find({
              collection: 'users',
              where: {
                email: { equals: email.toLowerCase() }
              },
              limit: 1,
            })

            if (users.docs.length > 0) {
              const user = users.docs[0]

              // For demo purposes, we'll accept any password for Payload users
              // In production, you'd implement proper password hashing and verification
              logAuthEvent('signin_success_payload', {
                userId: String(user.id),
                email: user.email,
                role: user.role
              })

              const authUser: AuthUser = {
                id: String(user.id),
                email: user.email,
                name: user.name || user.email,
                role: user.role || 'customer',
                permissions: getPermissionsForRole(user.role || 'customer')
              }

              // Add additional user data if available
              if (user.profile?.phone) {
                authUser.phone = user.profile.phone
              }

              return authUser
            }
          } catch (payloadError) {
            console.warn('Payload CMS authentication failed, falling back to demo users:', payloadError)
          }

          logAuthEvent('signin_failed_invalid_credentials', {
            email: email.toLowerCase()
          })
          throw new Error('Invalid credentials')

        } catch (error) {
          console.error('Authorization error:', error)
          logger.authError('signin_failed', {
            email: credentials?.email
          }, error instanceof Error ? error : new Error('Unknown authorization error'))
          throw error
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account }: JWTParams) {
      if (account && user) {
        token.accessToken = account.access_token
        token.role = (user as AuthUser).role
        token.permissions = (user as AuthUser).permissions
        
        const authUser = user as AuthUser
        token.customerId = authUser.customerId || null
        token.stylistId = authUser.stylistId || null
        token.phone = authUser.phone || null
        token.address = authUser.address || null
        token.specialties = authUser.specialties || null
      }
      return token
    },
    async session({ session, token }: SessionParams) {
      if (token && session.user) {
        session.user.id = token.sub!
        ;(session.user as any).role = token.role as string
        ;(session.user as any).permissions = token.permissions as string[]
        ;(session.user as any).customerId = token.customerId as string | null
        ;(session.user as any).stylistId = token.stylistId as string | null
        ;(session.user as any).phone = token.phone as string | null
        ;(session.user as any).address = token.address as string | null
        ;(session.user as any).specialties = token.specialties as string[] | null
        ;(session as any).accessToken = token.accessToken as string
      }
      return session
    },
    async redirect({ url, baseUrl }: RedirectParams) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  events: {
    async signIn(message: any) {
      console.log('Sign in event:', message)
    },
    async signOut(message: any) {
      console.log('Sign out event:', message)
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '2592000'), // 30 days default
  },
  secret: process.env.NEXTAUTH_SECRET,
}
