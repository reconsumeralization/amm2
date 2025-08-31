// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload();
    const order = await payload.findByID({
      collection: 'orders',
      id: params.id,
    });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error(`Error fetching order ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload();
    const data = await req.json();
    const updatedOrder = await payload.update({
      collection: 'orders',
      id: params.id,
      data,
    });
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(`Error updating order ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload();
    await payload.delete({
      collection: 'orders',
      id: params.id,
    });
    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error(`Error deleting order ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
