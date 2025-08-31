import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { logger, getRequestContext } from '@/lib/logger'

const verifySchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  const requestContext = getRequestContext(request)

  try {
    const body = await request.json()
    const { token, email } = verifySchema.parse(body)

    logger.authEvent('email_verify_attempt', {
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

    // Find user with matching token and email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, verificationToken, verificationExpires, emailVerified')
      .eq('email', email.toLowerCase())
      .eq('verificationToken', token)
      .single()

    if (userError || !user) {
      logger.authEvent('email_verify_failed_invalid_token', {
        ...requestContext,
        email: email.toLowerCase()
      })
      return NextResponse.json(
        { message: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email address is already verified' },
        { status: 200 }
      )
    }

    // Check if token has expired
    const now = new Date()
    const expiresAt = new Date(user.verificationExpires)
    if (now > expiresAt) {
      logger.authEvent('email_verify_failed_expired', {
        ...requestContext,
        email: email.toLowerCase()
      })
      return NextResponse.json(
        { message: 'Verification token has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Update user to mark email as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({
        emailVerified: now.toISOString(),
        verificationToken: null,
        verificationExpires: null,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to update user verification status:', updateError)
      return NextResponse.json(
        { message: 'Failed to verify email. Please try again.' },
        { status: 500 }
      )
    }

    logger.authEvent('email_verify_success', {
      ...requestContext,
      userId: user.id,
      email: user.email
    })

    return NextResponse.json(
      {
        message: 'Email verified successfully! You can now sign in to your account.',
        verified: true
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Email verification error:', error)

    logger.authError('email_verify_failed', requestContext, error instanceof Error ? error : new Error('Unknown error'))

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

// Handle GET requests for email verification links
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  if (!token || !email) {
    return NextResponse.json(
      { message: 'Missing verification parameters' },
      { status: 400 }
    )
  }

  // Redirect to a verification page with the parameters
  const verifyPageUrl = new URL('/auth/verify', request.url)
  verifyPageUrl.searchParams.set('token', token)
  verifyPageUrl.searchParams.set('email', email)

  return NextResponse.redirect(verifyPageUrl)
}