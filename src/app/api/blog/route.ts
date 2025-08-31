// src/app/api/blog/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
// Dynamic import for payload config

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    const posts = await payload.find({
      collection: 'blog-posts',
      limit: 100, // Add pagination later
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    const data = await req.json();
    const newPost = await payload.create({
      collection: 'blog-posts',
      data,
    });
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
