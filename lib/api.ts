import { cache } from 'react'

import {
  posts as fallbackPosts,
  projects as fallbackProjects,
  services as fallbackServices,
  testimonial as fallbackTestimonial,
  type Post,
  type Project,
  type Service,
  type TeamMember,
  type Testimonial,
} from '@/lib/site-data'

type JsonRecord = Record<string, unknown>

type ApiFetchOptions = RequestInit & {
  next?: {
    revalidate?: number
  }
}

export type ConsultationRequestInput = {
  name: string
  email: string
  projectType: string
  timeline: string
  brief: string
}

export type PublicSiteSettings = {
  contactEmail?: string
  contactPhone?: string
  statProjects?: string
}

type ConsultationRequestResult = {
  message: string
  ok: boolean
  status: number
}

const CONTENT_REVALIDATE_SECONDS = 300
const API_REQUEST_TIMEOUT_MS = 5000
const DEFAULT_PROJECT_IMAGE = fallbackProjects[0]?.image ?? ''
const DEFAULT_POST_IMAGE = fallbackPosts[0]?.image ?? ''
const API_FALLBACK_PREFIX = '[mikroliving:data-fallback]'

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isDefined<T>(value: T | null): value is T {
  return value !== null
}

function getApiBaseUrl() {
  const baseUrl = process.env.API_URL || process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_URL

  return baseUrl ? baseUrl.replace(/\/$/, '') : null
}

