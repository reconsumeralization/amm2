// src/app/api/blog/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
// Dynamic import for payload config

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    const post = await payload.findByID({
      collection: 'blog-posts',
      id: params.id,
    });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error(`Error fetching post ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    const data = await req.json();
    const updatedPost = await payload.update({
      collection: 'blog-posts',
      id: params.id,
      data,
    });
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error(`Error updating post ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    await payload.delete({
      collection: 'blog-posts',
      id: params.id,
    });
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(`Error deleting post ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
