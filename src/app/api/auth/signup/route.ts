import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { authRateLimiters, getRateLimitIdentifier, createRateLimitResponse } from '@/lib/auth-ratelimit'
import { logger, getRequestContext } from '@/lib/logger'
import { emailService } from '@/lib/email-service'
import { randomBytes } from 'crypto'

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

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user with unverified email
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: 'user',
          emailVerified: null, // Not verified initially
          verificationToken,
          verificationExpires: verificationExpires.toISOString(),
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

    // Send verification email
    try {
      const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`
      await emailService.sendVerificationEmail(email, name, verificationLink)
      console.log('Verification email sent to:', email)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail the signup if email fails, just log it
    }

    logger.authEvent('signup_success', {
      ...requestContext,
      userId: newUser.id,
      email: newUser.email
    })

    return NextResponse.json(
      {
        message: 'Account created successfully! Please check your email to verify your account.',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          emailVerified: false
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Signup error:', error)

    logger.authError('signup_failed', requestContext, error instanceof Error ? error : new Error('Unknown error'))

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
