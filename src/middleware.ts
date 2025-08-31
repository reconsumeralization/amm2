import { NextRequest, NextResponse } from 'next/server'
// import { getToken } from 'next-auth/jwt'
// import { authRateLimiters, getRateLimitIdentifier, createRateLimitResponse } from '@/lib/auth-ratelimit'
// import { canAccessRoute, ROLES, getUnauthorizedRedirect } from '@/lib/auth-utils'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')

  // CSRF protection
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')

    if (origin && !origin.includes(host || '')) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // Cache control for static assets
  if (request.nextUrl.pathname.startsWith('/_next/static/') ||
      request.nextUrl.pathname.startsWith('/images/') ||
      request.nextUrl.pathname.endsWith('.png') ||
      request.nextUrl.pathname.endsWith('.jpg') ||
      request.nextUrl.pathname.endsWith('.jpeg') ||
      request.nextUrl.pathname.endsWith('.gif') ||
      request.nextUrl.pathname.endsWith('.svg')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // PWA service worker
  if (request.nextUrl.pathname === '/sw.js') {
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
    response.headers.set('Service-Worker-Allowed', '/')
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
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
