// src/app/api/blog/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
// Dynamic import for payload config

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const post = await payload.findByID({
      collection: 'blog-posts',
      id: id,
    });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error(`Error fetching post ${await params.then(p => p.id)}:`, error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const data = await req.json();
    const updatedPost = await payload.update({
      collection: 'blog-posts',
      id: id,
      data,
    });
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error(`Error updating post ${await params.then(p => p.id)}:`, error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    await payload.delete({
      collection: 'blog-posts',
      id: id,
    });
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(`Error deleting post ${await params.then(p => p.id)}:`, error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
