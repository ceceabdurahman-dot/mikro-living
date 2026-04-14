// middleware.ts  —  Next.js Edge Middleware
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_CHECK_TIMEOUT_MS = 3000

function getApiBaseUrl() {
  const baseUrl =
    process.env.API_URL ||
    process.env.API_PROXY_TARGET ||
    process.env.NEXT_PUBLIC_API_URL

  return baseUrl ? baseUrl.replace(/\/$/, '') : null
}

function getSafeRedirectTarget(request: NextRequest) {
  const pathWithQuery = `${request.nextUrl.pathname}${request.nextUrl.search}`

  if (!pathWithQuery.startsWith('/') || pathWithQuery.startsWith('//')) {
    return '/cms'
  }

  return pathWithQuery
}

async function hasValidCmsSession(request: NextRequest) {
  const token = request.cookies.get('ml_access_token')?.value
  const baseUrl = getApiBaseUrl()

  if (!token || !baseUrl) {
    return false
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), AUTH_CHECK_TIMEOUT_MS)

  try {
    const response = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
      signal: controller.signal,
    })

    return response.ok
  } catch {
    return false
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Protect /cms routes
  if (pathname.startsWith('/cms')) {
    const hasSession = await hasValidCmsSession(request)

    if (!hasSession) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', getSafeRedirectTarget(request))
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect /admin → /cms
  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/cms', request.url))
  }

  if (pathname === '/login') {
    const hasSession = await hasValidCmsSession(request)

    if (hasSession) {
      const requestedRedirect = searchParams.get('redirect')
      const redirectTarget =
        requestedRedirect && requestedRedirect.startsWith('/') && !requestedRedirect.startsWith('//')
          ? requestedRedirect
          : '/cms'

      return NextResponse.redirect(new URL(redirectTarget, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/cms/:path*', '/admin', '/login'],
}
