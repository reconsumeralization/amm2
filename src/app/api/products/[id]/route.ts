// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
import { createErrorResponse, createSuccessResponse, ERROR_CODES } from '@/lib/api-error-handler';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await getPayloadClient();
    const product = await payload.findByID({
      collection: 'products',
      id: id,
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error(`Error fetching product id:`, error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await getPayloadClient();
    const data = await req.json();
    const updatedProduct = await payload.update({
      collection: 'products',
      id: id,
      data,
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(`Error updating product id:`, error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await getPayloadClient();
    await payload.delete({
      collection: 'products',
      id: id,
    });
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(`Error deleting product id:`, error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
