import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '../../../../payload.config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const {
      message,
      step,
      bookingData,
      appointments,
      staff,
      services,
      userId,
      tenantId,
      settings,
    } = await req.json();

    if (!message || !userId || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Create context for AI
    const context = {
      user: userId,
      tenant: tenantId,
      currentStep: step,
      bookingData,
      appointments: appointments || [],
      staff: staff || [],
      services: services || [],
      settings: settings || {},
      availableActions: [
        'book_appointment',
        'reschedule_appointment', 
        'cancel_appointment',
        'clock_in',
        'clock_out',
        'assign_staff',
        'generate_hair_preview',
        'suggest_times',
        'show_appointments',
        'show_services',
        'show_staff',
      ],
    };

    // Generate AI response
    const aiResponse = await generateAIResponse(message, context);

    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

async function generateAIResponse(message: string, context: any) {
  try {
    const systemPrompt = `You are a helpful AI assistant for ModernMen Barbershop. You help customers and staff with:

1. Booking appointments
2. Rescheduling appointments  
3. Cancelling appointments
4. Clock in/out for staff
5. Assigning staff to appointments
6. Generating hair style previews
7. Suggesting available times
8. Showing appointments, services, and staff

Current context:
- User: ${context.user}
- Tenant: ${context.tenant}
- Current step: ${context.currentStep}
- Available appointments: ${context.appointments.length}
- Available staff: ${context.staff.length}
- Available services: ${context.services.length}

Available actions: ${context.availableActions.join(', ')}

Respond in JSON format with:
{
  "response": "Your natural language response to the user",
  "action": "action_name (if action is needed)",
  "actionData": { /* data for the action */ },
  "step": "next_step (if conversation flow changes)",
  "bookingData": { /* updated booking data */ }
}

Be helpful, professional, and guide users through the booking process.`;

    const userPrompt = `User message: "${message}"

Current booking data: ${JSON.stringify(context.bookingData)}
Appointments: ${JSON.stringify(context.appointments.slice(0, 5))}
Staff: ${JSON.stringify(context.staff.slice(0, 5))}
Services: ${JSON.stringify(context.services.slice(0, 5))}

Respond with the JSON format specified above.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    try {
      // Try to parse JSON response
      const parsedResponse = JSON.parse(responseText);
      return {
        response: parsedResponse.response || 'I understand. How can I help you?',
        action: parsedResponse.action || null,
        actionData: parsedResponse.actionData || null,
        step: parsedResponse.step || context.currentStep,
        bookingData: parsedResponse.bookingData || context.bookingData,
      };
    } catch (parseError) {
      // If JSON parsing fails, return a simple response
      return {
        response: responseText || 'I understand. How can I help you?',
        action: null,
        actionData: null,
        step: context.currentStep,
        bookingData: context.bookingData,
      };
    }
  } catch (error) {
    console.error('AI response generation error:', error);
    
    // Fallback to rule-based response
    return generateFallbackResponse(message, context);
  }
}

function generateFallbackResponse(message: string, context: any) {
  const lowerMessage = message.toLowerCase();
  
  // Booking flow
  if (lowerMessage.includes('book') || lowerMessage.includes('appointment')) {
    if (!context.bookingData.service) {
      return {
        response: `What service would you like? Available services: ${context.services.map((s: any) => s.name || s).join(', ')}`,
        action: null,
        actionData: null,
        step: 'selectService',
        bookingData: context.bookingData,
      };
    }
    
    if (!context.bookingData.date) {
      return {
        response: 'When would you like your appointment? (e.g., "2025-01-15 10:00 AM")',
        action: null,
        actionData: null,
        step: 'selectDate',
        bookingData: context.bookingData,
      };
    }
    
    return {
      response: 'Great! I\'ll book that appointment for you.',
      action: 'book_appointment',
      actionData: context.bookingData,
      step: 'menu',
      bookingData: {},
    };
  }
  
  // Reschedule flow
  if (lowerMessage.includes('reschedule') || lowerMessage.includes('change')) {
    if (context.appointments.length === 0) {
      return {
        response: 'You don\'t have any appointments to reschedule.',
        action: null,
        actionData: null,
        step: 'menu',
        bookingData: context.bookingData,
      };
    }
    
    return {
      response: `Which appointment would you like to reschedule? ${context.appointments.map((a: any) => `${a.id}: ${a.service || a.title} on ${new Date(a.date).toLocaleDateString()}`).join(', ')}`,
      action: null,
      actionData: null,
      step: 'selectAppointmentReschedule',
      bookingData: context.bookingData,
    };
  }
  
  // Cancel flow
  if (lowerMessage.includes('cancel')) {
    if (context.appointments.length === 0) {
      return {
        response: 'You don\'t have any appointments to cancel.',
        action: null,
        actionData: null,
        step: 'menu',
        bookingData: context.bookingData,
      };
    }
    
    return {
      response: `Which appointment would you like to cancel? ${context.appointments.map((a: any) => `${a.id}: ${a.service || a.title} on ${new Date(a.date).toLocaleDateString()}`).join(', ')}`,
      action: null,
      actionData: null,
      step: 'selectAppointmentCancel',
      bookingData: context.bookingData,
    };
  }
  
  // Clock in/out
  if (lowerMessage.includes('clock in')) {
    return {
      response: 'I\'ll clock you in now.',
      action: 'clock_in',
      actionData: { staffId: context.user },
      step: 'menu',
      bookingData: context.bookingData,
    };
  }
  
  if (lowerMessage.includes('clock out')) {
    return {
      response: 'I\'ll clock you out now.',
      action: 'clock_out',
      actionData: { staffId: context.user },
      step: 'menu',
      bookingData: context.bookingData,
    };
  }
  
  // Show appointments
  if (lowerMessage.includes('appointments') || lowerMessage.includes('my appointments')) {
    if (context.appointments.length === 0) {
      return {
        response: 'You don\'t have any appointments scheduled.',
        action: null,
        actionData: null,
        step: 'menu',
        bookingData: context.bookingData,
      };
    }
    
    const appointmentList = context.appointments.map((a: any) => 
      `${a.service || a.title} on ${new Date(a.date).toLocaleDateString()} at ${new Date(a.date).toLocaleTimeString()}`
    ).join('\n');
    
    return {
      response: `Your appointments:\n${appointmentList}`,
      action: null,
      actionData: null,
      step: 'menu',
      bookingData: context.bookingData,
    };
  }
  
  // Show services
  if (lowerMessage.includes('services') || lowerMessage.includes('what services')) {
    const serviceList = context.services.map((s: any) => 
      `${s.name || s}${s.price ? ` - $${s.price}` : ''}${s.duration ? ` (${s.duration} min)` : ''}`
    ).join('\n');
    
    return {
      response: `Available services:\n${serviceList}`,
      action: null,
      actionData: null,
      step: 'menu',
      bookingData: context.bookingData,
    };
  }
  
  // Show staff
  if (lowerMessage.includes('staff') || lowerMessage.includes('who is available')) {
    if (context.staff.length === 0) {
      return {
        response: 'No staff members are currently available.',
        action: null,
        actionData: null,
        step: 'menu',
        bookingData: context.bookingData,
      };
    }
    
    const staffList = context.staff.map((s: any) => 
      `${s.name || s.id}${s.specialties ? ` - ${s.specialties}` : ''}`
    ).join('\n');
    
    return {
      response: `Available staff:\n${staffList}`,
      action: null,
      actionData: null,
      step: 'menu',
      bookingData: context.bookingData,
    };
  }
  
  // Default response
  return {
    response: 'I can help you book appointments, reschedule, cancel, clock in/out, or show you available services and staff. What would you like to do?',
    action: null,
    actionData: null,
    step: 'menu',
    bookingData: context.bookingData,
  };
}
