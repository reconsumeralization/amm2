import type { NextAuthOptions, Session } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { z } from 'zod'
import { logger } from './logger'
import { getPayloadClient } from '@/payload'
import { ROLES, ROLE_PERMISSIONS } from './auth-constants'
import { logAuthEvent } from './auth-utils'
import bcrypt from 'bcryptjs'

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
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
]

// Additional required env vars for production
if (process.env.NODE_ENV === 'production') {
  requiredEnvVars.push('DATABASE_URL')
}

// Validate environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
  if (process.env[envVar]?.includes('your-') || process.env[envVar]?.includes('example')) {
    throw new Error(`Placeholder value detected for ${envVar}. Please set a real value.`)
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

// Production-ready user authentication via Payload CMS only
// No hardcoded demo users for security

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
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        profile(profile) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            role: 'customer', // Default role for OAuth users
          }
        },
      })
    ] : []),
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

          // Authenticate via Payload CMS only
          try {
            const config = await getPayloadConfig()
            const payload = await getPayloadClient()

            // Find user by email
            const users = await payload.find({
              collection: 'users',
              where: {
                email: { equals: email.toLowerCase() }
              },
              limit: 1,
            })

            if (users.docs.length === 0) {
              logAuthEvent('signin_failed_user_not_found', {
                email: email.toLowerCase()
              })
              throw new Error('Invalid credentials')
            }

            const user = users.docs[0]

            // Verify password using bcrypt
            if (!user.password) {
              logAuthEvent('signin_failed_no_password', {
                userId: String(user.id),
                email: user.email
              })
              throw new Error('Account setup incomplete')
            }

            const isValidPassword = await bcrypt.compare(password, user.password)
            if (!isValidPassword) {
              logAuthEvent('signin_failed_invalid_password', {
                userId: String(user.id),
                email: user.email
              })
              throw new Error('Invalid credentials')
            }

            // Check if account is active
            if (user.status !== 'active') {
              logAuthEvent('signin_failed_inactive_account', {
                userId: String(user.id),
                email: user.email,
                status: user.status
              })
              throw new Error('Account is not active')
            }

            logAuthEvent('signin_success', {
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
            if (user.profile?.address) {
              authUser.address = user.profile.address
            }
            if (user.stylistId) {
              authUser.stylistId = user.stylistId
            }
            if (user.customerId) {
              authUser.customerId = user.customerId
            }
            if (user.specialties) {
              authUser.specialties = user.specialties
            }

            return authUser
          } catch (payloadError) {
            logger.authError('payload_authentication_error', {
              email: email.toLowerCase()
            }, payloadError instanceof Error ? payloadError : new Error('Unknown Payload error'))
            throw new Error('Authentication service unavailable')
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
      if (token && (session as any).user) {
        ((session as any).user as any).id = token.sub!
        ;((session as any).user as any).role = token.role as string
        ;((session as any).user as any).permissions = token.permissions as string[]
        ;((session as any).user as any).customerId = token.customerId as string | null
        ;((session as any).user as any).stylistId = token.stylistId as string | null
        ;((session as any).user as any).phone = token.phone as string | null
        ;((session as any).user as any).address = token.address as string | null
        ;((session as any).user as any).specialties = token.specialties as string[] | null
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

// Typed wrapper for server-side session
import { getServerSession as nextGetServerSession } from 'next-auth'

export async function getServerSession(options?: NextAuthOptions): Promise<Session | null> {
  return nextGetServerSession(options || authOptions) as Promise<Session | null>
}