import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import type { User } from "@supabase/supabase-js"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  const typedUser = user as User | null
  if (authError || !typedUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const employeeId = searchParams.get('employeeId')

    let query = supabase.from("clock_entries").select("*")

    // If employeeId is provided, use it; otherwise get entries for current user
    if (employeeId) {
      // Check if user has permission to view this employee's entries
      // This would need to be implemented based on your user roles system
      query = query.eq("employee_id", employeeId)
    } else {
      // Get entries for current user
      query = query.eq("user_id", typedUser.id)
    }

    // Add date filter if provided
    if (date) {
      query = query.eq("date", date)
    }

    const { data: entries, error } = await query
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      entries: entries,
      total: entries?.length || 0,
    })
  } catch (error) {
    console.error('Clock entries error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
