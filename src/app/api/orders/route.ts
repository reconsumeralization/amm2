// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload();
    const orders = await payload.find({
      collection: 'orders',
      limit: 100, // Add pagination later
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload();
    const data = await req.json();
    const newOrder = await payload.create({
      collection: 'orders',
      data,
    });
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
