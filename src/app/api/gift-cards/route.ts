// src/app/api/gift-cards/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
// Dynamic import for payload config

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    const giftCards = await payload.find({
      collection: 'gift-cards',
      limit: 100, // Add pagination later
    });
    return NextResponse.json(giftCards);
  } catch (error) {
    console.error('Error fetching gift cards:', error);
    return NextResponse.json({ error: 'Failed to fetch gift cards' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    const data = await req.json();
    const newGiftCard = await payload.create({
      collection: 'gift-cards',
      data,
    });
    return NextResponse.json(newGiftCard, { status: 201 });
  } catch (error) {
    console.error('Error creating gift card:', error);
    return NextResponse.json({ error: 'Failed to create gift card' }, { status: 500 });
  }
}
