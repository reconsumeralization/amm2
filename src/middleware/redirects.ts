// src/middleware/redirects.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/payload'

export async function handleRedirects(request: NextRequest) {
  const { pathname } = new URL(request.url)

  try {
    const payload = await getPayloadClient()

    // Find active redirect for this path
    const redirects = await payload.find({
      collection: 'redirects',
      where: {
        from: { equals: pathname },
        active: { equals: true },
      },
      limit: 1,
    })

    if (redirects.totalDocs > 0) {
      const redirect = redirects.docs[0]

      // Update hit count
      await payload.update({
        collection: 'redirects',
        id: redirect.id,
        data: {
          hits: (redirect.hits || 0) + 1,
          lastHit: new Date().toISOString(),
        },
      })

      // Determine redirect status code
      const statusCode = redirect.status === '302' ? 302 : 301

      // Handle relative URLs
      let redirectUrl = redirect.to
      if (redirect.to.startsWith('/')) {
        // Relative URL - keep on same domain
        const url = new URL(request.url)
        redirectUrl = `${url.origin}${redirect.to}`
      }

      return NextResponse.redirect(redirectUrl, statusCode)
    }
  } catch (error) {
    console.error('Redirect middleware error:', error)
    // Continue to next middleware/page if redirect lookup fails
  }

  return null // No redirect found, continue to next middleware
}
