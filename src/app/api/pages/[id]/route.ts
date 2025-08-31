// src/app/api/pages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload();
    const page = await payload.findByID({
      collection: 'pages',
      id: params.id,
    });
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json(page);
  } catch (error) {
    console.error(`Error fetching page ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload();
    const data = await req.json();
    const updatedPage = await payload.update({
      collection: 'pages',
      id: params.id,
      data,
    });
    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error(`Error updating page ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload();
    await payload.delete({
      collection: 'pages',
      id: params.id,
    });
    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error(`Error deleting page ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
