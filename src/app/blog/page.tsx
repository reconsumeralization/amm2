// src/app/blog/page.tsx
import Link from 'next/link';
import { BlogPostCard } from '@/components/features/barber/BlogPostCard';
import { BarberHeader } from '@/components/features/barber/Header';
import { Footer as BarberFooter } from '@/components/features/barber/Footer';

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL;

async function fetchPosts() {
  const res = await fetch(`${PAYLOAD_URL}/api/blog-posts?where[published][equals]=true&sort=-publishedAt`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch posts');
  const json = await res.json();
  return json.docs;
}

export default async function BlogPage() {
  const posts = await fetchPosts();

  return (
    <>
      <BarberHeader />
      <main className="section-premium">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-8">Blog</h1>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p: any) => (
              <BlogPostCard
                key={p.id}
                title={p.title}
                excerpt={p.excerpt}
                href={`/blog/${p.slug}`}
              />
            ))}
          </div>
        </div>
      </main>
      <BarberFooter />
    </>
  );
}
