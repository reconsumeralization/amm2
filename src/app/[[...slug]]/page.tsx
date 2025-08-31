import type { Metadata } from 'next'
import { getPayload } from 'payload'
import ContentRenderer from '@/components/ContentRenderer'

type Params = {
  slug?: string[]
}

async function getPageBySlug(slugPath: string) {
  const payload = await getPayload({ config: (await import('../../payload.config')).default })
  const pages = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: slugPath },
    },
    depth: 1,
    limit: 1,
  })

  return pages.docs?.[0]
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const slugPath = (params.slug || []).join('/') || 'home'
  const page = await getPageBySlug(slugPath)

  if (!page) {
    return {
      title: 'Page Not Found',
      description: 'The requested page does not exist.',
    }
  }

  const seo = page.seo || {}
  const title = seo.metaTitle || page.title || 'ModernMen'
  const description = seo.metaDescription || ''

  const metadata: Metadata = {
    title,
    description,
  }

  // Canonical URL and OG can be added if present
  if (seo.canonicalUrl) {
    metadata.alternates = { canonical: seo.canonicalUrl }
  }
  if (seo.ogImage && (seo.ogImage as any).url) {
    metadata.openGraph = {
      images: [{ url: (seo.ogImage as any).url as string }],
      title,
      description,
    }
  }

  return metadata
}

export default async function CatchAllPage({ params }: { params: Params }) {
  const slugPath = (params.slug || []).join('/') || 'home'
  const page = await getPageBySlug(slugPath)

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6">Page Not Found</h1>
        <p>The requested page does not exist.</p>
      </div>
    )
  }

  // Resolve related content
  const contentDoc = page.content && typeof page.content === 'object' ? page.content : null

  const renderData = contentDoc?.lexicalContent || contentDoc?.content || null

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">{page.title}</h1>
      <div>
        <ContentRenderer content={renderData} />
      </div>
    </div>
  )
}

