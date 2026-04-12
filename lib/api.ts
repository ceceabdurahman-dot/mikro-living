const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'
const DEFAULT_SERVER_TIMEOUT_MS = Number(process.env.API_REQUEST_TIMEOUT_MS || 10000)

interface FetchOptions extends RequestInit {
  token?: string
  timeoutMs?: number
  next?: {
    revalidate?: number
  }
}

function withTimeout(signal: AbortSignal | null | undefined, timeoutMs: number) {
  if (!timeoutMs || timeoutMs <= 0) {
    return { signal, cleanup: () => {} }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Request timed out after ${timeoutMs}ms`))
  }, timeoutMs)

  const abortFromSource = () => controller.abort(signal?.reason)

  if (signal) {
    if (signal.aborted) {
      controller.abort(signal.reason)
    } else {
      signal.addEventListener('abort', abortFromSource, { once: true })
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeoutId)
      signal?.removeEventListener('abort', abortFromSource)
    },
  }
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, timeoutMs, ...rest } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(rest.headers as Record<string, string>),
  }

  const requestOptions: RequestInit & { next?: { revalidate?: number } } = {
    ...rest,
    headers,
  }

  // Public pages should fetch fresh runtime data from the backend instead of
  // baking fallback content into the production build when the API is offline.
  if (typeof window === 'undefined' && requestOptions.cache === undefined && requestOptions.next === undefined) {
    requestOptions.cache = 'no-store'
  }

  const effectiveTimeoutMs =
    timeoutMs ?? (typeof window === 'undefined' ? DEFAULT_SERVER_TIMEOUT_MS : 0)
  const { signal, cleanup } = withTimeout(requestOptions.signal, effectiveTimeoutMs)
  if (signal) {
    requestOptions.signal = signal
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, requestOptions)
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'API Error')
    return data
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`API request timed out for ${endpoint}`)
    }
    throw error
  } finally {
    cleanup()
  }
}

export const projectsApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string; featured?: boolean }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    return fetchAPI<{ data: any[]; meta: any }>(`/projects${qs ? `?${qs}` : ''}`)
  },
  getOne: (slug: string) => fetchAPI<{ data: any }>(`/projects/${slug}`),
}

export const blogApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    return fetchAPI<{ data: any[]; meta: any }>(`/blog${qs ? `?${qs}` : ''}`)
  },
  getOne: (slug: string) => fetchAPI<{ data: any }>(`/blog/${slug}`),
}

export const servicesApi = {
  getAll: () => fetchAPI<{ data: any[] }>('/services'),
}

export const testimonialsApi = {
  getAll: (featured?: boolean) =>
    fetchAPI<{ data: any[] }>(`/testimonials${featured ? '?featured=true' : ''}`),
}

export const settingsApi = {
  get: (key: string) => fetchAPI<{ data: any }>(`/settings/${key}`),
}

export const consultationApi = {
  submit: (data: {
    name: string
    email: string
    phone?: string
    message?: string
    service_type?: string
    budget_range?: string
    location?: string
    area_sqm?: number
  }) =>
    fetchAPI('/consultations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

export default fetchAPI
