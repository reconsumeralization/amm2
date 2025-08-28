import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { authRateLimiters, getRateLimitIdentifier, createRateLimitResponse } from '@/lib/auth-ratelimit'

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

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    try {
      const identifier = getRateLimitIdentifier(request, 'api')
      const result = await authRateLimiters.api.check(identifier)

      if (!result.success) {
        return createRateLimitResponse(result)
      }

      // Add rate limit headers to successful requests
      response.headers.set('X-RateLimit-Limit', result.limit.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.reset.toISOString())
      response.headers.set('X-RateLimit-Using-Redis', result.redis ? 'true' : 'false')

    } catch (error) {
      console.error('Rate limiting error in middleware:', error)
      // Continue with request on rate limiting failure to prevent blocking legitimate users
    }
  }

  // Authentication check for protected routes
  const protectedPaths = [
    '/dashboard',
    '/admin',
    '/profile',
    '/settings',
    '/api/protected',
    '/api/user',
    '/api/admin'
  ]

  // Documentation access control - simplified for Edge Runtime
  if (request.nextUrl.pathname.startsWith('/documentation/admin')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    // Only system admins can access admin documentation
    if (!token || token.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/documentation'
      url.searchParams.set('error', 'access_denied')
      url.searchParams.set('section', 'admin')
      return NextResponse.redirect(url)
    }
  }

  const publicAuthPaths = [
    '/auth/signin',
    '/auth/signup',
    '/auth/error',
    '/auth/forgot-password',
    '/auth/reset-password'
  ]

  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  const isPublicAuthPath = publicAuthPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  const isApiAuthPath = request.nextUrl.pathname.startsWith('/api/auth/')

  // Redirect authenticated users away from auth pages
  if (isPublicAuthPath && !isApiAuthPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (token && !request.nextUrl.pathname.includes('/error')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  if (isProtectedPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      url.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Role-based access control
    if (request.nextUrl.pathname.startsWith('/admin') && token.role !== 'admin') {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Add user info to request headers for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', token.sub!)
      requestHeaders.set('x-user-role', token.role as string || 'user')
      requestHeaders.set('x-user-email', token.email as string || '')

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
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
