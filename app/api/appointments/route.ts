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
  const date = searchParams.get("date")
  const barberId = searchParams.get("barber_id")
  const customerId = searchParams.get("customer_id")

  let query = supabase.from("appointments").select(`
      id,
      appointment_date,
      status,
      price,
      duration,
      notes,
      created_at,
      updated_at,
      customer:customers!customer_id (
        id,
        profiles:id (
          first_name,
          last_name,
          email,
          phone
        )
      ),
      barber:staff!barber_id (
        id,
        profiles:id (
          first_name,
          last_name
        )
      ),
      service:services!service_id (
        id,
        name,
        duration_minutes,
        price
      )
    `)

  if (date) {
    const startDate = new Date(date)
    const endDate = new Date(date)
    endDate.setDate(endDate.getDate() + 1)
    query = query.gte("appointment_date", startDate.toISOString()).lt("appointment_date", endDate.toISOString())
  }

  if (barberId) {
    query = query.eq("barber_id", barberId)
  }

  if (customerId) {
    query = query.eq("customer_id", customerId)
  }

  const { data: appointments, error } = await query.order("appointment_date", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(appointments)
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

  const { data, error } = await supabase
    .from("appointments")
    .insert(body)
    .select(`
      id,
      appointment_date,
      status,
      price,
      duration,
      notes,
      created_at,
      updated_at,
      customer:customers!customer_id (
        id,
        profiles:id (
          first_name,
          last_name,
          email,
          phone
        )
      ),
      barber:staff!barber_id (
        id,
        profiles:id (
          first_name,
          last_name
        )
      ),
      service:services!service_id (
        id,
        name,
        duration_minutes,
        price
      )
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
