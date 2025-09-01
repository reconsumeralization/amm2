import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, stylistId, serviceId, appointmentDate, appointmentTime, notes } = await req.json()

    // Validate required fields
    if (!userId || !stylistId || !serviceId || !appointmentDate || !appointmentTime) {
      throw new Error('Missing required fields')
    }

    // Check if stylist is available at the requested time
    const { data: availability, error: availabilityError } = await supabaseClient
      .from('stylist_availability')
      .select('*')
      .eq('stylist_id', stylistId)
      .eq('date', appointmentDate)
      .single()

    if (availabilityError && availabilityError.code !== 'PGRST116') {
      throw availabilityError
    }

    // If availability record exists, check if time slot is available
    if (availability) {
      const requestedTime = appointmentTime
      const bookedSlots = availability.booked_slots || []

      if (bookedSlots.includes(requestedTime)) {
        throw new Error('Time slot is already booked')
      }
    }

    // Get service details for pricing
    const { data: service, error: serviceError } = await supabaseClient
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single()

    if (serviceError) throw serviceError

    // Create appointment
    const { data: appointment, error: appointmentError } = await supabaseClient
      .from('appointments')
      .insert({
        user_id: userId,
        stylist_id: stylistId,
        service_id: serviceId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        status: 'pending',
        notes: notes || null,
        total_price: service.price,
        duration_minutes: service.duration_minutes
      })
      .select()
      .single()

    if (appointmentError) throw appointmentError

    // Update stylist availability (mark time slot as booked)
    if (availability) {
      const bookedSlots = availability.booked_slots || []
      bookedSlots.push(appointmentTime)

      await supabaseClient
        .from('stylist_availability')
        .update({ booked_slots: bookedSlots })
        .eq('id', availability.id)
    } else {
      // Create availability record with booked slot
      await supabaseClient
        .from('stylist_availability')
        .insert({
          stylist_id: stylistId,
          date: appointmentDate,
          start_time: '09:00',
          end_time: '18:00',
          is_available: true,
          booked_slots: [appointmentTime]
        })
    }

    // Send confirmation email (placeholder for email service integration)
    await sendAppointmentConfirmation(appointment)

    return new Response(
      JSON.stringify({
        success: true,
        appointment,
        message: 'Appointment booked successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error booking appointment:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function sendAppointmentConfirmation(appointment: any) {
  // Placeholder for email service integration
  // This could integrate with services like SendGrid, Mailgun, etc.
  console.log('Sending appointment confirmation for:', appointment.id)

  // Example integration:
  /*
  const emailData = {
    to: appointment.user.email,
    subject: 'Appointment Confirmation',
    template: 'appointment-confirmation',
    data: {
      appointmentDate: appointment.appointment_date,
      appointmentTime: appointment.appointment_time,
      serviceName: appointment.service.name,
      stylistName: appointment.stylist.name
    }
  }

  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  })
  */
}
