const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'
const API_PATHNAME = (() => {
  try {
    return new URL(API_BASE_URL).pathname || '/api/v1'
  } catch {
    return '/api/v1'
  }
})()

export const SESSION_TOKEN = '__cookie_session__'

let refreshPromise: Promise<boolean> | null = null

const secureCookieSuffix = () => (window.location.protocol === 'https:' ? '; Secure' : '')

export const clearLegacyAuthCookies = () => {
  if (typeof document === 'undefined') return

  const suffix = secureCookieSuffix()
  const cookiePaths = ['/', API_PATHNAME, `${API_PATHNAME}/auth`]

  cookiePaths.forEach((path) => {
    document.cookie = `ml_access_token=; Max-Age=0; path=${path}; SameSite=Lax${suffix}`
    document.cookie = `ml_refresh_token=; Max-Age=0; path=${path}; SameSite=Lax${suffix}`
  })
}

export const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })

        return response.ok
      } catch {
        return false
      } finally {
        refreshPromise = null
      }
    })()
  }

  return refreshPromise
}

export const loginWithSession = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.message || 'Login gagal')
  }

  return payload
}

export const logoutSession = async () => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch {}

  clearLegacyAuthCookies()
}
