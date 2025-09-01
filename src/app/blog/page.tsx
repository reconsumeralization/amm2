// src/app/blog/page.tsx
import Link from 'next/link';
import { BlogPostCard } from '@/components/features/barber/BlogPostCard';
import { BarberHeader } from '@/components/features/barber/Header';
import { Footer as BarberFooter } from '@/components/features/barber/Footer';

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL;

async function fetchPosts() {
  try {
    const res = await fetch(`${PAYLOAD_URL}/api/blog-posts?where[published][equals]=true&sort=-publishedAt`, {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      console.warn('Blog API not available, returning empty posts');
      return [];
    }

    const json = await res.json();
    return json.docs || [];
  } catch (error) {
    console.warn('Error fetching blog posts:', error);
    // Return empty array instead of throwing error
    return [];
  }
}

export default async function BlogPage() {
  const posts = await fetchPosts();

  return (
    <>
      <BarberHeader />
      <main className="section-premium">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-8">Blog</h1>
          {posts.length > 0 ? (
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
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Blog Posts Yet</h2>
                <p className="text-gray-600">
                  We're working on creating amazing content for you. Check back soon for the latest updates and insights from Modern Men BarberShop.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <BarberFooter />
    </>
  );
}
