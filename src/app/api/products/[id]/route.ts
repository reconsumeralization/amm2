// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload();
    const product = await payload.findByID({
      collection: 'products',
      id: params.id,
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error(`Error fetching product ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload();
    const data = await req.json();
    const updatedProduct = await payload.update({
      collection: 'products',
      id: params.id,
      data,
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(`Error updating product ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload();
    await payload.delete({
      collection: 'products',
      id: params.id,
    });
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(`Error deleting product ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
