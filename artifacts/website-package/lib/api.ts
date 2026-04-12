const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'

interface FetchOptions extends RequestInit {
  token?: string
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...rest } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(rest.headers as Record<string, string>),
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers,
    next: { revalidate: 60 },
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'API Error')
  return data
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
