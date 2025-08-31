// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { createErrorResponse, createSuccessResponse, ERROR_CODES } from '@/lib/api-error-handler';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    const order = await payload.findByID({
      collection: 'orders',
      id: id,
    });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error(`Error fetching order id:`, error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    const data = await req.json();
    const updatedOrder = await payload.update({
      collection: 'orders',
      id: id,
      data,
    });
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(`Error updating order id:`, error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    await payload.delete({
      collection: 'orders',
      id: id,
    });
    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error(`Error deleting order id:`, error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
