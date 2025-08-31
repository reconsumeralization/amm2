import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });

  // 1. Authentication Check: Ensure user is logged in
  if (!req.user) { // Assuming req.user is populated by Payload's auth middleware
    return NextResponse.json({ error: 'Unauthorized: User not authenticated' }, { status: 401 });
  }
  // const userId = req.user.id; // Not directly used in this AI call, but available if needed for context/logging

  // Input validation
  if (!prompt) {
    return NextResponse.json({ error: 'Missing required field: prompt' }, { status: 400 });
  }

  try {
    const settings = await payload.find({ collection: 'settings', limit: 1 });
    const config = settings.docs[0] || {};

    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
    let generatedText = '';
    try {
      const response = await openai.createCompletion({
        model: config.ai.model,
        prompt,
        max_tokens: config.ai.maxTokens,
        temperature: config.ai.temperature,
      });
      generatedText = response.data.choices[0].text || '';
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
