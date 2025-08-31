// src/app/api/services/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const service = await payload.findByID({
      collection: 'services',
      id: id,
    });
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    return NextResponse.json(service);
  } catch (error) {
    console.error(`Error fetching service id:`, error);
    return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const data = await req.json();
    const updatedService = await payload.update({
      collection: 'services',
      id: id,
      data,
    });
    return NextResponse.json(updatedService);
  } catch (error) {
    console.error(`Error updating service id:`, error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    await payload.delete({
      collection: 'services',
      id: id,
    });
    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error(`Error deleting service id:`, error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
