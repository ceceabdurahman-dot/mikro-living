import { cookies } from 'next/headers'

import { siteMeta } from '@/lib/site-data'

type JsonRecord = Record<string, unknown>

export type CmsUser = {
  id: string
  name: string
  email: string
  role: string
}

type AuthResult<T> = {
  data?: T
  message: string
  ok: boolean
  status: number
}

const AUTH_REQUEST_TIMEOUT_MS = 5000
export const AUTH_COOKIE_NAME = 'ml_access_token'

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getString(record: JsonRecord, keys: string[], fallback = '') {
  for (const key of keys) {
    const value = record[key]

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return fallback
}

function unwrapPayload(payload: unknown): unknown {
  let current = payload

  while (isRecord(current) && 'data' in current && current.data !== undefined) {
    current = current.data
  }

  return current
}

function getApiBaseUrl() {
  const baseUrl = process.env.API_URL || process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_URL

  return baseUrl ? baseUrl.replace(/\/$/, '') : null
}

function getMessageFromPayload(payload: unknown, fallback: string) {
  if (!isRecord(payload)) {
    return fallback
  }

  return getString(payload, ['message', 'error'], fallback)
}

function getUserRecord(payload: unknown) {
  const unwrapped = unwrapPayload(payload)

  if (!isRecord(unwrapped)) {
    return null
  }

  const user = unwrapped.user

  if (isRecord(user)) {
    return user
  }

  return unwrapped
}

function getAccessToken(payload: unknown) {
  const unwrapped = unwrapPayload(payload)

  if (!isRecord(unwrapped)) {
    return ''
  }

  return getString(unwrapped, ['accessToken', 'access_token', 'token'])
}

function getTokenMaxAge(token: string) {
  try {
    const [, encodedPayload] = token.split('.')

    if (!encodedPayload) {
      return undefined
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))

    if (!isRecord(payload) || typeof payload.exp !== 'number') {
      return undefined
    }

    const maxAge = payload.exp - Math.floor(Date.now() / 1000)

    return maxAge > 0 ? maxAge : undefined
  } catch {
    return undefined
  }
}

async function fetchAuthJson(path: string, init?: RequestInit) {
  const baseUrl = getApiBaseUrl()

  if (!baseUrl) {
    throw new Error('Authentication API is not configured.')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
      signal: controller.signal,
    })

    let payload: unknown = null

    try {
      payload = await response.json()
    } catch {
      payload = null
    }

    return { payload, response }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Authentication request to ${path} timed out after ${AUTH_REQUEST_TIMEOUT_MS}ms.`)
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export function normalizeRedirectTarget(value: unknown, fallback = '/cms') {
  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()

  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback
  }

  return trimmed
}

export function isAllowedAuthOrigin(request: Request) {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL || siteMeta.url
  const allowedOrigins = new Set(
    [configuredOrigin, siteMeta.url, 'http://localhost:3000', 'http://127.0.0.1:3000']
      .filter(Boolean)
      .map((value) => value.replace(/\/$/, '')),
  )

  const origin = request.headers.get('origin')

  if (origin && !allowedOrigins.has(origin.replace(/\/$/, ''))) {
    return false
  }

  const referer = request.headers.get('referer')

  if (!referer) {
    return true
  }

  try {
    return allowedOrigins.has(new URL(referer).origin.replace(/\/$/, ''))
  } catch {
    return false
  }
}

export function getCmsSessionCookieOptions(token: string) {
  const maxAge = getTokenMaxAge(token)

  return {
    httpOnly: true,
    maxAge,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  }
}

export function mapCmsUser(payload: unknown): CmsUser | null {
  const user = getUserRecord(payload)

  if (!user) {
    return null
  }

  const email = getString(user, ['email'])

  if (!email) {
    return null
  }

  const name =
    getString(user, ['name', 'full_name', 'fullName', 'username']) || email.split('@')[0] || 'Studio Admin'

  return {
    id:
      getString(user, ['id', 'user_id', 'userId', 'uuid']) ||
      email,
    name,
    email,
    role: getString(user, ['role'], 'Admin'),
  }
}

export async function loginCmsUser(email: string, password: string): Promise<AuthResult<{ token: string; user: CmsUser | null }>> {
  try {
    const { payload, response } = await fetchAuthJson('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: getMessageFromPayload(payload, 'The provided credentials could not be verified.'),
      }
    }

    const token = getAccessToken(payload)

    if (!token) {
      return {
        ok: false,
        status: 502,
        message: 'Authentication succeeded but no access token was returned by the backend.',
      }
    }

    const user = await getCurrentCmsUser(token)

    return {
      ok: true,
      status: response.status,
      message: getMessageFromPayload(payload, 'Signed in successfully.'),
      data: { token, user },
    }
  } catch {
    return {
      ok: false,
      status: 503,
      message: 'The authentication service is unreachable right now. Please try again shortly.',
    }
  }
}

export async function getCurrentCmsUser(token?: string | null) {
  if (!token) {
    return null
  }

  try {
    const { payload, response } = await fetchAuthJson('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return null
    }

    return mapCmsUser(payload)
  } catch {
    return null
  }
}

export async function getCurrentCmsUserFromCookies() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value

  return getCurrentCmsUser(token)
}

export async function logoutCmsUser(token?: string | null) {
  if (!token) {
    return
  }

  try {
    await fetchAuthJson('/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    // Best-effort logout; the local cookie will still be cleared.
  }
}
