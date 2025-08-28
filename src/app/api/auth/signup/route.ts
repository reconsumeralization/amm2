import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { authRateLimiters, getRateLimitIdentifier, createRateLimitResponse } from '@/lib/auth-ratelimit'
import { logger, getRequestContext } from '@/lib/logger'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
})

export async function POST(request: NextRequest) {
  const requestContext = getRequestContext(request)

  try {
    // Apply rate limiting
    const identifier = getRateLimitIdentifier(request, 'signup')
    const rateLimitResult = await authRateLimiters.signup.check(identifier)

    if (!rateLimitResult.success) {
      logger.rateLimitExceeded('signup', {
        ...requestContext,
        identifier,
        remaining: rateLimitResult.remaining
      })
      return createRateLimitResponse(rateLimitResult)
    }

    const body = await request.json()
    const { name, email, password } = signupSchema.parse(body)

    logger.authEvent('signup_attempt', {
      ...requestContext,
      email: email.toLowerCase()
    })

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      logger.authEvent('signup_failed_user_exists', {
        ...requestContext,
        email: email.toLowerCase()
      })
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: 'user',
          emailVerified: new Date().toISOString(), // Auto-verify for now
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return NextResponse.json(
        { message: 'Failed to create account. Please try again.' },
        { status: 500 }
      )
    }

    // TODO: Send verification email if email service is configured
    if (process.env.EMAIL_SERVER) {
      console.log('Email verification would be sent here')
    }

    logger.authEvent('signup_success', {
      ...requestContext,
      userId: newUser.id,
      email: newUser.email
    })

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Signup error:', error)

    logger.authError('signup_failed', requestContext, error instanceof Error ? error : new Error('Unknown error'))

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
