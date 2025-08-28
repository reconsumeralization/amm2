import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';

export async function POST(req: Request) {
  const { tenantId, service, preferences } = await req.json(); // userId will come from req.user
  const payload = await getPayload({ config: await import('../../../../../payload.config') });

  // 1. Authentication Check: Ensure user is logged in
  if (!req.user) { // Assuming req.user is populated by Payload's auth middleware
    return NextResponse.json({ error: 'Unauthorized: User not authenticated' }, { status: 401 });
  }
  const userId = req.user.id; // Use authenticated user's ID

  // Input validation
  if (!tenantId || !service || !preferences) {
    return NextResponse.json({ error: 'Missing required fields: tenantId, service, preferences' }, { status: 400 });
  }

  try {
    const settings = await payload.find({
      collection: 'settings',
      where: tenantId ? { tenant: { equals: tenantId } } : { tenant: { exists: false } },
      limit: 1,
    });
    const config = settings.docs[0]; // No fallback, if settings not found, it's an error

    if (!config) {
      return NextResponse.json({ error: 'Settings not found for this tenant' }, { status: 404 });
    }

    const appointments = await payload.find({
      collection: 'appointments',
      where: { tenant: { equals: tenantId } },
    });
    const schedules = await payload.find({
      collection: 'staff-schedules',
      where: { tenant: { equals: tenantId }, available: { equals: true } },
    });

    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
    const prompt = `
      Suggest 3 optimal appointment times for a ${service || 'any'} service:
      - Existing appointments: ${JSON.stringify(appointments.docs.map((a: any) => a.date))}
      - Staff schedules: ${JSON.stringify(schedules.docs.map((s: any) => ({ start: s.startTime, end: s.endTime })))}      - Tenant availability: ${config.barbershop?.availability ? JSON.stringify(config.barbershop.availability) : 'default 9 AM-5 PM'}
      - Preferences: ${JSON.stringify(preferences)}
      Return a JSON array of times in "YYYY-MM-DD HH:MM AM/PM" format.
    `;

    let suggestedTimes = [];
    try {
      const response = await openai.createCompletion({
        model: config.ai.model,
        prompt,
        max_tokens: config.ai.maxTokens,
        temperature: config.ai.temperature,
      });
      suggestedTimes = JSON.parse(response.data.choices[0].text || '[]');
    } catch (openaiError: any) {
      console.error('OpenAI API call failed:', openaiError.response?.data || openaiError.message);
      return NextResponse.json({ error: 'Failed to generate suggestions from AI' }, { status: 500 });
    }

    return NextResponse.json({ times: suggestedTimes });
  } catch (error: any) {
    console.error('Error in AI schedule suggestions API:', error);
    if (error.message.includes('Missing required fields')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message.includes('Settings not found')) {
      return NextResponse.json({ error: 'Settings not found for this tenant' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to generate suggestions due to an internal server error' }, { status: 500 });
  }
}