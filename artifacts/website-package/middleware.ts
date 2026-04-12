// middleware.ts  —  Next.js Edge Middleware
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /cms routes
  if (pathname.startsWith('/cms')) {
    const token = request.cookies.get('ml_access_token')?.value

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect /admin → /cms
  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/cms', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/cms/:path*', '/admin'],
}