async function fetchApiJson(path: string, init?: ApiFetchOptions) {
  const baseUrl = getApiBaseUrl()

  if (!baseUrl) {
    throw new Error('API base URL is not configured.')
  }

  const method = (init?.method || 'GET').toUpperCase()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS)

  let response: Response

  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
      cache: method === 'GET' ? init?.cache : 'no-store',
      next: method === 'GET' ? { revalidate: CONTENT_REVALIDATE_SECONDS, ...init?.next } : undefined,
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request to ${path} timed out after ${API_REQUEST_TIMEOUT_MS}ms.`)
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }

  let payload: unknown = null

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const errorMessage =
      getStringFromUnknown(payload, ['message', 'error']) ||
      `Request to ${path} failed with status ${response.status}.`

    throw new Error(errorMessage)
  }

  return payload
}

function unwrapPayload(payload: unknown): unknown {
  let current = payload

  while (isRecord(current) && 'data' in current && current.data !== undefined) {
    current = current.data
  }

  return current
}

function extractCollection(payload: unknown, keys: string[]) {
  const unwrapped = unwrapPayload(payload)

  if (Array.isArray(unwrapped)) {
    return unwrapped
  }

  if (!isRecord(unwrapped)) {
    return []
  }

  for (const key of [...keys, 'items', 'rows', 'results']) {
    const value = unwrapped[key]

    if (Array.isArray(value)) {
      return value
    }
  }

  return []
}

function extractItem(payload: unknown, keys: string[]) {
  const unwrapped = unwrapPayload(payload)

  if (!isRecord(unwrapped)) {
    return null
  }

  for (const key of keys) {
    const value = unwrapped[key]

    if (isRecord(value)) {
      return value
    }
  }

  return unwrapped
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

function getStringFromUnknown(value: unknown, keys: string[]) {
  return isRecord(value) ? getString(value, keys) : ''
}

function getNumber(record: JsonRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key]

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }

    if (typeof value === 'string') {
      const parsed = Number(value)

      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  return undefined
}

function getBoolean(record: JsonRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key]

    if (typeof value === 'boolean') {
      return value
    }

    if (typeof value === 'number') {
      return value !== 0
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase()

      if (['1', 'true', 'yes', 'y', 'published', 'featured'].includes(normalized)) {
        return true
      }

      if (['0', 'false', 'no', 'n', 'draft', 'hidden'].includes(normalized)) {
        return false
      }
    }
  }

  return undefined
}

function getStringArray(record: JsonRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key]

    if (!Array.isArray(value)) {
      continue
    }

    const items = value.flatMap((item) => {
      if (typeof item === 'string' && item.trim()) {
        return [item.trim()]
      }

      if (isRecord(item)) {
        const label = getString(item, ['label', 'title', 'name', 'value'])

        return label ? [label] : []
      }

      return []
    })

    if (items.length > 0) {
      return items
    }
  }

  return []
}

function getImageArray(record: JsonRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key]

    if (!Array.isArray(value)) {
      continue
    }

    const items = value.flatMap((item) => {
      if (typeof item === 'string' && item.trim()) {
        return [item.trim()]
      }

      if (isRecord(item)) {
        const url = getString(item, [
          'url',
          'src',
          'image',
          'secure_url',
          'secureUrl',
          'cover_image',
          'coverImage',
        ])

        return url ? [url] : []
      }

      return []
    })

    if (items.length > 0) {
      return items
    }
  }

  return []
}

function dedupeStrings(values: string[]) {
  return Array.from(new Set(values.filter((value) => typeof value === 'string' && value.trim()))).map((value) =>
    value.trim(),
  )
}

function reportApiFallback(scope: string, detail: string) {
  console.warn(`${API_FALLBACK_PREFIX} ${scope}: ${detail}`)
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function splitSections(value: string) {
  const cleaned = stripHtml(value)

  if (!cleaned) {
    return []
  }

  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean)

  if (paragraphs.length > 1) {
    return paragraphs
  }

  return cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength).trimEnd()}...`
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toTitleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function formatArea(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value} sqm`
  }

  if (typeof value !== 'string' || !value.trim()) {
    return ''
  }

  const normalized = value.trim()

  if (/sqm|m2|m²/i.test(normalized)) {
    return normalized.replace(/m2/i, 'sqm').replace(/m²/i, 'sqm')
  }

  const parsed = Number(normalized)

  if (Number.isFinite(parsed)) {
    return `${parsed} sqm`
  }

  return normalized
}

function formatYear(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  if (typeof value !== 'string' || !value.trim()) {
    return ''
  }

  const match = value.match(/\b(19|20)\d{2}\b/)

  return match?.[0] ?? value.trim()
}

function extractSettingValue(payload: unknown, key: string) {
  const unwrapped = unwrapPayload(payload)

  if (typeof unwrapped === 'string' && unwrapped.trim()) {
    return unwrapped.trim()
  }

  if (!isRecord(unwrapped)) {
    return ''
  }

  return getString(unwrapped, [key, 'value', 'setting', 'content'])
}

function mapService(raw: unknown) {
  if (!isRecord(raw)) {
    return null
  }

  const title = getString(raw, ['title', 'name'])
  const fallback =
    fallbackServices.find((service) => service.slug === getString(raw, ['slug'])) ||
    fallbackServices.find((service) => service.title.toLowerCase() === title.toLowerCase())

  const slug = getString(raw, ['slug'], fallback?.slug || toSlug(title))
  const description =
    getString(raw, ['description', 'summary', 'excerpt'], fallback?.description) || fallback?.description || ''
  const detail =
    getString(raw, ['detail', 'content', 'body', 'long_description', 'longDescription'], fallback?.detail) ||
    description ||
    fallback?.detail ||
    ''

  return {
    slug,
    title: title || fallback?.title || 'Studio Service',
    description,
    detail,
  } satisfies Service
}

function mapProject(raw: unknown) {
  if (!isRecord(raw)) {
    return null
  }

  const title = getString(raw, ['title', 'name'])
  const slug = getString(raw, ['slug'], toSlug(title))
  const fallback =
    fallbackProjects.find((project) => project.slug === slug) ||
    fallbackProjects.find((project) => project.title.toLowerCase() === title.toLowerCase())

  const description =
    getString(raw, ['description', 'content', 'body', 'overview'], fallback?.description) ||
    fallback?.description ||
    ''
  const gallery = dedupeStrings([
    ...getImageArray(raw, ['project_images', 'images', 'gallery', 'photos']),
    ...(fallback?.gallery ?? []),
  ])
  const summary =
    getString(raw, ['summary', 'excerpt', 'short_description', 'shortDescription'], fallback?.summary) ||
    truncateText(description, 160) ||
    fallback?.summary ||
    ''
  const image =
    getString(raw, ['cover_image', 'coverImage', 'image', 'cover', 'thumbnail', 'hero_image', 'heroImage'], fallback?.image) ||
    gallery[0] ||
    DEFAULT_PROJECT_IMAGE
  const size =
    getString(raw, ['size'], formatArea(getNumber(raw, ['area_sqm', 'areaSqm', 'area']))) ||
    fallback?.size ||
    ''
  const category =
    getString(raw, ['category', 'project_type', 'projectType', 'type'], fallback?.category) ||
    fallback?.category ||
    'Residence'
  const year =
    formatYear(raw.year) ||
    formatYear(raw.completed_at) ||
    formatYear(raw.completedAt) ||
    formatYear(raw.created_at) ||
    fallback?.year ||
    ''
  const scope =
    getStringArray(raw, ['scope', 'services', 'tags']) ||
    fallback?.scope ||
    []
  const featured = getBoolean(raw, ['featured', 'is_featured', 'isFeatured']) ?? fallback?.featured ?? false

  return {
    slug: slug || fallback?.slug || toSlug(title || 'project'),
    title: title || fallback?.title || 'Untitled Project',
    location: getString(raw, ['location', 'city', 'project_location'], fallback?.location) || fallback?.location || 'Jakarta',
    size,
    category: toTitleCase(category),
    year,
    summary,
    description,
    image,
    featured,
    gallery: dedupeStrings([image, ...gallery]),
    scope,
  } satisfies Project
}

function mapPost(raw: unknown) {
  if (!isRecord(raw)) {
    return null
  }

  const title = getString(raw, ['title', 'name'])
  const slug = getString(raw, ['slug'], toSlug(title))
  const fallback =
    fallbackPosts.find((post) => post.slug === slug) ||
    fallbackPosts.find((post) => post.title.toLowerCase() === title.toLowerCase())

  const content =
    getString(raw, ['content', 'body', 'description', 'article'], fallback?.sections.join('\n\n')) ||
    fallback?.sections.join('\n\n') ||
    ''
  const explicitSections = getStringArray(raw, ['sections', 'content_sections', 'contentSections'])
  const sections = explicitSections.length > 0 ? explicitSections : splitSections(content)

  const summary =
    getString(raw, ['summary', 'excerpt', 'dek'], fallback?.summary) ||
    sections[0] ||
    fallback?.summary ||
    ''
  const excerpt =
    getString(raw, ['excerpt', 'summary', 'short_description', 'shortDescription'], fallback?.excerpt) ||
    truncateText(summary, 140) ||
    fallback?.excerpt ||
    ''

  return {
    slug: slug || fallback?.slug || toSlug(title || 'journal-entry'),
    category:
      toTitleCase(getString(raw, ['category', 'type', 'topic'], fallback?.category || 'Journal')) ||
      fallback?.category ||
      'Journal',
    title: title || fallback?.title || 'Untitled Note',
    excerpt,
    summary,
    image:
      getString(raw, ['cover_image', 'coverImage', 'image', 'thumbnail', 'hero_image', 'heroImage'], fallback?.image) ||
      DEFAULT_POST_IMAGE,
    sections: sections.length > 0 ? sections : fallback?.sections || [],
  } satisfies Post
}

function mapTestimonial(raw: unknown) {
  if (!isRecord(raw)) {
    return null
  }

  const name = getString(raw, ['name', 'client_name', 'clientName'])
  const title = getString(raw, ['title', 'role', 'project_title', 'projectTitle', 'company'])
  const content = getString(raw, ['content', 'quote', 'testimonial', 'review', 'message'])

  if (!name || !content) {
    return null
  }

  return {
    name,
    title: title || 'MikroLiving Client',
    content,
  } satisfies Testimonial
}

function mapTeamMember(raw: unknown) {
  if (!isRecord(raw)) {
    return null
  }

  const name = getString(raw, ['name', 'full_name', 'fullName'])
  const role = getString(raw, ['role', 'title', 'position'])

  if (!name || !role) {
    return null
  }

  return {
    id: getString(raw, ['id', 'uuid', 'slug'], toSlug(name)),
    name,
    role,
    bio: getString(raw, ['bio', 'description', 'summary', 'excerpt']),
    image:
      getString(raw, ['image', 'photo', 'avatar', 'profile_image', 'profileImage']) ||
      DEFAULT_PROJECT_IMAGE,
  } satisfies TeamMember
}

export function getFeaturedProject(projects: Project[]) {
  return projects.find((project) => project.featured) || projects[0] || null
}

export function orderProjectsForShowcase(projects: Project[]) {
  const featuredProject = getFeaturedProject(projects)

  if (!featuredProject) {
    return []
  }

  return [featuredProject, ...projects.filter((project) => project.slug !== featuredProject.slug)]
}

export const getServices = cache(async () => {
  try {
    const payload = await fetchApiJson('/services')
    const services = extractCollection(payload, ['services']).map(mapService).filter(isDefined)

    if (services.length > 0) {
      return services
    }

    reportApiFallback('/services', 'API responded without any usable service records; using static fallback.')
    return fallbackServices
  } catch (error) {
    reportApiFallback('/services', error instanceof Error ? error.message : 'Unknown error; using static fallback.')
    return fallbackServices
  }
})

export const getProjects = cache(async () => {
  try {
    const payload = await fetchApiJson('/projects')
    const projects = extractCollection(payload, ['projects']).map(mapProject).filter(isDefined)

    if (projects.length > 0) {
      return projects
    }

    reportApiFallback('/projects', 'API responded without any usable project records; using static fallback.')
    return fallbackProjects
  } catch (error) {
    reportApiFallback('/projects', error instanceof Error ? error.message : 'Unknown error; using static fallback.')
    return fallbackProjects
  }
})

export const getProjectBySlug = cache(async (slug: string) => {
  const projects = await getProjects()
  const fallbackProject = projects.find((project) => project.slug === slug) || null

  try {
    const payload = await fetchApiJson(`/projects/${slug}`)
    const project = mapProject(extractItem(payload, ['project', 'item', 'result']))

    return project || fallbackProject
  } catch (error) {
    if (fallbackProject) {
      reportApiFallback(
        `/projects/${slug}`,
        error instanceof Error ? error.message : 'Unknown error; using collection fallback.',
      )
    }

    return fallbackProject
  }
})

export const getPosts = cache(async () => {
  try {
    const payload = await fetchApiJson('/blog')
    const posts = extractCollection(payload, ['posts', 'blog', 'articles']).map(mapPost).filter(isDefined)

    if (posts.length > 0) {
      return posts
    }

    reportApiFallback('/blog', 'API responded without any usable post records; using static fallback.')
    return fallbackPosts
  } catch (error) {
    reportApiFallback('/blog', error instanceof Error ? error.message : 'Unknown error; using static fallback.')
    return fallbackPosts
  }
})

export const getPostBySlug = cache(async (slug: string) => {
  const posts = await getPosts()
  const fallbackPost = posts.find((post) => post.slug === slug) || null

  try {
    const payload = await fetchApiJson(`/blog/${slug}`)
    const post = mapPost(extractItem(payload, ['post', 'article', 'item', 'result']))

    return post || fallbackPost
  } catch (error) {
    if (fallbackPost) {
      reportApiFallback(`/blog/${slug}`, error instanceof Error ? error.message : 'Unknown error; using collection fallback.')
    }

    return fallbackPost
  }
})

export const getFeaturedTestimonial = cache(async () => {
  try {
    const payload = await fetchApiJson('/testimonials?featured=true')
    const testimonials = extractCollection(payload, ['testimonials']).map(mapTestimonial).filter(isDefined)

    if (testimonials.length > 0) {
      return testimonials[0]
    }

    const fallbackPayload = await fetchApiJson('/testimonials')
    const allTestimonials = extractCollection(fallbackPayload, ['testimonials'])
      .map(mapTestimonial)
      .filter(isDefined)

    if (allTestimonials.length > 0) {
      return allTestimonials[0]
    }

    reportApiFallback('/testimonials', 'API responded without any usable testimonial records; using static fallback.')
    return fallbackTestimonial
  } catch (error) {
    reportApiFallback('/testimonials', error instanceof Error ? error.message : 'Unknown error; using static fallback.')
    return fallbackTestimonial
  }
})

export const getTeamMembers = cache(async () => {
  try {
    const payload = await fetchApiJson('/team')
    return extractCollection(payload, ['team', 'members']).map(mapTeamMember).filter(isDefined)
  } catch (error) {
    reportApiFallback('/team', error instanceof Error ? error.message : 'Unknown error; returning no team members.')
    return [] as TeamMember[]
  }
})

export const getPublicSiteSettings = cache(async (): Promise<PublicSiteSettings> => {
  const baseUrl = getApiBaseUrl()

  if (!baseUrl) {
    return {}
  }

  const settingDefinitions = [
    ['statProjects', 'stat_projects'],
    ['contactPhone', 'contact_phone'],
    ['contactEmail', 'contact_email'],
  ] as const

  const settings = await Promise.all(
    settingDefinitions.map(async ([outputKey, apiKey]) => {
      try {
        const payload = await fetchApiJson(`/settings/${apiKey}`)
        return [outputKey, extractSettingValue(payload, apiKey)] as const
      } catch {
        return [outputKey, ''] as const
      }
    }),
  )

  return settings.reduce<PublicSiteSettings>((accumulator, [key, value]) => {
    if (value) {
      accumulator[key] = value
    }

    return accumulator
  }, {})
})

export async function createConsultationRequest(input: ConsultationRequestInput): Promise<ConsultationRequestResult> {
  const baseUrl = getApiBaseUrl()

  if (!baseUrl) {
    return {
      ok: false,
      status: 503,
      message: 'Studio intake API is not configured yet.',
    }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS)

    let response: Response

    try {
      response = await fetch(`${baseUrl}/consultations`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        signal: controller.signal,
        body: JSON.stringify({
          name: input.name,
          email: input.email,
          project_type: input.projectType,
          timeline: input.timeline,
          message: input.brief,
        }),
      })
    } finally {
      clearTimeout(timeoutId)
    }

    let payload: unknown = null

    try {
      payload = await response.json()
    } catch {
      payload = null
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message:
          getStringFromUnknown(payload, ['message', 'error']) ||
          'The consultation request could not be sent right now.',
      }
    }

    return {
      ok: true,
      status: response.status,
      message:
        getStringFromUnknown(payload, ['message']) ||
        'Consultation request sent successfully.',
    }
  } catch {
    return {
      ok: false,
      status: 503,
      message: 'The consultation service is unreachable right now. Please try again shortly.',
    }
  }
}
