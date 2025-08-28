import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '../../../../payload.config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userId, tenantId, pathname, context } = await req.json();

    if (!userId || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Get user and settings
    const [user, settings] = await Promise.all([
      payload.findByID({ collection: 'users', id: userId }).catch(() => null),
      getSettings(tenantId),
    ]);

    // Check if chatbot is enabled
    if (!settings.chatbot?.enabled) {
      return NextResponse.json({ show: false });
    }

    // Check path restrictions
    const displayPaths = settings.chatbot?.displayPaths || [];
    const isAllowedPath = displayPaths.some(({ path }: any) => 
      pathname ? pathname.startsWith(path) : false
    );

    if (!isAllowedPath) {
      return NextResponse.json({ show: false });
    }

    // Check role restrictions
    const allowedRoles = settings.chatbot?.roles || ['customer', 'staff'];
    const userRole = user?.role || 'customer';

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ show: false });
    }

    // AI-driven visibility decision
    const shouldShow = await determineAIVisibility({
      user,
      settings,
      pathname,
      context,
      userRole,
    });

    return NextResponse.json({ show: shouldShow });
  } catch (error) {
    console.error('Chatbot visibility API error:', error);
    return NextResponse.json(
      { error: 'Failed to determine visibility' },
      { status: 500 }
    );
  }
}

async function determineAIVisibility(data: any) {
  try {
    const {
      user,
      settings,
      pathname,
      context,
      userRole,
    } = data;

    // Check AI triggers from settings
    const aiTriggers = settings.chatbot?.aiTriggers;
    if (aiTriggers) {
      let shouldShow = true;

      // Check pending appointments
      if (aiTriggers.pendingAppointments) {
        const appointments = context?.appointments || 0;
        shouldShow = shouldShow && appointments > 0;
      }

      // Check staff availability
      if (aiTriggers.staffAvailability) {
        const staff = context?.staff || 0;
        shouldShow = shouldShow && staff > 0;
      }

      // Check new services
      if (aiTriggers.newServices) {
        // This would check for recently added services
        // For now, we'll assume there are always services available
        shouldShow = shouldShow && true;
      }

      if (!shouldShow) {
        return false;
      }
    }

    // Use AI to make final decision
    const aiDecision = await getAIVisibilityDecision({
      user,
      settings,
      pathname,
      context,
      userRole,
    });

    return aiDecision;
  } catch (error) {
    console.error('AI visibility determination error:', error);
    // Fallback to showing chatbot
    return true;
  }
}

async function getAIVisibilityDecision(data: any) {
  try {
    const {
      user,
      settings,
      pathname,
      context,
      userRole,
    } = data;

    const systemPrompt = `You are an AI assistant that determines when to show a barbershop chatbot to users.

Consider these factors:
1. User role (customer, staff, admin)
2. Current page/path
3. User behavior patterns
4. Business context (appointments, staff availability, etc.)
5. Time of day and day of week
6. User engagement likelihood

Respond with only "true" or "false" based on whether the chatbot should be shown.`;

    const userPrompt = `User: ${user?.name || 'Unknown'} (${userRole})
Path: ${pathname}
Context: ${JSON.stringify(context)}
Time: ${new Date().toLocaleString()}
Day of week: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
Hour: ${new Date().getHours()}

Should the chatbot be shown? Respond with only "true" or "false".`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    const response = completion.choices[0]?.message?.content?.toLowerCase().trim();
    
    // Parse response
    if (response === 'true') {
      return true;
    } else if (response === 'false') {
      return false;
    } else {
      // Fallback logic based on common patterns
      return getFallbackVisibilityDecision(data);
    }
  } catch (error) {
    console.error('AI visibility decision error:', error);
    return getFallbackVisibilityDecision(data);
  }
}

function getFallbackVisibilityDecision(data: any) {
  const {
    user,
    pathname,
    context,
    userRole,
  } = data;

  // Show for customers on booking-related pages
  if (userRole === 'customer') {
    const bookingPaths = ['/portal', '/book', '/services'];
    if (bookingPaths.some(path => pathname?.startsWith(path))) {
      return true;
    }
  }

  // Show for staff on dashboard/admin pages
  if (userRole === 'staff') {
    const staffPaths = ['/dashboard', '/admin'];
    if (staffPaths.some(path => pathname?.startsWith(path))) {
      return true;
    }
  }

  // Show if user has pending appointments
  if (context?.appointments > 0) {
    return true;
  }

  // Show if staff are available
  if (context?.staff > 0) {
    return true;
  }

  // Default to showing on main pages
  const mainPaths = ['/', '/portal', '/dashboard'];
  return mainPaths.some(path => pathname?.startsWith(path));
}

async function getSettings(tenantId?: string): Promise<any> {
  try {
    const payload = await getPayload({ config });
    
    let settings;
    if (tenantId) {
      settings = await payload.find({
        collection: 'settings',
        where: { tenant: { equals: tenantId } },
        limit: 1,
      });
    } else {
      settings = await payload.find({
        collection: 'settings',
        where: { tenant: { exists: false } },
        limit: 1,
      });
    }

    return settings.docs[0] || {};
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {};
  }
}