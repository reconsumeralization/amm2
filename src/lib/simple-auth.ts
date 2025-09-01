// src/lib/simple-auth.ts
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'
import { createClient } from '@/lib/supabase/client'

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  acceptMarketing?: boolean
}

export interface AuthResponse {
  user: any
  session?: any
  message: string
}

/**
 * Simple sign in wrapper for the auth form
 */
export async function signIn(credentials: SignInCredentials): Promise<AuthResponse> {
  try {
    const result = await nextAuthSignIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    })

    if (result?.error) {
      throw new Error(result.error)
    }

    return {
      user: { email: credentials.email },
      message: 'Successfully signed in',
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in')
  }
}

/**
 * Simple sign up wrapper
 */
export async function signUp(userData: SignUpData): Promise<AuthResponse> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          full_name: `${userData.firstName} ${userData.lastName}`,
        },
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    return {
      user: data.user,
      message: 'Account created successfully',
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create account')
  }
}

/**
 * Sign out wrapper
 */
export async function signOut(): Promise<void> {
  await nextAuthSignOut({ callbackUrl: '/' })
}

/**
 * Password reset wrapper
 */
export async function resetPassword(email: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Confirm password reset wrapper
 */
export async function confirmResetPassword(token: string, newPassword: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw new Error(error.message)
  }
}
