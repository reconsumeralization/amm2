// Start of Selection
import type { NextAuthOptions, Session } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { z } from 'zod'
import { logger } from './logger'

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

interface CustomerUser extends BaseUser {
  role: 'customer'
  customerId: string
  phone: string
  address: string
}

interface StylistUser extends BaseUser {
  role: 'stylist'
  stylistId: string
  specialties: string[]
}

type DemoUser = AdminUser | CustomerUser | StylistUser

// Demo users for development
const DEMO_USERS: Record<string, DemoUser> = {
  admin: {
    id: '1',
    email: 'admin@modernmen.ca',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    permissions: ['manage_appointments', 'manage_customers', 'manage_services', 'view_reports']
  },
  customer: {
    id: '2',
    email: 'customer@modernmen.ca',
    password: 'customer123',
    name: 'John Smith',
    role: 'customer',
    permissions: ['view_appointments', 'book_appointments', 'view_profile'],
    customerId: 'CUST001',
    phone: '(306) 555-0123',
    address: '123 Main St, Regina, SK'
  },
  stylist: {
    id: '3',
    email: 'stylist@modernmen.ca',
    password: 'stylist123',
    name: 'Michael Chen',
    role: 'stylist',
    permissions: ['view_appointments', 'manage_own_appointments', 'view_customers'],
    stylistId: 'STYL001',
    specialties: ['Fades', 'Pompadours', 'Beard Grooming']
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
            logger.authEvent('signin_failed_missing_credentials')
            throw new Error('Missing credentials')
          }

          const validatedFields = loginSchema.safeParse(credentials)
          if (!validatedFields.success) {
            logger.authEvent('signin_failed_invalid_format', {
              email: credentials.email
            })
            throw new Error('Invalid email or password format')
          }

          const { email, password } = validatedFields.data

          logger.authEvent('signin_attempt', {
            email: email.toLowerCase()
          })

          // Check for demo users
          const user = Object.values(DEMO_USERS).find(
            user => user.email.toLowerCase() === email.toLowerCase() && user.password === password
          )

          if (user) {
            logger.authEvent('signin_success', {
              userId: user.id,
              email: user.email,
              role: user.role
            })

            const authUser: AuthUser = {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              permissions: user.permissions
            }

            // Add optional properties based on user type
            if ('customerId' in user) {
              authUser.customerId = user.customerId
            }
            if ('stylistId' in user) {
              authUser.stylistId = user.stylistId
            }
            if ('phone' in user) {
              authUser.phone = user.phone
            }
            if ('address' in user) {
              authUser.address = user.address
            }
            if ('specialties' in user) {
              authUser.specialties = user.specialties
            }

            return authUser
          }

          logger.authEvent('signin_failed_invalid_credentials', {
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
      if (token) {
        ;(session.user as any).id = token.sub!
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
