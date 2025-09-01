import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const staffId = searchParams.get("staff_id")
  const date = searchParams.get("date")

  let query = supabase.from("time_entries").select(`
      *,
      staff:staff!staff_id (
        id,
        profiles:id (
          first_name,
          last_name
        )
      )
    `)

  if (staffId) {
    query = query.eq("staff_id", staffId)
  }

  if (date) {
    query = query.eq("date", date)
  }

  const { data: timeEntries, error } = await query.order("clock_in", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(timeEntries)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  // Calculate total hours if clock_out is provided
  if (body.clock_out) {
    const clockIn = new Date(body.clock_in)
    const clockOut = new Date(body.clock_out)
    const totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60)
    const totalHours = (totalMinutes - (body.break_minutes || 0)) / 60
    body.total_hours = Math.round(totalHours * 100) / 100
  }

  const { data, error } = await supabase.from("time_entries").insert(body).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
