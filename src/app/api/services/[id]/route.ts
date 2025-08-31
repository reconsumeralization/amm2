// src/app/api/services/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    const service = await payload.findByID({
      collection: 'services',
      id: params.id,
    });
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    return NextResponse.json(service);
  } catch (error) {
    console.error(`Error fetching service ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    const data = await req.json();
    const updatedService = await payload.update({
      collection: 'services',
      id: params.id,
      data,
    });
    return NextResponse.json(updatedService);
  } catch (error) {
    console.error(`Error updating service ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    await payload.delete({
      collection: 'services',
      id: params.id,
    });
    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error(`Error deleting service ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
