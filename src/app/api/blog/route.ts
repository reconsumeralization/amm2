// src/app/api/blog/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
// Dynamic import for payload config

export async function GET(req: NextRequest) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
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
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
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
