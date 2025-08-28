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

    // Validate required fields
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (!userId || !tenantId) {
      return NextResponse.json(
        { error: 'User ID and Tenant ID are required' },
        { status: 400 }
      );
    }

    // Rate limiting check (simple implementation)
    const rateLimitKey = `chatbot:${userId}:${Date.now()}`;
    
    try {
      const payload = await getPayload({ config });

      // Verify user exists and is active
      const user = await payload.findByID({
        collection: 'users',
        id: userId
      }).catch(() => null);

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Create enhanced context for AI
      const context = {
        user: {
          id: userId,
          name: user.name,
          email: user.email,
          role: user.role || 'customer',
        },
        tenant: tenantId,
        currentStep: step || 'menu',
        bookingData: bookingData || {},
        appointments: Array.isArray(appointments) ? appointments : [],
        staff: Array.isArray(staff) ? staff : [],
        services: Array.isArray(services) ? services : [],
        settings: settings || {},
        timestamp: new Date().toISOString(),
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
          'get_availability',
          'calculate_price',
          'check_loyalty_points',
        ],
      };

      // Log the conversation for analytics
      await logConversation({
        userId,
        tenantId,
        message: message.trim(),
        step,
        timestamp: new Date(),
      });

      // Generate AI response
      const aiResponse = await generateAIResponse(message.trim(), context);

      return NextResponse.json(aiResponse);
    } catch (payloadError) {
      console.error('Payload error:', payloadError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        message: 'I apologize, but I\'m having technical difficulties right now. Please try again in a moment.'
      },
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

// Log conversation for analytics and debugging
async function logConversation(data: {
  userId: string;
  tenantId: string;
  message: string;
  step: string;
  timestamp: Date;
}) {
  try {
    // For now, just console log. In production, you might want to store in a database
    console.log('Chatbot conversation:', {
      userId: data.userId,
      tenantId: data.tenantId,
      message: data.message.substring(0, 100) + (data.message.length > 100 ? '...' : ''),
      step: data.step,
      timestamp: data.timestamp.toISOString(),
    });

    // Optionally store in analytics collection
    // const payload = await getPayload({ config });
    // await payload.create({
    //   collection: 'chatbot-logs',
    //   data: data
    // });
  } catch (error) {
    console.warn('Failed to log conversation:', error);
  }
}

function generateFallbackResponse(message: string, context: any) {
  const lowerMessage = message.toLowerCase();
  
  // Greeting responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    const userName = context.user?.name ? `, ${context.user.name.split(' ')[0]}` : '';
    return {
      response: `Hello${userName}! I'm your ModernMen assistant. I can help you book appointments, check schedules, manage your account, or answer questions about our services. What would you like to do today?`,
      action: null,
      actionData: null,
      step: 'menu',
      bookingData: context.bookingData,
    };
  }

  // Help responses
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    const capabilities = [
      '📅 Book, reschedule, or cancel appointments',
      '👥 View available staff and their specialties',
      '✂️ Browse our services and prices',
      '🕒 Check your appointment history',
      '💰 Calculate service costs',
      '🎯 Get personalized recommendations',
    ];
    
    if (context.user?.role === 'staff') {
      capabilities.push('🕐 Clock in and out', '📊 View your schedule');
    }
    
    return {
      response: `I can help you with:\n\n${capabilities.join('\n')}\n\nJust tell me what you'd like to do!`,
      action: null,
      actionData: null,
      step: 'menu',
      bookingData: context.bookingData,
    };
  }

  // Booking flow
  if (lowerMessage.includes('book') || lowerMessage.includes('appointment')) {
    if (!context.bookingData.service) {
      const servicesText = context.services.length > 0 
        ? `Available services:\n${context.services.map((s: any) => 
            `• ${s.name || s}${s.price ? ` - $${s.price}` : ''}${s.duration ? ` (${s.duration} min)` : ''}`
          ).join('\n')}`
        : 'Let me check our available services for you.';
      
      return {
        response: `What service would you like to book?\n\n${servicesText}`,
        action: null,
        actionData: null,
        step: 'selectService',
        bookingData: context.bookingData,
      };
    }
    
    if (!context.bookingData.date) {
      return {
        response: `Great choice! When would you like to schedule your ${context.bookingData.service}? Please let me know your preferred date and time (e.g., "Tomorrow at 2 PM" or "January 15th at 10:00 AM").`,
        action: null,
        actionData: null,
        step: 'selectDate',
        bookingData: context.bookingData,
      };
    }
    
    return {
      response: 'Perfect! Let me book that appointment for you.',
      action: 'book_appointment',
      actionData: context.bookingData,
      step: 'menu',
      bookingData: {},
    };
  }

  // Price inquiries
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
    const priceInfo = context.services.filter((s: any) => s.price).map((s: any) => 
      `${s.name}: $${s.price}${s.duration ? ` (${s.duration} min)` : ''}`
    );
    
    if (priceInfo.length > 0) {
      return {
        response: `Here are our current prices:\n\n${priceInfo.join('\n')}\n\nPrices may vary based on hair length and specific requirements. Would you like to book a service?`,
        action: null,
        actionData: null,
        step: 'menu',
        bookingData: context.bookingData,
      };
    }
    
    return {
      response: 'Let me get you our current pricing information. What specific service are you interested in?',
      action: 'show_services',
      actionData: null,
      step: 'menu',
      bookingData: context.bookingData,
    };
  }

  // Hours and availability
  if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('available') || lowerMessage.includes('when')) {
    return {
      response: 'We\'re typically open Monday-Saturday, 9 AM to 7 PM, and Sunday 10 AM to 5 PM. However, availability can vary. Would you like me to check specific times for booking an appointment?',
      action: 'suggest_times',
      actionData: null,
      step: 'menu',
      bookingData: context.bookingData,
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
