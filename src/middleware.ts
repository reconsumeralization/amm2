import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { canAccessRoute, getUnauthorizedRedirect, UserRole } from '@/lib/auth-constants'

export async function middleware(request: NextRequest) {
  // Skip middleware for static assets and API routes that don't need auth
  const pathname = request.nextUrl.pathname
  
  // Skip for static assets
  if (pathname.startsWith('/_next/static/') ||
      pathname.startsWith('/images/') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.jpeg') ||
      pathname.endsWith('.gif') ||
      pathname.endsWith('.svg') ||
      pathname.endsWith('.ico') ||
      pathname === '/sw.js' ||
      pathname === '/manifest.json') {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return response
  }

  // Skip for public API routes
  if (pathname.startsWith('/api/auth/') ||
      pathname === '/api/healthcheck' ||
      pathname === '/api/contact-form') {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  // CSRF protection for state-changing requests
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE' || request.method === 'PATCH') {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')

    if (origin && !origin.includes(host || '')) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // Authentication check for protected routes
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    const userRole = token?.role as UserRole | undefined

    // Check if user can access the requested route
    if (!canAccessRoute(userRole, pathname)) {
      const redirectUrl = getUnauthorizedRedirect(userRole, pathname)
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    // Add user context to request headers for API routes
    if (token && pathname.startsWith('/api/')) {
      response.headers.set('X-User-Id', token.sub || '')
      response.headers.set('X-User-Role', token.role as string || '')
    }
  } catch (error) {
    console.error('Middleware authentication error:', error)
    // If auth check fails, redirect to sign in for protected routes
    if (pathname.startsWith('/admin/') || pathname.startsWith('/portal/')) {
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (handled in middleware logic)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|robots.txt|sitemap.xml).*)',
  ],
}
