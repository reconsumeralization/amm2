// src/app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import RenderRichText from '@/components/RenderRichText';
import { BarberHeader } from '@/components/features/barber/Header';
import { Footer as BarberFooter } from '@/components/features/barber/Footer';

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL;

async function fetchPost(slug: string) {
  const res = await fetch(`${PAYLOAD_URL}/api/blog-posts?where[slug][equals]=${encodeURIComponent(slug)}&depth=2`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch post');
  const json = await res.json();
  return json.docs?.[0] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const seo = post.seo || {};
  return {
    title: seo.metaTitle || post.title,
    description: seo.metaDescription || post.excerpt,
    openGraph: {
      title: seo.metaTitle || post.title,
      description: seo.metaDescription || post.excerpt,
      images: seo.ogImage?.url ? [seo.ogImage.url] : post.hero?.url ? [post.hero.url] : [],
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post || !post.published) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404 - Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
          <Link href="/blog" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <BarberHeader />
      <main className="section-premium">
        <div className="max-w-4xl mx-auto px-4">
          <article>
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-black dark:text-white mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
                {post.author && <span>By {post.author.name}</span>}
                {post.tags?.length > 0 && (
                  <div className="flex gap-2">
                    {post.tags.map((tag: any, idx: number) => (
                      <span key={idx} className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {tag.tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </header>

            {post.hero?.url && (
              <Image
                src={post.hero.url}
                alt={post.title}
                width={800}
                height={256}
                className="w-full h-64 object-cover rounded-lg mb-8"
              />
            )}

            <div className="prose max-w-none dark:prose-invert">
              <RenderRichText content={post.content} />
            </div>
          </article>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <Link href="/blog" className="text-red-600 hover:text-red-700 font-medium">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </main>
      <BarberFooter />
    </>
  );
}
