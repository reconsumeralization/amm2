import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(req: Request) {
  const { tenantId, service, preferences } = await req.json(); // userId will come from req.user
  const payload = await getPayload({ config: (await import('@/payload.config')).default });

  // 1. Authentication Check: Get user from request headers
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized: No authentication token' }, { status: 401 });
  }
  // In real implementation, decode userId from auth token
  const userId = 'mock-user-id'; // Mock for now

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

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `
      Suggest 3 optimal appointment times for a ${service || 'any'} service:
      - Existing appointments: ${JSON.stringify(appointments.docs.map((a: any) => a.date))}
      - Staff schedules: ${JSON.stringify(schedules.docs.map((s: any) => ({ start: s.startTime, end: s.endTime })))}      - Tenant availability: ${config.barbershop?.availability ? JSON.stringify(config.barbershop.availability) : 'default 9 AM-5 PM'}
      - Preferences: ${JSON.stringify(preferences)}
      Return a JSON array of times in "YYYY-MM-DD HH:MM AM/PM" format.
    `;

    let suggestedTimes = [];
    try {
      const response = await openai.chat.completions.create({
        model: config.ai?.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.ai?.maxTokens || 1000,
        temperature: config.ai?.temperature || 0.7,
      });
      suggestedTimes = JSON.parse(response.choices[0].message.content || '[]');
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