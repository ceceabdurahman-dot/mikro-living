import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { AUTH_COOKIE_NAME, isAllowedAuthOrigin, logoutCmsUser } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!isAllowedAuthOrigin(request)) {
    return NextResponse.json(
      { message: 'This sign-out request was blocked because the origin is not allowed.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const token = cookies().get(AUTH_COOKIE_NAME)?.value

  await logoutCmsUser(token)

  const response = NextResponse.json(
    { message: 'Signed out successfully.' },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  )

  response.cookies.delete(AUTH_COOKIE_NAME)

  return response
}
