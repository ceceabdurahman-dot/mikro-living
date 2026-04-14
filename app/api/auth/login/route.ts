import { NextResponse } from 'next/server'

import {
  AUTH_COOKIE_NAME,
  getCmsSessionCookieOptions,
  isAllowedAuthOrigin,
  loginCmsUser,
  normalizeRedirectTarget,
} from '@/lib/auth'

export const runtime = 'nodejs'

type LoginPayload = {
  email?: unknown
  password?: unknown
  redirect?: unknown
}

export async function POST(request: Request) {
  if (!isAllowedAuthOrigin(request)) {
    return NextResponse.json(
      { message: 'This sign-in request was blocked because the origin is not allowed.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  let payload: LoginPayload

  try {
    payload = (await request.json()) as LoginPayload
  } catch {
    return NextResponse.json(
      { message: 'The sign-in request body is invalid.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const email = typeof payload.email === 'string' ? payload.email.trim() : ''
  const password = typeof payload.password === 'string' ? payload.password : ''
  const redirect = normalizeRedirectTarget(payload.redirect)

  if (!email || !password) {
    return NextResponse.json(
      { message: 'Email and password are required to sign in.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const result = await loginCmsUser(email, password)

  if (!result.ok || !result.data?.token) {
    return NextResponse.json(
      { message: result.message },
      { status: result.status, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const response = NextResponse.json(
    {
      message: result.message,
      redirect,
      user: result.data.user,
    },
    { status: result.status, headers: { 'Cache-Control': 'no-store' } },
  )

  response.cookies.set(AUTH_COOKIE_NAME, result.data.token, getCmsSessionCookieOptions(result.data.token))

  return response
}
