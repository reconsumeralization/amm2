import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const payload = await getPayload({ config: (await import('@/payload.config')).default });

  // 1. Authentication Check: Get user from request headers
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized: No authentication token' }, { status: 401 });
  }
  // const userId = req.user.id; // Not directly used in this AI call, but available if needed for context/logging

  // Input validation
  if (!prompt) {
    return NextResponse.json({ error: 'Missing required field: prompt' }, { status: 400 });
  }

  try {
    const settings = await payload.find({ collection: 'settings', limit: 1 });
    const config = settings.docs[0] || {};

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    let generatedText = '';
    try {
      const response = await openai.chat.completions.create({
        model: config.ai?.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.ai?.maxTokens || 1000,
        temperature: config.ai?.temperature || 0.7,
      });
      generatedText = response.choices[0].message.content || '';
    } catch (openaiError: any) {
      console.error('OpenAI API call failed:', openaiError.response?.data || openaiError.message);
      return NextResponse.json({ error: 'Failed to generate content from AI' }, { status: 500 });
    }

    return NextResponse.json({ text: generatedText });
  } catch (error: any) {
    console.error('Error in AI content API:', error);
    if (error.message.includes('Missing required field')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to generate content due to an internal server error' }, { status: 500 });
  }
}