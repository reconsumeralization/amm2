import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';

export async function POST(req: Request) {
  const { tenantId, pathname, aiTriggers } = await req.json(); // userId will come from req.user
  const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });

  // 1. Authentication Check: Ensure user is logged in
  if (!req.user) { // Assuming req.user is populated by Payload's auth middleware
    return NextResponse.json({ error: 'Unauthorized: User not authenticated' }, { status: 401 });
  }
  const userId = req.user.id; // Use authenticated user's ID

  // Input validation
  if (!tenantId || !pathname || !aiTriggers) {
    return NextResponse.json({ error: 'Missing required fields: tenantId, pathname, aiTriggers' }, { status: 400 });
  }

  try {
    const settings = await payload.find({
      collection: 'settings',
      where: tenantId ? { tenant: { equals: tenantId } } : { tenant: { exists: false } },
      limit: 1,
    });
    const config = settings.docs[0] || {};

    const user = await payload.findByID({ collection: 'users', id: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const appointments = await payload.find({
      collection: 'appointments',
      where: { user: { equals: userId }, status: { equals: 'pending' } },
    });
    const schedules = await payload.find({
      collection: 'staff-schedules',
      where: { tenant: { equals: tenantId }, available: { equals: true } },
    });

    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
    const prompt = `
      Should the chatbot be displayed for a user with role "${user.role}" on page "${pathname}"?
      - User has ${appointments.totalDocs} pending appointments.
      - Tenant has ${schedules.totalDocs} available staff schedules.
      - Triggers: pendingAppointments=${aiTriggers.pendingAppointments}, staffAvailability=${aiTriggers.staffAvailability}.
      - Show if: user is a customer with pending appointments, or staff on /portal, or on /book with available schedules.
      Return a JSON object: { show: boolean }
    `;

    let show = false;
    try {
      const response = await openai.createCompletion({
        model: config.ai.model,
        prompt,
        max_tokens: config.ai.maxTokens,
        temperature: config.ai.temperature,
      });
      const parsedResponse = JSON.parse(response.data.choices[0].text || '{ "show": false }');
      show = parsedResponse.show;
    } catch (openaiError: any) {
      console.error('OpenAI API call failed:', openaiError.response?.data || openaiError.message);
      // Fallback logic if AI fails
      // For example, show chatbot if user has pending appointments regardless of AI
      if (aiTriggers.pendingAppointments && appointments.totalDocs > 0) {
        show = true;
      }
    }

    return NextResponse.json({ show });
  } catch (error: any) {
    console.error('Error in chatbot-visibility API:', error);
    if (error.message.includes('Missing required fields')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message.includes('User not found')) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to determine chatbot visibility due to an internal server error' }, { status: 500 });
  }
}