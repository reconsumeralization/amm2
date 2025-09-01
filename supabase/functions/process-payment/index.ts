import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentPayload {
  appointmentId: string
  amount: number
  currency: string
  paymentMethod: 'card' | 'cash' | 'bank_transfer'
  paymentIntentId?: string
  metadata?: any
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payment: PaymentPayload = await req.json()

    // Validate required fields
    if (!payment.appointmentId || !payment.amount || !payment.currency || !payment.paymentMethod) {
      throw new Error('Missing required payment fields')
    }

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabaseClient
      .from('appointments')
      .select(`
        *,
        user:profiles(*),
        service:services(*),
        stylist:stylists(*)
      `)
      .eq('id', payment.appointmentId)
      .single()

    if (appointmentError) throw appointmentError
    if (!appointment) throw new Error('Appointment not found')

    // Process payment based on method
    let paymentResult

    switch (payment.paymentMethod) {
      case 'card':
        paymentResult = await processCardPayment(payment, appointment)
        break
      case 'cash':
        paymentResult = await processCashPayment(payment, appointment)
        break
      case 'bank_transfer':
        paymentResult = await processBankTransferPayment(payment, appointment)
        break
      default:
        throw new Error('Unsupported payment method')
    }

    // Create payment record
    const { data: paymentRecord, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        appointment_id: payment.appointmentId,
        user_id: appointment.user_id,
        amount: payment.amount,
        currency: payment.currency,
        payment_method: payment.paymentMethod,
        status: paymentResult.status,
        transaction_id: paymentResult.transactionId,
        payment_intent_id: payment.paymentIntentId,
        metadata: {
          ...payment.metadata,
          ...paymentResult.metadata
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    // Update appointment status if payment successful
    if (paymentResult.status === 'completed') {
      await supabaseClient
        .from('appointments')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.appointmentId)

      // Send confirmation notification
      await sendPaymentConfirmation(appointment, paymentRecord)
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment: paymentRecord,
        message: 'Payment processed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error processing payment:', error)

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

async function processCardPayment(payment: PaymentPayload, appointment: any) {
  // Integration with Stripe or other payment processor
  if (!payment.paymentIntentId) {
    throw new Error('Payment intent ID required for card payments')
  }

  try {
    // Example Stripe integration
    const stripeResponse = await fetch(`https://api.stripe.com/v1/payment_intents/${payment.paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const stripeData = await stripeResponse.json()

    if (stripeData.status === 'succeeded') {
      return {
        status: 'completed',
        transactionId: stripeData.id,
        metadata: {
          stripe_payment_intent: stripeData.id,
          stripe_charge_id: stripeData.charges?.data?.[0]?.id
        }
      }
    } else {
      return {
        status: 'failed',
        transactionId: stripeData.id,
        metadata: {
          stripe_payment_intent: stripeData.id,
          failure_reason: stripeData.last_payment_error?.message
        }
      }
    }
  } catch (error) {
    console.error('Stripe payment processing error:', error)
    throw new Error('Card payment processing failed')
  }
}

async function processCashPayment(payment: PaymentPayload, appointment: any) {
  // Cash payments are typically handled in-person
  return {
    status: 'pending',
    transactionId: `cash_${Date.now()}_${appointment.id}`,
    metadata: {
      payment_method: 'cash',
      notes: 'Payment to be collected at appointment'
    }
  }
}

async function processBankTransferPayment(payment: PaymentPayload, appointment: any) {
  // Bank transfer payments
  return {
    status: 'pending',
    transactionId: `bank_${Date.now()}_${appointment.id}`,
    metadata: {
      payment_method: 'bank_transfer',
      notes: 'Bank transfer pending verification'
    }
  }
}

async function sendPaymentConfirmation(appointment: any, payment: any) {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Send notification via our notification function
  await supabaseClient.functions.invoke('send-notification', {
    body: {
      userId: appointment.user_id,
      type: 'payment_success',
      title: 'Payment Confirmed',
      message: `Your payment of $${payment.amount} for your appointment has been confirmed.`,
      data: {
        appointmentId: appointment.id,
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency
      },
      channels: ['email', 'in_app']
    }
  })

  // Also send to stylist
  if (appointment.stylist_id) {
    await supabaseClient.functions.invoke('send-notification', {
      body: {
        userId: appointment.stylist_id,
        type: 'payment_success',
        title: 'Payment Received',
        message: `Payment of $${payment.amount} received for appointment on ${appointment.appointment_date}.`,
        data: {
          appointmentId: appointment.id,
          paymentId: payment.id,
          customerName: appointment.user.full_name
        },
        channels: ['in_app']
      }
    })
  }
}
