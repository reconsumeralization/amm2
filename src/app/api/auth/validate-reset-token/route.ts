import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const validateTokenSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = validateTokenSchema.parse(body)

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

    // Find user with valid reset token
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('resetToken', token)
      .gt('resetTokenExpiry', new Date().toISOString())
      .single()

    if (error || !user) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Valid reset token' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Validate reset token error:', error)

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
