import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get recent users (last 10)
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Get last login info for each user
    const userIds = users?.map(user => user.id) || []
    const { data: sessions } = await supabase
      .from('sessions')
      .select('userId, expires')
      .in('userId', userIds)
      .order('expires', { ascending: false })

    // Create a map of user ID to last login
    const lastLoginMap: Record<string, string> = {}
    sessions?.forEach(session => {
      if (!lastLoginMap[session.userId]) {
        lastLoginMap[session.userId] = session.expires
      }
    })

    // Combine user data with last login info
    const usersWithLogin = users?.map(user => ({
      ...user,
      lastLogin: lastLoginMap[user.id]
    })) || []

    return NextResponse.json({ users: usersWithLogin })

  } catch (error) {
    console.error('Recent users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
