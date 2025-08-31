// src/app/api/gift-cards/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
// Dynamic import for payload config

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    const giftCard = await payload.findByID({
      collection: 'gift-cards',
      id: params.id,
    });
    if (!giftCard) {
      return NextResponse.json({ error: 'Gift card not found' }, { status: 404 });
    }
    return NextResponse.json(giftCard);
  } catch (error) {
    console.error(`Error fetching gift card ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch gift card' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    const data = await req.json();
    const updatedGiftCard = await payload.update({
      collection: 'gift-cards',
      id: params.id,
      data,
    });
    return NextResponse.json(updatedGiftCard);
  } catch (error) {
    console.error(`Error updating gift card ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update gift card' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    await payload.delete({
      collection: 'gift-cards',
      id: params.id,
    });
    return NextResponse.json({ message: 'Gift card deleted successfully' });
  } catch (error) {
    console.error(`Error deleting gift card ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete gift card' }, { status: 500 });
  }
}
