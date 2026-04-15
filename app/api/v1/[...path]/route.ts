import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

function getBackendApiBaseUrl() {
  const baseUrl = process.env.API_URL || process.env.API_PROXY_TARGET

  return baseUrl ? baseUrl.replace(/\/$/, '') : null
}

function buildTargetUrl(request: NextRequest, path: string[]) {
  const baseUrl = getBackendApiBaseUrl()

  if (!baseUrl) {
    return null
  }

  const joinedPath = path.join('/')
  const targetUrl = new URL(`${baseUrl}/${joinedPath}`)

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value)
  })

  return targetUrl
}

function isLoopingBackToPublicOrigin(request: NextRequest, targetUrl: URL) {
  const publicApiPrefix = `${request.nextUrl.origin}/api/v1`

  return targetUrl.toString().startsWith(publicApiPrefix)
}

function copyRequestHeaders(request: NextRequest) {
  const headers = new Headers()

  ;['accept', 'authorization', 'content-type', 'user-agent'].forEach((headerName) => {
    const value = request.headers.get(headerName)

    if (value) {
      headers.set(headerName, value)
    }
  })

  const forwardedFor = request.headers.get('x-forwarded-for')

  if (forwardedFor) {
    headers.set('x-forwarded-for', forwardedFor)
  }

  return headers
}

function copyResponseHeaders(response: Response) {
  const headers = new Headers()

  response.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value)
    }
  })

  headers.set('Cache-Control', 'no-store')

  return headers
}

async function proxyToBackend(request: NextRequest, path: string[]) {
  const targetUrl = buildTargetUrl(request, path)

  if (!targetUrl) {
    return NextResponse.json(
      { message: 'Backend API is not configured for same-domain proxying.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  if (isLoopingBackToPublicOrigin(request, targetUrl)) {
    return NextResponse.json(
      { message: 'Backend API target points back to the public same-domain route and would loop.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const method = request.method.toUpperCase()
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.arrayBuffer()

  try {
    const response = await fetch(targetUrl, {
      method,
      headers: copyRequestHeaders(request),
      body,
      cache: 'no-store',
      redirect: 'manual',
    })

    return new NextResponse(response.body, {
      status: response.status,
      headers: copyResponseHeaders(response),
    })
  } catch {
    return NextResponse.json(
      { message: 'The backend API is unreachable right now.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}

type RouteContext = {
  params: {
    path: string[]
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context.params.path)
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context.params.path)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context.params.path)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context.params.path)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context.params.path)
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context.params.path)
}
