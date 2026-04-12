'use client'

import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import type { SectionId } from './sections'
import CmsBrandLogo from '../../components/CmsBrandLogo'
import SiteSettingsSection from '../../components/cms/SiteSettingsSection'
import UserManagementSection from '../../components/cms/UserManagementSection'
import {
  clearLegacyAuthCookies,
  logoutSession,
  refreshSession,
  SESSION_TOKEN,
} from '../../lib/authSession'
import { LEAD_SUBMITTED_EVENT, LEAD_SUBMITTED_STORAGE_KEY } from '../../lib/leadSync'
import {
  AlertCircle,
  Bold,
  BookOpenText,
  BriefcaseBusiness,
  CheckCheck,
  Clock3,
  GripVertical,
  Italic,
  Layers3,
  LayoutDashboard,
  List,
  ListOrdered,
  LogOut,
  MessageSquareQuote,
  MessagesSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Underline,
  Users,
  X,
} from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'
const DEFAULT_PAGE_SIZE = 8
const LEADS_PAGE_SIZE = 10
const DRAFT_SAVE_DELAY_MS = 700
const BULK_SELECT_BATCH_SIZE = 100
const SEARCH_DEBOUNCE_MS = 350
const LIST_RETRY_DELAY_MS = 1200
const CMS_LEAD_SYNC_INTERVAL_MS = 15000

type Stats = {
  counts: {
    projects: number
    posts: number
    consultations: number
    newConsultations: number
  }
  recentConsultations: Array<{
    id: number
    name: string
    email: string
    service_type?: string
    status: string
  }>
  topProjects: Array<{
    id: number
    title: string
    category: string
    views: number
  }>
}

type ProjectItem = {
  id: number
  title: string
  slug: string
  description?: string
  location?: string
  area_sqm?: number | string
  category: string
  status: string
  is_featured: boolean
  year_completed?: number | string
  client_name?: string
  sort_order?: number
  meta_title?: string
  meta_desc?: string
  cover_url?: string
  images?: Array<{
    id: number
    url: string
    alt_text?: string
  }>
}

type BlogItem = {
  id: number
  title: string
  slug: string
  excerpt?: string
  content?: string
  category: string
  status: string
  tags?: string[]
  read_time?: number
  meta_title?: string
  meta_desc?: string
  cover_url?: string
}

type ServiceItem = {
  id: number
  title: string
  slug?: string
  description?: string
  icon?: string
  icon_url?: string
  features?: string[]
  price_from?: string | number
  is_active?: boolean
  sort_order?: number
}

type TestimonialItem = {
  id: number
  client_name: string
  client_title?: string
  content: string
  rating?: number
  avatar_url?: string
  project_id?: number | null
  is_featured?: boolean
  is_active?: boolean
  sort_order?: number
  project?: { id: number; title: string; slug: string }
}

type TeamItem = {
  id: number
  name: string
  role?: string
  bio?: string
  avatar_url?: string
  instagram?: string
  linkedin?: string
  is_active?: boolean
  sort_order?: number
}

type LeadItem = {
  id: number
  name: string
  email: string
  phone?: string
  message?: string
  service_type?: string
  budget_range?: string
  location?: string
  area_sqm?: number | string
  status: string
  notes?: string
  created_at?: string
}

type ProjectGalleryImage = {
  id: number
  url: string
  alt_text?: string
  sort_order?: number
}

type ToastItem = {
  id: number
  tone: 'success' | 'error'
  message: string
}

type PaginatedMeta = {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type PaginatedResponse<T> = {
  data: T[]
  meta?: PaginatedMeta
}

const emptyPaginatedMeta = (): PaginatedMeta => ({
  total: 0,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
})

type ConfirmDialogState = {
  title: string
  description: string
  confirmLabel: string
  tone?: 'default' | 'danger'
}

type ManagedListLoadingState = {
  projects: boolean
  blog: boolean
  services: boolean
  testimonials: boolean
  team: boolean
  leads: boolean
}

type ManagedListTimestampState = {
  projects: number | null
  blog: number | null
  services: number | null
  testimonials: number | null
  team: number | null
  leads: number | null
}

type ManagedListErrorState = {
  projects: string | null
  blog: string | null
  services: string | null
  testimonials: string | null
  team: string | null
  leads: string | null
}

type ManagedListRetryState = {
  projects: boolean
  blog: boolean
  services: boolean
  testimonials: boolean
  team: boolean
  leads: boolean
}

type DraftState = 'idle' | 'saving' | 'saved'

type ProjectFormState = {
  title: string
  description: string
  location: string
  area_sqm: string
  category: string
  status: string
  is_featured: boolean
  year_completed: string
  client_name: string
  sort_order: string
  meta_title: string
  meta_desc: string
}

type BlogFormState = {
  title: string
  excerpt: string
  content: string
  category: string
  status: string
  tagsText: string
  read_time: string
  meta_title: string
  meta_desc: string
}

type ServiceFormState = {
  title: string
  description: string
  icon: string
  featuresText: string
  price_from: string
  is_active: boolean
  sort_order: string
}

type TestimonialFormState = {
  client_name: string
  client_title: string
  content: string
  rating: string
  project_id: string
  is_featured: boolean
  is_active: boolean
  sort_order: string
}

type TeamFormState = {
  name: string
  role: string
  bio: string
  instagram: string
  linkedin: string
  is_active: boolean
  sort_order: string
}

const navItems = [
  { id: 'dashboard' as SectionId, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'settings' as SectionId, label: 'Settings', icon: SlidersHorizontal },
  { id: 'projects' as SectionId, label: 'Portfolio', icon: BriefcaseBusiness },
  { id: 'blog' as SectionId, label: 'Blog / Insights', icon: BookOpenText },
  { id: 'services' as SectionId, label: 'Services', icon: Layers3 },
  { id: 'testimonials' as SectionId, label: 'Testimonials', icon: MessageSquareQuote },
  { id: 'team' as SectionId, label: 'Team', icon: Users },
  { id: 'leads' as SectionId, label: 'Leads', icon: MessagesSquare },
  { id: 'users' as SectionId, label: 'Users', icon: ShieldCheck },
]

const emptyProjectForm = (): ProjectFormState => ({
  title: '',
  description: '',
  location: '',
  area_sqm: '',
  category: 'residential',
  status: 'draft',
  is_featured: false,
  year_completed: '',
  client_name: '',
  sort_order: '0',
  meta_title: '',
  meta_desc: '',
})

const emptyBlogForm = (): BlogFormState => ({
  title: '',
  excerpt: '',
  content: '',
  category: 'tips',
  status: 'draft',
  tagsText: '',
  read_time: '5',
  meta_title: '',
  meta_desc: '',
})

const emptyServiceForm = (): ServiceFormState => ({
  title: '',
  description: '',
  icon: '',
  featuresText: '',
  price_from: '',
  is_active: true,
  sort_order: '0',
})

const emptyTestimonialForm = (): TestimonialFormState => ({
  client_name: '',
  client_title: '',
  content: '',
  rating: '5',
  project_id: '',
  is_featured: false,
  is_active: true,
  sort_order: '0',
})

const emptyTeamForm = (): TeamFormState => ({
  name: '',
  role: '',
  bio: '',
  instagram: '',
  linkedin: '',
  is_active: true,
  sort_order: '0',
})

const getCmsLoginRedirectPath = () => '/cms'

const inputClassName =
  'w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-[13px] text-stone-800 outline-none transition focus:border-primary focus:bg-white'

const splitCommaValues = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const mergeUniqueIds = (current: number[], incoming: number[]) =>
  Array.from(new Set([...current, ...incoming]))

const buildQueryString = (params: Record<string, string | undefined>) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (!value) return
    query.set(key, value)
  })

  return query.toString()
}

const normalizeStringList = (value: unknown) => {
  if (!value) return []
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean)
      }
    } catch {}

    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

type TextSelectionTransform = {
  value: string
  selectionStart: number
  selectionEnd: number
}

const applyInlineFormat = (
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  suffix: string,
  placeholder: string
): TextSelectionTransform => {
  const safeStart = Math.max(0, selectionStart)
  const safeEnd = Math.max(safeStart, selectionEnd)
  const selectedText = value.slice(safeStart, safeEnd)
  const targetText = selectedText || placeholder
  const replacement = `${prefix}${targetText}${suffix}`

  return {
    value: `${value.slice(0, safeStart)}${replacement}${value.slice(safeEnd)}`,
    selectionStart: safeStart + prefix.length,
    selectionEnd: safeStart + prefix.length + targetText.length,
  }
}

const applyLineFormat = (
  value: string,
  selectionStart: number,
  selectionEnd: number,
  formatter: (line: string, index: number) => string,
  fallback: string
): TextSelectionTransform => {
  const safeStart = Math.max(0, selectionStart)
  const safeEnd = Math.max(safeStart, selectionEnd)
  const lineStart = value.lastIndexOf('\n', Math.max(0, safeStart - 1)) + 1
  const lineEnd = value.indexOf('\n', safeEnd) === -1 ? value.length : value.indexOf('\n', safeEnd)
  const selectedBlock = value.slice(lineStart, lineEnd)

  let replacement = fallback
  if (selectedBlock.trim()) {
    let itemIndex = 1
    replacement = selectedBlock
      .split('\n')
      .map((line) => {
        if (!line.trim()) return line
        const formattedLine = formatter(line, itemIndex)
        itemIndex += 1
        return formattedLine
      })
      .join('\n')
  }

  return {
    value: `${value.slice(0, lineStart)}${replacement}${value.slice(lineEnd)}`,
    selectionStart: lineStart,
    selectionEnd: lineStart + replacement.length,
  }
}

const formatRoleLabel = (role: string) => {
  if (!role) return 'User'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'ML'

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

const isTransientListError = (message: string) => {
  const normalized = message.toLowerCase()
  return (
    normalized.includes('network') ||
    normalized.includes('jaringan') ||
    normalized.includes('fetch failed') ||
    normalized.includes('econnrefused') ||
    normalized.includes('timeout')
  )
}

const formatHumanListError = (message: string) => {
  const normalized = message.toLowerCase()

  if (normalized.includes('econnrefused') || normalized.includes('connection refused')) {
    return 'Last error: server connection was refused'
  }

  if (normalized.includes('timeout')) {
    return 'Last error: network timeout'
  }

  if (normalized.includes('fetch failed')) {
    return 'Last error: failed to reach the server'
  }

  if (normalized.includes('network') || normalized.includes('jaringan')) {
    return 'Last error: network connection issue'
  }

  if (normalized.includes('401') || normalized.includes('sesi anda berakhir')) {
    return 'Last error: session expired, please sign in again'
  }

  return `Last error: ${message}`
}

const withCmsScope = (endpoint: string) => {
  if (/[?&]cms=true(?:&|$)/.test(endpoint)) return endpoint
  return `${endpoint}${endpoint.includes('?') ? '&' : '?'}cms=true`
}

async function adminFetch<T>(token: string, endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && token !== SESSION_TOKEN ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const payload = await response.json().catch(() => ({}))

  if (response.status === 401) {
    const restored = await refreshSession()
    if (restored) {
      return adminFetch<T>(token, endpoint, options)
    }

    clearLegacyAuthCookies()
    window.location.replace(`/login?redirect=${encodeURIComponent(getCmsLoginRedirectPath())}`)
    throw new Error('Sesi Anda berakhir. Silakan login ulang.')
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Permintaan ke server gagal.')
  }

  return payload
}

async function adminUpload<T>(token: string, endpoint: string, body: FormData, method = 'POST'): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    body,
    credentials: 'include',
    headers: {
      ...(token && token !== SESSION_TOKEN ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const payload = await response.json().catch(() => ({}))

  if (response.status === 401) {
    const restored = await refreshSession()
    if (restored) {
      return adminUpload<T>(token, endpoint, body, method)
    }

    clearLegacyAuthCookies()
    window.location.replace(`/login?redirect=${encodeURIComponent(getCmsLoginRedirectPath())}`)
    throw new Error('Sesi Anda berakhir. Silakan login ulang.')
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Upload ke server gagal.')
  }

  return payload
}

async function adminUploadWithProgress<T>(
  token: string,
  endpoint: string,
  body: FormData,
  method = 'POST',
  onProgress?: (progress: number) => void,
  allowRetry = true
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, `${API_BASE_URL}${endpoint}`)
    xhr.withCredentials = true
    if (token && token !== SESSION_TOKEN) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return
      onProgress(Math.round((event.loaded / event.total) * 100))
    }

    xhr.onload = () => {
      let payload: any = {}
      try {
        payload = JSON.parse(xhr.responseText || '{}')
      } catch {
        payload = {}
      }

      if (xhr.status === 401) {
        if (allowRetry) {
          refreshSession()
            .then((restored) => {
              if (!restored) {
                clearLegacyAuthCookies()
                window.location.replace(`/login?redirect=${encodeURIComponent(getCmsLoginRedirectPath())}`)
                reject(new Error('Sesi Anda berakhir. Silakan login ulang.'))
                return
              }

              adminUploadWithProgress<T>(token, endpoint, body, method, onProgress, false)
                .then(resolve)
                .catch(reject)
            })
            .catch(() => {
              clearLegacyAuthCookies()
              window.location.replace(`/login?redirect=${encodeURIComponent(getCmsLoginRedirectPath())}`)
              reject(new Error('Sesi Anda berakhir. Silakan login ulang.'))
            })
          return
        }

        clearLegacyAuthCookies()
        window.location.replace(`/login?redirect=${encodeURIComponent(getCmsLoginRedirectPath())}`)
        reject(new Error('Sesi Anda berakhir. Silakan login ulang.'))
        return
      }

      if (xhr.status < 200 || xhr.status >= 300 || payload.success === false) {
        reject(new Error(payload.message || 'Upload ke server gagal.'))
        return
      }

      resolve(payload)
    }

    xhr.onerror = () => reject(new Error('Jaringan gagal saat upload berlangsung.'))
    xhr.send(body)
  })
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[13px] font-semibold text-stone-700">{label}</span>
      {children}
    </label>
  )
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-[22px] border border-dashed border-stone-300 bg-stone-50 px-8 py-14 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Empty state</p>
      <h3 className="mt-4 text-[22px] text-stone-900 font-headline">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-500">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

function SectionFrame({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow: string
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
          <h2 className="mt-3 text-[22px] text-stone-900 font-headline">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function AssetPreview({
  label,
  url,
}: {
  label: string
  url?: string
}) {
  if (!url) return null

  return (
    <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
        {label}
      </p>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-200">
        <Image src={url} alt={label} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>
    </div>
  )
}

function FileSelectionNote({
  files,
}: {
  files: File[]
}) {
  if (!files.length) return null

  return (
    <div className="mt-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
      <p className="font-semibold text-stone-700">Selected file{files.length > 1 ? 's' : ''}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {files.map((file) => (
          <span key={`${file.name}-${file.size}`} className="rounded-full bg-white px-3 py-1 text-xs">
            {file.name}
          </span>
        ))}
      </div>
    </div>
  )
}

function ExistingAssetNote({
  url,
  helper,
}: {
  url?: string
  helper?: string
}) {
  if (!url) return null

  return (
    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-semibold">Current file is loaded</p>
      <p className="mt-1 break-all text-xs text-amber-800">{url}</p>
      {helper ? <p className="mt-2 text-xs text-amber-700">{helper}</p> : null}
    </div>
  )
}

function UploadProgressList({
  progressEntries,
}: {
  progressEntries: Array<[string, number]>
}) {
  if (!progressEntries.length) return null

  return (
    <div className="mt-3 space-y-2">
      {progressEntries.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-stone-700">{label}</span>
            <span className="font-semibold text-stone-500">{value}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 px-6 py-4">
      <p className="text-sm text-stone-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 disabled:opacity-40"
        >
          Prev
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function DraftIndicator({ state }: { state: DraftState }) {
  const label =
    state === 'saving' ? 'Saving draft...' : state === 'saved' ? 'Draft saved' : 'Draft idle'
  const tone =
    state === 'saving'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : state === 'saved'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-stone-200 bg-stone-50 text-stone-500'

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${tone}`}>
      <CheckCheck className="h-3.5 w-3.5" />
      {label}
    </div>
  )
}

function DragHandle() {
  return (
    <span className="inline-flex cursor-grab items-center rounded-xl border border-stone-200 bg-white p-2 text-stone-400">
      <GripVertical className="h-4 w-4" />
    </span>
  )
}

function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="divide-y divide-stone-100 text-sm">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="px-5 py-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-1/3 rounded-full bg-stone-200" />
            <div className="h-3 w-2/3 rounded-full bg-stone-100" />
            <div className="h-3 w-full rounded-full bg-stone-100" />
            <div className="h-3 w-5/6 rounded-full bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

function formatLastUpdated(timestamp: number | null) {
  if (!timestamp) return 'Waiting for first sync'

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (diffSeconds < 10) return 'Updated just now'
  if (diffSeconds < 60) return `Updated ${diffSeconds}s ago`

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `Updated ${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `Updated ${diffHours}h ago`

  return `Updated ${Math.floor(diffHours / 24)}d ago`
}

function getUpdatedTone(timestamp: number | null) {
  if (!timestamp) return 'text-stone-400'

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (diffSeconds < 60) return 'text-emerald-600'
  if (diffSeconds < 3600) return 'text-stone-500'
  return 'text-stone-400'
}

function ListHeaderMeta({
  isLoading,
  hasQuery,
  timestamp,
  errorMessage,
  isRetrying,
  onRetry,
}: {
  isLoading: boolean
  hasQuery?: boolean
  timestamp: number | null
  errorMessage?: string | null
  isRetrying?: boolean
  onRetry?: () => void
}) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTick((current) => current + 1)
    }, 30000)

    return () => window.clearInterval(interval)
  }, [])

  const statusLabel = isRetrying
    ? 'Retrying...'
    : isLoading
      ? hasQuery
        ? 'Searching...'
        : 'Refreshing list...'
      : null
  const updatedToneClass = errorMessage ? 'text-red-500' : getUpdatedTone(timestamp)

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs" data-tick={tick}>
      {errorMessage ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 font-semibold text-red-700">
          <AlertCircle className="h-3.5 w-3.5" />
          Refresh failed
        </span>
      ) : null}
      {statusLabel ? (
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-2 font-semibold ${
            isRetrying
              ? 'border border-blue-200 bg-blue-50 text-blue-700'
              : 'border border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isRetrying ? 'animate-spin' : ''}`} />
          {statusLabel}
        </span>
      ) : null}
      <span className={`inline-flex items-center gap-1.5 ${updatedToneClass}`}>
        {errorMessage ? (
          <AlertCircle className="h-3.5 w-3.5" />
        ) : timestamp && Date.now() - timestamp < 60000 ? (
          <CheckCheck className="h-3.5 w-3.5" />
        ) : (
          <Clock3 className="h-3.5 w-3.5" />
        )}
        {errorMessage || formatLastUpdated(timestamp)}
      </span>
      {errorMessage && onRetry ? (
        <button
          onClick={onRetry}
          disabled={isLoading}
          className="rounded-full border border-red-200 px-3 py-1.5 font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}

function useDebouncedValue<T>(value: T, delay = SEARCH_DEBOUNCE_MS) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timeout)
  }, [value, delay])

  return debouncedValue
}

function ConfirmDialog({
  dialog,
  submitting,
  onCancel,
  onConfirm,
}: {
  dialog: ConfirmDialogState | null
  submitting: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!dialog) return null

  const confirmTone =
    dialog.tone === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-stone-900 text-white hover:bg-stone-800'

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[22px] border border-stone-200 bg-white p-5 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Confirm action</p>
        <h3 className="mt-3 text-[22px] text-stone-900 font-headline">{dialog.title}</h3>
        <p className="mt-3 text-sm leading-7 text-stone-600">{dialog.description}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="rounded-2xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${confirmTone}`}
          >
            {submitting ? 'Processing...' : dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CMSDashboard() {
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [busyKey, setBusyKey] = useState('')
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [selectionBusyKey, setSelectionBusyKey] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null)
  const [projectDraftState, setProjectDraftState] = useState<DraftState>('idle')
  const [blogDraftState, setBlogDraftState] = useState<DraftState>('idle')
  const [testimonialDraftState, setTestimonialDraftState] = useState<DraftState>('idle')

  const [stats, setStats] = useState<Stats | null>(null)
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [posts, setPosts] = useState<BlogItem[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamItem[]>([])
  const [leads, setLeads] = useState<LeadItem[]>([])
  const [projectMeta, setProjectMeta] = useState<PaginatedMeta>(emptyPaginatedMeta)
  const [blogMeta, setBlogMeta] = useState<PaginatedMeta>(emptyPaginatedMeta)
  const [serviceMeta, setServiceMeta] = useState<PaginatedMeta>(emptyPaginatedMeta)
  const [testimonialMeta, setTestimonialMeta] = useState<PaginatedMeta>(emptyPaginatedMeta)
  const [teamMeta, setTeamMeta] = useState<PaginatedMeta>(emptyPaginatedMeta)
  const [leadMeta, setLeadMeta] = useState<PaginatedMeta>(emptyPaginatedMeta)
  const [managedListsReloadKey, setManagedListsReloadKey] = useState(0)
  const [listLoading, setListLoading] = useState<ManagedListLoadingState>({
    projects: false,
    blog: false,
    services: false,
    testimonials: false,
    team: false,
    leads: false,
  })
  const [listUpdatedAt, setListUpdatedAt] = useState<ManagedListTimestampState>({
    projects: null,
    blog: null,
    services: null,
    testimonials: null,
    team: null,
    leads: null,
  })
  const [listErrors, setListErrors] = useState<ManagedListErrorState>({
    projects: null,
    blog: null,
    services: null,
    testimonials: null,
    team: null,
    leads: null,
  })
  const [listRetrying, setListRetrying] = useState<ManagedListRetryState>({
    projects: false,
    blog: false,
    services: false,
    testimonials: false,
    team: false,
    leads: false,
  })

  const [editingProjectId, setEditingProjectId] = useState<number | null>(null)
  const [editingPostId, setEditingPostId] = useState<number | null>(null)
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null)
  const [editingTestimonialId, setEditingTestimonialId] = useState<number | null>(null)
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null)

  const [projectForm, setProjectForm] = useState<ProjectFormState>(emptyProjectForm)
  const [blogForm, setBlogForm] = useState<BlogFormState>(emptyBlogForm)
  const [editingBlogSnapshot, setEditingBlogSnapshot] = useState<BlogItem | null>(null)
  const [serviceForm, setServiceForm] = useState<ServiceFormState>(emptyServiceForm)
  const [testimonialForm, setTestimonialForm] = useState<TestimonialFormState>(emptyTestimonialForm)
  const [teamForm, setTeamForm] = useState<TeamFormState>(emptyTeamForm)
  const [projectCoverFile, setProjectCoverFile] = useState<File | null>(null)
  const [blogCoverFile, setBlogCoverFile] = useState<File | null>(null)
  const [serviceIconFile, setServiceIconFile] = useState<File | null>(null)
  const [testimonialAvatarFile, setTestimonialAvatarFile] = useState<File | null>(null)
  const [teamAvatarFile, setTeamAvatarFile] = useState<File | null>(null)
  const [projectGalleryFiles, setProjectGalleryFiles] = useState<File[]>([])
  const [leadFilter, setLeadFilter] = useState('all')
  const [leadDrafts, setLeadDrafts] = useState<Record<number, { status: string; notes: string }>>({})
  const [editingProjectImages, setEditingProjectImages] = useState<ProjectGalleryImage[]>([])
  const [projectSearch, setProjectSearch] = useState('')
  const [projectStatusFilter, setProjectStatusFilter] = useState('all')
  const [blogSearch, setBlogSearch] = useState('')
  const [blogStatusFilter, setBlogStatusFilter] = useState('all')
  const [serviceSearch, setServiceSearch] = useState('')
  const [serviceStatusFilter, setServiceStatusFilter] = useState('all')
  const [testimonialSearch, setTestimonialSearch] = useState('')
  const [testimonialStatusFilter, setTestimonialStatusFilter] = useState('all')
  const [teamSearch, setTeamSearch] = useState('')
  const [teamStatusFilter, setTeamStatusFilter] = useState('all')
  const debouncedProjectSearch = useDebouncedValue(projectSearch)
  const debouncedBlogSearch = useDebouncedValue(blogSearch)
  const debouncedServiceSearch = useDebouncedValue(serviceSearch)
  const debouncedTestimonialSearch = useDebouncedValue(testimonialSearch)
  const debouncedTeamSearch = useDebouncedValue(teamSearch)
  const [dragItem, setDragItem] = useState<{ type: string; id: number } | null>(null)
  const [dropTarget, setDropTarget] = useState<{ type: string; id: number } | null>(null)

  const [projectPage, setProjectPage] = useState(1)
  const [blogPage, setBlogPage] = useState(1)
  const [servicePage, setServicePage] = useState(1)
  const [testimonialPage, setTestimonialPage] = useState(1)
  const [teamPage, setTeamPage] = useState(1)
  const [leadPage, setLeadPage] = useState(1)
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([])
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([])
  const [selectedBlogIds, setSelectedBlogIds] = useState<number[]>([])
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([])
  const [selectedTestimonialIds, setSelectedTestimonialIds] = useState<number[]>([])
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([])

  const [token, setToken] = useState('')
  const [currentUserRole, setCurrentUserRole] = useState('')
  const [currentUserName, setCurrentUserName] = useState('')
  const [currentUserEmail, setCurrentUserEmail] = useState('')
  const confirmResolverRef = useRef<((confirmed: boolean) => void) | null>(null)
  const blogEditorRef = useRef<HTMLDivElement | null>(null)
  const blogContentRef = useRef<HTMLTextAreaElement | null>(null)
  const canPublish = currentUserRole === 'superadmin'
  const canManageSettings = currentUserRole === 'admin' || currentUserRole === 'superadmin'
  const canManageUsers = currentUserRole === 'admin' || currentUserRole === 'superadmin'
  const cmsNavItems = navItems.filter((item) => {
    if (item.id === 'settings' && !canManageSettings) return false
    if (item.id === 'users' && !canManageUsers) return false
    return true
  })

  const pushToast = (tone: ToastItem['tone'], message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((current) => [...current, { id, tone, message }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3200)
  }

  const selectedBlogItem =
    selectedBlogIds.length === 1 ? posts.find((item) => item.id === selectedBlogIds[0]) || null : null

  const requestConfirmation = (dialog: ConfirmDialogState) =>
    new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve
      setConfirmDialog(dialog)
    })

  const closeConfirmation = (confirmed: boolean) => {
    confirmResolverRef.current?.(confirmed)
    confirmResolverRef.current = null
    setConfirmDialog(null)
  }

  const updateBlogContent = (nextValue: string, selectionStart?: number, selectionEnd?: number) => {
    setBlogForm((current) => ({ ...current, content: nextValue }))

    if (typeof selectionStart === 'number' && typeof selectionEnd === 'number') {
      window.requestAnimationFrame(() => {
        blogContentRef.current?.focus()
        blogContentRef.current?.setSelectionRange(selectionStart, selectionEnd)
      })
    }
  }

  const applyBlogContentFormat = (
    mode: 'bold' | 'italic' | 'underline' | 'bullet-list' | 'numbered-list'
  ) => {
    const textarea = blogContentRef.current
    if (!textarea) return

    const { value, selectionStart, selectionEnd } = textarea
    let transformed: TextSelectionTransform

    switch (mode) {
      case 'bold':
        transformed = applyInlineFormat(
          value,
          selectionStart,
          selectionEnd,
          '**',
          '**',
          'teks penting'
        )
        break
      case 'italic':
        transformed = applyInlineFormat(
          value,
          selectionStart,
          selectionEnd,
          '*',
          '*',
          'teks editorial'
        )
        break
      case 'underline':
        transformed = applyInlineFormat(
          value,
          selectionStart,
          selectionEnd,
          '__',
          '__',
          'teks digarisbawahi'
        )
        break
      case 'bullet-list':
        transformed = applyLineFormat(
          value,
          selectionStart,
          selectionEnd,
          (line) => `- ${line.replace(/^[-*•]\s+/, '').trim()}`,
          '- poin pertama\n- poin kedua'
        )
        break
      case 'numbered-list':
        transformed = applyLineFormat(
          value,
          selectionStart,
          selectionEnd,
          (line, index) => `${index}) ${line.replace(/^\d+[.)]\s+/, '').trim()}`,
          '1) poin pertama\n2) poin kedua'
        )
        break
      default:
        return
    }

    updateBlogContent(
      transformed.value,
      transformed.selectionStart,
      transformed.selectionEnd
    )
  }

  const runManagedListLoad = async (
    key: keyof ManagedListLoadingState,
    loader: () => Promise<void>,
    fallbackMessage: string
  ) => {
    setListLoading((current) => ({ ...current, [key]: true }))
    setListErrors((current) => ({ ...current, [key]: null }))

    try {
      await loader()
    } catch (err: any) {
      const message = err?.message || fallbackMessage

      if (isTransientListError(message)) {
        setListRetrying((current) => ({ ...current, [key]: true }))
        try {
          await wait(LIST_RETRY_DELAY_MS)
          await loader()
          return
        } catch (retryErr: any) {
          setListErrors((current) => ({
            ...current,
            [key]: formatHumanListError(retryErr?.message || message),
          }))
          throw retryErr
        } finally {
          setListRetrying((current) => ({ ...current, [key]: false }))
        }
      }

      setListErrors((current) => ({ ...current, [key]: formatHumanListError(message) }))
      throw err
    } finally {
      setListLoading((current) => ({ ...current, [key]: false }))
    }
  }

  const loadServiceList = async (authToken = token) => {
    if (!authToken) return

    const serviceQuery = buildQueryString({
      page: String(servicePage),
      limit: String(DEFAULT_PAGE_SIZE),
      status: serviceStatusFilter !== 'all' ? serviceStatusFilter : undefined,
      q: debouncedServiceSearch.trim() || undefined,
    })
    await runManagedListLoad('services', async () => {
      const payload = await adminFetch<PaginatedResponse<ServiceItem>>(
        authToken,
        withCmsScope(`/services?${serviceQuery}`)
      )
      setServices(payload.data)
      setServiceMeta(payload.meta || emptyPaginatedMeta())
      setListUpdatedAt((current) => ({ ...current, services: Date.now() }))
    }, 'Gagal memuat layanan.')
  }

  const loadProjectList = async (authToken = token) => {
    if (!authToken) return

    const projectQuery = buildQueryString({
      page: String(projectPage),
      limit: String(DEFAULT_PAGE_SIZE),
      status: projectStatusFilter !== 'all' ? projectStatusFilter : undefined,
      q: debouncedProjectSearch.trim() || undefined,
    })
    await runManagedListLoad('projects', async () => {
      const payload = await adminFetch<PaginatedResponse<ProjectItem>>(
        authToken,
        withCmsScope(`/projects?${projectQuery}`)
      )
      setProjects(payload.data)
      setProjectMeta(payload.meta || emptyPaginatedMeta())
      setListUpdatedAt((current) => ({ ...current, projects: Date.now() }))
    }, 'Gagal memuat project.')
  }

  const loadBlogList = async (authToken = token) => {
    if (!authToken) return

    const blogQuery = buildQueryString({
      page: String(blogPage),
      limit: String(DEFAULT_PAGE_SIZE),
      status: blogStatusFilter !== 'all' ? blogStatusFilter : undefined,
      q: debouncedBlogSearch.trim() || undefined,
    })
    await runManagedListLoad('blog', async () => {
      const payload = await adminFetch<PaginatedResponse<BlogItem>>(
        authToken,
        withCmsScope(`/blog?${blogQuery}`)
      )
      setPosts(payload.data)
      setBlogMeta(payload.meta || emptyPaginatedMeta())
      setListUpdatedAt((current) => ({ ...current, blog: Date.now() }))
    }, 'Gagal memuat artikel.')
  }

  const loadTestimonialList = async (authToken = token) => {
    if (!authToken) return

    const testimonialQuery = buildQueryString({
      page: String(testimonialPage),
      limit: String(DEFAULT_PAGE_SIZE),
      status: testimonialStatusFilter !== 'all' ? testimonialStatusFilter : undefined,
      q: debouncedTestimonialSearch.trim() || undefined,
    })
    await runManagedListLoad('testimonials', async () => {
      const payload = await adminFetch<PaginatedResponse<TestimonialItem>>(
        authToken,
        withCmsScope(`/testimonials?${testimonialQuery}`)
      )
      setTestimonials(payload.data)
      setTestimonialMeta(payload.meta || emptyPaginatedMeta())
      setListUpdatedAt((current) => ({ ...current, testimonials: Date.now() }))
    }, 'Gagal memuat testimonial.')
  }

  const loadTeamList = async (authToken = token) => {
    if (!authToken) return

    const teamQuery = buildQueryString({
      page: String(teamPage),
      limit: String(DEFAULT_PAGE_SIZE),
      status: teamStatusFilter !== 'all' ? teamStatusFilter : undefined,
      q: debouncedTeamSearch.trim() || undefined,
    })
    await runManagedListLoad('team', async () => {
      const payload = await adminFetch<PaginatedResponse<TeamItem>>(
        authToken,
        withCmsScope(`/team?${teamQuery}`)
      )
      setTeamMembers(payload.data)
      setTeamMeta(payload.meta || emptyPaginatedMeta())
      setListUpdatedAt((current) => ({ ...current, team: Date.now() }))
    }, 'Gagal memuat data tim.')
  }

  const loadLeadList = async (authToken = token) => {
    if (!authToken) return

    const leadQuery = buildQueryString({
      page: String(leadPage),
      limit: String(LEADS_PAGE_SIZE),
      status: leadFilter !== 'all' ? leadFilter : undefined,
    })
    await runManagedListLoad('leads', async () => {
      const payload = await adminFetch<PaginatedResponse<LeadItem>>(authToken, `/consultations?${leadQuery}`)
      setLeads(payload.data)
      setLeadMeta(payload.meta || emptyPaginatedMeta())
      setLeadDrafts((current) =>
        Object.fromEntries(
          payload.data.map((lead) => [
            lead.id,
            current[lead.id] ?? { status: lead.status, notes: lead.notes || '' },
          ])
        )
      )
      setListUpdatedAt((current) => ({ ...current, leads: Date.now() }))
    }, 'Gagal memuat lead.')
  }

  const refreshDashboardAndLeads = async (authToken = token, announce = false) => {
    if (!authToken) return

    try {
      const statsPayload = await adminFetch<{ data: Stats }>(authToken, '/dashboard/stats')
      setStats(statsPayload.data)
      await loadLeadList(authToken)

      if (announce) {
        pushToast('success', 'Lead baru dari website berhasil dimuat ke CMS.')
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyegarkan data lead dari website.')
    }
  }

  const hydrate = async (authToken = token, background = false, reloadManagedLists = true) => {
    if (!authToken) {
      window.location.replace(`/login?redirect=${encodeURIComponent(getCmsLoginRedirectPath())}`)
      return
    }

    try {
      setError('')
      if (background) setRefreshing(true)
      else setLoading(true)

      const [
        statsPayload,
        mePayload,
      ] = await Promise.all([
        adminFetch<{ data: Stats }>(authToken, '/dashboard/stats'),
        adminFetch<{ data: { role?: string; name?: string; email?: string } }>(authToken, '/auth/me'),
      ])

      setStats(statsPayload.data)
      setCurrentUserRole(mePayload.data?.role || '')
      setCurrentUserName(mePayload.data?.name || '')
      setCurrentUserEmail(mePayload.data?.email || '')
      if (reloadManagedLists) {
        setManagedListsReloadKey((current) => current + 1)
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data CMS.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const currentToken = SESSION_TOKEN
    setToken(currentToken)
    hydrate(currentToken, false, false)
  }, [])

  useEffect(() => {
    if (activeSection === 'settings' && !canManageSettings) {
      setActiveSection('dashboard')
    }
  }, [activeSection, canManageSettings])

  useEffect(() => {
    if (activeSection === 'users' && !canManageUsers) {
      setActiveSection('dashboard')
    }
  }, [activeSection, canManageUsers])

  useEffect(() => {
    if (!token) return
    loadProjectList(token).catch((err: any) => setError(err.message || 'Gagal memuat project.'))
  }, [token, projectPage, debouncedProjectSearch, projectStatusFilter, managedListsReloadKey])

  useEffect(() => {
    if (!token) return
    loadBlogList(token).catch((err: any) => setError(err.message || 'Gagal memuat artikel.'))
  }, [token, blogPage, debouncedBlogSearch, blogStatusFilter, managedListsReloadKey])

  useEffect(() => {
    if (!token) return
    loadServiceList(token).catch((err: any) => setError(err.message || 'Gagal memuat layanan.'))
  }, [token, servicePage, debouncedServiceSearch, serviceStatusFilter, managedListsReloadKey])

  useEffect(() => {
    if (!token) return
    loadTestimonialList(token).catch((err: any) =>
      setError(err.message || 'Gagal memuat testimonial.')
    )
  }, [token, testimonialPage, debouncedTestimonialSearch, testimonialStatusFilter, managedListsReloadKey])

  useEffect(() => {
    if (!token) return
    loadTeamList(token).catch((err: any) => setError(err.message || 'Gagal memuat data tim.'))
  }, [token, teamPage, debouncedTeamSearch, teamStatusFilter, managedListsReloadKey])

  useEffect(() => {
    if (!token) return
    loadLeadList(token).catch((err: any) => setError(err.message || 'Gagal memuat lead.'))
  }, [token, leadPage, leadFilter, managedListsReloadKey])

  useEffect(() => {
    if (!token) return

    let isDisposed = false

    const syncIncomingLeads = (announce = false) => {
      if (isDisposed) return
      refreshDashboardAndLeads(token, announce).catch(() => {})
    }

    const handleLeadSubmitted = () => syncIncomingLeads(true)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === LEAD_SUBMITTED_STORAGE_KEY && event.newValue) {
        syncIncomingLeads(true)
      }
    }
    const handleFocus = () => syncIncomingLeads(false)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncIncomingLeads(false)
      }
    }
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncIncomingLeads(false)
      }
    }, CMS_LEAD_SYNC_INTERVAL_MS)

    window.addEventListener(LEAD_SUBMITTED_EVENT, handleLeadSubmitted as EventListener)
    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isDisposed = true
      window.removeEventListener(LEAD_SUBMITTED_EVENT, handleLeadSubmitted as EventListener)
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.clearInterval(interval)
    }
  }, [token, leadPage, leadFilter])

  useEffect(() => {
    if (!flash) return
    pushToast('success', flash)
    setFlash('')
  }, [flash])

  useEffect(() => {
    if (!error) return
    pushToast('error', error)
    setError('')
  }, [error])

  useEffect(() => {
    setProjectPage(1)
  }, [debouncedProjectSearch, projectStatusFilter])

  useEffect(() => {
    setBlogPage(1)
  }, [debouncedBlogSearch, blogStatusFilter])

  useEffect(() => {
    setServicePage(1)
  }, [debouncedServiceSearch, serviceStatusFilter])

  useEffect(() => {
    setTestimonialPage(1)
  }, [debouncedTestimonialSearch, testimonialStatusFilter])

  useEffect(() => {
    setTeamPage(1)
  }, [debouncedTeamSearch, teamStatusFilter])

  useEffect(() => {
    setLeadPage(1)
  }, [leadFilter])

  useEffect(() => {
    const saved = window.localStorage.getItem(
      `cms-project-draft-${editingProjectId ?? 'new'}`
    )
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      setProjectForm((current) => ({ ...current, ...parsed }))
    } catch {}
  }, [editingProjectId])

  useEffect(() => {
    setProjectDraftState('saving')
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(
        `cms-project-draft-${editingProjectId ?? 'new'}`,
        JSON.stringify(projectForm)
      )
      setProjectDraftState('saved')
    }, DRAFT_SAVE_DELAY_MS)

    return () => window.clearTimeout(timeout)
  }, [projectForm, editingProjectId])

  useEffect(() => {
    if (editingPostId !== null) return
    const saved = window.localStorage.getItem(`cms-blog-draft-${editingPostId ?? 'new'}`)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      setBlogForm((current) => ({ ...current, ...parsed }))
    } catch {}
  }, [editingPostId])

  useEffect(() => {
    if (!editingBlogSnapshot) return

    setBlogForm({
      title: editingBlogSnapshot.title || '',
      excerpt: editingBlogSnapshot.excerpt || '',
      content: editingBlogSnapshot.content || '',
      category: editingBlogSnapshot.category || 'tips',
      status: editingBlogSnapshot.status || 'draft',
      tagsText: normalizeStringList(editingBlogSnapshot.tags).join(', '),
      read_time: editingBlogSnapshot.read_time?.toString() || '5',
      meta_title: editingBlogSnapshot.meta_title || '',
      meta_desc: editingBlogSnapshot.meta_desc || '',
    })
    setBlogCoverFile(null)
    setBlogDraftState('saved')
  }, [editingBlogSnapshot])

  useEffect(() => {
    setBlogDraftState('saving')
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(
        `cms-blog-draft-${editingPostId ?? 'new'}`,
        JSON.stringify(blogForm)
      )
      setBlogDraftState('saved')
    }, DRAFT_SAVE_DELAY_MS)

    return () => window.clearTimeout(timeout)
  }, [blogForm, editingPostId])

  useEffect(() => {
    const saved = window.localStorage.getItem(
      `cms-testimonial-draft-${editingTestimonialId ?? 'new'}`
    )
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      setTestimonialForm((current) => ({ ...current, ...parsed }))
    } catch {}
  }, [editingTestimonialId])

  useEffect(() => {
    setTestimonialDraftState('saving')
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(
        `cms-testimonial-draft-${editingTestimonialId ?? 'new'}`,
        JSON.stringify(testimonialForm)
      )
      setTestimonialDraftState('saved')
    }, DRAFT_SAVE_DELAY_MS)

    return () => window.clearTimeout(timeout)
  }, [testimonialForm, editingTestimonialId])

  const logout = () => {
    setToken('')
    logoutSession().finally(() => {
      window.location.replace('/login')
    })
  }

  const resetProjectEditor = () => {
    window.localStorage.removeItem(`cms-project-draft-${editingProjectId ?? 'new'}`)
    setEditingProjectId(null)
    setProjectForm(emptyProjectForm())
    setProjectDraftState('idle')
    setProjectCoverFile(null)
    setProjectGalleryFiles([])
    setEditingProjectImages([])
    setFlash('')
  }

  const resetBlogEditor = () => {
    window.localStorage.removeItem(`cms-blog-draft-${editingPostId ?? 'new'}`)
    setEditingPostId(null)
    setEditingBlogSnapshot(null)
    setBlogForm(emptyBlogForm())
    setBlogDraftState('idle')
    setBlogCoverFile(null)
    setFlash('')
  }

  const resetServiceEditor = () => {
    setEditingServiceId(null)
    setServiceForm(emptyServiceForm())
    setServiceIconFile(null)
    setFlash('')
  }

  const resetTestimonialEditor = () => {
    window.localStorage.removeItem(`cms-testimonial-draft-${editingTestimonialId ?? 'new'}`)
    setEditingTestimonialId(null)
    setTestimonialForm(emptyTestimonialForm())
    setTestimonialDraftState('idle')
    setTestimonialAvatarFile(null)
    setFlash('')
  }

  const resetTeamEditor = () => {
    setEditingTeamId(null)
    setTeamForm(emptyTeamForm())
    setTeamAvatarFile(null)
    setFlash('')
  }

  const handleDelete = async (
    type: 'projects' | 'blog' | 'services' | 'testimonials' | 'team',
    id: number
  ) => {
    const confirmed = await requestConfirmation({
      title: 'Hapus item ini?',
      description:
        'Item yang dihapus akan langsung hilang dari CMS dan tidak bisa dipulihkan otomatis.',
      confirmLabel: 'Delete item',
      tone: 'danger',
    })
    if (!confirmed) return

    try {
      setSaving(true)
      setBusyKey(`delete-${type}-${id}`)
      setError('')
      setFlash('')

      const endpoint =
        type === 'projects'
          ? `/projects/${id}`
          : type === 'blog'
            ? `/blog/${id}`
            : type === 'services'
              ? `/services/${id}`
              : type === 'testimonials'
                ? `/testimonials/${id}`
                : `/team/${id}`
      await adminFetch(token, endpoint, { method: 'DELETE' })

      if (type === 'projects' && editingProjectId === id) resetProjectEditor()
      if (type === 'blog' && editingPostId === id) resetBlogEditor()
      if (type === 'services' && editingServiceId === id) resetServiceEditor()
      if (type === 'testimonials' && editingTestimonialId === id) resetTestimonialEditor()
      if (type === 'team' && editingTeamId === id) resetTeamEditor()

      setFlash('Item berhasil dihapus.')
      await hydrate(undefined, true)
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus item.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const loadProjectEditor = async (item: ProjectItem) => {
    setEditingProjectId(item.id)
    setProjectForm({
      title: item.title || '',
      description: item.description || '',
      location: item.location || '',
      area_sqm: item.area_sqm?.toString() || '',
      category: item.category || 'residential',
      status: item.status || 'draft',
      is_featured: Boolean(item.is_featured),
      year_completed: item.year_completed?.toString() || '',
      client_name: item.client_name || '',
      sort_order: item.sort_order?.toString() || '0',
      meta_title: item.meta_title || '',
      meta_desc: item.meta_desc || '',
    })
    setProjectCoverFile(null)
    setProjectGalleryFiles([])

    try {
      const response = await adminFetch<{ data: { images?: ProjectGalleryImage[] } }>(
        token,
        withCmsScope(`/projects/${item.slug}`)
      )
      setEditingProjectImages(response.data.images || [])
    } catch {
      setEditingProjectImages([])
    }
  }

  const populateBlogEditor = (item: BlogItem) => {
    setEditingPostId(item.id)
    setEditingBlogSnapshot(item)
  }

  const scrollBlogEditorIntoView = () => {
    window.requestAnimationFrame(() => {
      blogEditorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const loadBlogEditor = async (item: BlogItem) => {
    populateBlogEditor(item)
    scrollBlogEditorIntoView()

    if (!token || !item.slug) return

    try {
      setBusyKey('blog-editor')
      const response = await adminFetch<{ data: BlogItem }>(
        token,
        withCmsScope(`/blog/${item.slug}`)
      )
      populateBlogEditor(response.data)
      scrollBlogEditorIntoView()
    } catch (err: any) {
      setError(err.message || 'Gagal memuat detail artikel.')
    } finally {
      setBusyKey('')
    }
  }

  const reorderContentItem = async (
    type: 'services' | 'testimonials' | 'team',
    id: number,
    direction: 'up' | 'down'
  ) => {
    const source =
      type === 'services' ? services : type === 'testimonials' ? testimonials : teamMembers
    const sorted = [...source].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    const index = sorted.findIndex((item) => item.id === id)
    const swapIndex = direction === 'up' ? index - 1 : index + 1

    if (index === -1 || swapIndex < 0 || swapIndex >= sorted.length) return

    const currentItem = sorted[index]
    const targetItem = sorted[swapIndex]
    const currentSort = currentItem.sort_order || index
    const targetSort = targetItem.sort_order || swapIndex
    const endpointBase =
      type === 'services' ? '/services' : type === 'testimonials' ? '/testimonials' : '/team'

    try {
      setSaving(true)
      setBusyKey(`reorder-${type}-${id}`)
      setError('')
      setFlash('')

      await Promise.all([
        adminFetch(token, `${endpointBase}/${currentItem.id}`, {
          method: 'PUT',
          body: JSON.stringify({ sort_order: targetSort }),
        }),
        adminFetch(token, `${endpointBase}/${targetItem.id}`, {
          method: 'PUT',
          body: JSON.stringify({ sort_order: currentSort }),
        }),
      ])

      setFlash('Urutan item berhasil diperbarui.')
      await hydrate(undefined, true)
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah urutan item.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const submitProject = async () => {
    try {
      setSaving(true)
      setBusyKey('project-form')
      setError('')
      setFlash('')
      const endpoint = editingProjectId ? `/projects/${editingProjectId}` : '/projects'
      const method = editingProjectId ? 'PUT' : 'POST'
      const payload = {
        ...projectForm,
        area_sqm: projectForm.area_sqm || null,
        year_completed: projectForm.year_completed || null,
        sort_order: Number(projectForm.sort_order || 0),
        status: canPublish ? projectForm.status : 'draft',
      }

      if (projectCoverFile) {
        const body = new FormData()
        Object.entries(payload).forEach(([key, value]) => {
          body.append(key, String(value ?? ''))
        })
        body.append('cover', projectCoverFile)
        await uploadSingleAssetWithProgress({
          endpoint,
          method,
          body,
          progressKey: projectCoverFile.name,
        })
      } else {
        await adminFetch(token, endpoint, {
          method,
          body: JSON.stringify(payload),
        })
      }

      setFlash(editingProjectId ? 'Project berhasil diperbarui.' : 'Project baru berhasil dibuat.')
      if (!canPublish && projectForm.status === 'published') {
        pushToast('success', 'Konten disimpan sebagai draft. Hanya superadmin yang dapat publish.')
      }
      resetProjectEditor()
      await hydrate(undefined, true)
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan project.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const submitBlog = async () => {
    try {
      setSaving(true)
      setBusyKey('blog-form')
      setError('')
      setFlash('')

      const endpoint = editingPostId ? `/blog/${editingPostId}` : '/blog'
      const method = editingPostId ? 'PUT' : 'POST'
      const payload = {
        title: blogForm.title,
        excerpt: blogForm.excerpt,
        content: blogForm.content,
        category: blogForm.category,
        status: canPublish ? blogForm.status : 'draft',
        tags: JSON.stringify(splitCommaValues(blogForm.tagsText)),
        read_time: Number(blogForm.read_time || 5),
        meta_title: blogForm.meta_title,
        meta_desc: blogForm.meta_desc,
      }

      if (blogCoverFile) {
        const body = new FormData()
        Object.entries(payload).forEach(([key, value]) => {
          body.append(key, String(value ?? ''))
        })
        body.append('cover', blogCoverFile)
        await uploadSingleAssetWithProgress({
          endpoint,
          method,
          body,
          progressKey: blogCoverFile.name,
        })
      } else {
        await adminFetch(token, endpoint, {
          method,
          body: JSON.stringify(payload),
        })
      }

      setFlash(editingPostId ? 'Artikel berhasil diperbarui.' : 'Artikel baru berhasil dibuat.')
      if (!canPublish && blogForm.status === 'published') {
        pushToast('success', 'Artikel disimpan sebagai draft. Hanya superadmin yang dapat publish.')
      }
      resetBlogEditor()
      await hydrate(undefined, true)
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan artikel.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const submitService = async () => {
    try {
      setSaving(true)
      setBusyKey('service-form')
      setError('')
      setFlash('')

      const endpoint = editingServiceId ? `/services/${editingServiceId}` : '/services'
      const method = editingServiceId ? 'PUT' : 'POST'
      const payload = {
        title: serviceForm.title,
        description: serviceForm.description,
        icon: serviceForm.icon,
        features: JSON.stringify(splitCommaValues(serviceForm.featuresText)),
        price_from: serviceForm.price_from || null,
        is_active: serviceForm.is_active,
        sort_order: Number(serviceForm.sort_order || 0),
      }

      if (serviceIconFile) {
        const body = new FormData()
        Object.entries(payload).forEach(([key, value]) => {
          body.append(key, String(value ?? ''))
        })
        body.append('icon', serviceIconFile)
        await uploadSingleAssetWithProgress({
          endpoint,
          method,
          body,
          progressKey: serviceIconFile.name,
        })
      } else {
        await adminFetch(token, endpoint, {
          method,
          body: JSON.stringify(payload),
        })
      }

      setFlash(editingServiceId ? 'Layanan berhasil diperbarui.' : 'Layanan baru berhasil dibuat.')
      resetServiceEditor()
      await hydrate(undefined, true)
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan layanan.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const submitTestimonial = async () => {
    try {
      setSaving(true)
      setBusyKey('testimonial-form')
      setError('')
      setFlash('')

      const endpoint = editingTestimonialId ? `/testimonials/${editingTestimonialId}` : '/testimonials'
      const method = editingTestimonialId ? 'PUT' : 'POST'
      const body = new FormData()

      body.append('client_name', testimonialForm.client_name)
      body.append('client_title', testimonialForm.client_title)
      body.append('content', testimonialForm.content)
      body.append('rating', testimonialForm.rating)
      body.append('project_id', testimonialForm.project_id)
      body.append('is_featured', String(testimonialForm.is_featured))
      body.append('is_active', String(testimonialForm.is_active))
      body.append('sort_order', testimonialForm.sort_order)

      if (testimonialAvatarFile) {
        body.append('avatar', testimonialAvatarFile)
      }

      await uploadSingleAssetWithProgress({
        endpoint,
        method,
        body,
        progressKey: testimonialAvatarFile?.name || 'testimonial-form',
      })
      setFlash(
        editingTestimonialId ? 'Testimonial berhasil diperbarui.' : 'Testimonial baru berhasil dibuat.'
      )
      resetTestimonialEditor()
      await hydrate(undefined, true)
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan testimonial.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const submitTeam = async () => {
    try {
      setSaving(true)
      setBusyKey('team-form')
      setError('')
      setFlash('')

      const endpoint = editingTeamId ? `/team/${editingTeamId}` : '/team'
      const method = editingTeamId ? 'PUT' : 'POST'
      const body = new FormData()

      body.append('name', teamForm.name)
      body.append('role', teamForm.role)
      body.append('bio', teamForm.bio)
      body.append('instagram', teamForm.instagram)
      body.append('linkedin', teamForm.linkedin)
      body.append('is_active', String(teamForm.is_active))
      body.append('sort_order', teamForm.sort_order)

      if (teamAvatarFile) {
        body.append('avatar', teamAvatarFile)
      }

      await uploadSingleAssetWithProgress({
        endpoint,
        method,
        body,
        progressKey: teamAvatarFile?.name || 'team-form',
      })
      setFlash(editingTeamId ? 'Data tim berhasil diperbarui.' : 'Anggota tim berhasil dibuat.')
      resetTeamEditor()
      await hydrate(undefined, true)
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data tim.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const updateLead = async (id: number, status: string, notes: string) => {
    try {
      setSaving(true)
      setBusyKey(`lead-${id}`)
      setError('')
      setFlash('')
      await adminFetch(token, `/consultations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      })
      setFlash('Status lead berhasil diperbarui.')
      await hydrate(undefined, true)
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui lead.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const uploadProjectGallery = async () => {
    if (!editingProjectId || projectGalleryFiles.length === 0) return

    try {
      setSaving(true)
      setBusyKey('project-gallery')
      setError('')
      setFlash('')

      for (const file of projectGalleryFiles) {
        const body = new FormData()
        body.append('images', file)
        body.append('alt_text', projectForm.title || 'Project image')
        await uploadSingleAssetWithProgress({
          endpoint: `/projects/${editingProjectId}/images`,
          method: 'POST',
          body,
          progressKey: file.name,
        })
      }
      setProjectGalleryFiles([])
      setFlash('Galeri project berhasil diunggah.')
      await hydrate(undefined, true)
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah galeri project.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const removeProjectGalleryImage = async (imageId: number) => {
    try {
      setSaving(true)
      setBusyKey(`gallery-delete-${imageId}`)
      setError('')
      setFlash('')
      await adminFetch(token, `/projects/images/${imageId}`, { method: 'DELETE' })
      setFlash('Gambar galeri berhasil dihapus.')
      await hydrate(undefined, true)
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus gambar galeri.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const reorderProjectGalleryImage = async (imageId: number, direction: 'up' | 'down') => {
    const sorted = [...editingProjectImages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    const index = sorted.findIndex((image) => image.id === imageId)
    const swapIndex = direction === 'up' ? index - 1 : index + 1

    if (index === -1 || swapIndex < 0 || swapIndex >= sorted.length) return

    const currentImage = sorted[index]
    const targetImage = sorted[swapIndex]
    const currentSort = currentImage.sort_order || index
    const targetSort = targetImage.sort_order || swapIndex

    try {
      setSaving(true)
      setBusyKey(`gallery-sort-${imageId}`)
      setError('')
      setFlash('')

      await Promise.all([
        adminFetch(token, `/projects/images/${currentImage.id}/sort`, {
          method: 'PATCH',
          body: JSON.stringify({ sort_order: targetSort }),
        }),
        adminFetch(token, `/projects/images/${targetImage.id}/sort`, {
          method: 'PATCH',
          body: JSON.stringify({ sort_order: currentSort }),
        }),
      ])

      setFlash('Urutan galeri berhasil diperbarui.')
      if (editingProjectId) {
        const activeProject = projects.find((project) => project.id === editingProjectId)
        if (activeProject) await loadProjectEditor(activeProject)
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah urutan galeri.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const uploadSingleAssetWithProgress = async ({
    endpoint,
    method,
    body,
    progressKey,
  }: {
    endpoint: string
    method: string
    body: FormData
    progressKey: string
  }) => {
    setUploadProgress((current) => ({ ...current, [progressKey]: 0 }))
    await adminUploadWithProgress(token, endpoint, body, method, (progress) => {
      setUploadProgress((current) => ({ ...current, [progressKey]: progress }))
    })
    setUploadProgress((current) => ({ ...current, [progressKey]: 100 }))
  }

  const moveByDrag = async (
    type: 'services' | 'testimonials' | 'team' | 'gallery',
    draggedId: number,
    targetId: number
  ) => {
    if (draggedId === targetId) return

    if (type === 'gallery') {
      const sorted = [...editingProjectImages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      const targetIndex = sorted.findIndex((item) => item.id === targetId)
      if (targetIndex === -1) return
      await reorderProjectGalleryToIndex(draggedId, targetIndex)
      return
    }

    const source =
      type === 'services' ? services : type === 'testimonials' ? testimonials : teamMembers
    const sorted = [...source].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    const draggedIndex = sorted.findIndex((item) => item.id === draggedId)
    const targetIndex = sorted.findIndex((item) => item.id === targetId)
    if (draggedIndex === -1 || targetIndex === -1) return

    const reordered = [...sorted]
    const [draggedItem] = reordered.splice(draggedIndex, 1)
    reordered.splice(targetIndex, 0, draggedItem)

    const endpointBase =
      type === 'services' ? '/services' : type === 'testimonials' ? '/testimonials' : '/team'

    try {
      setSaving(true)
      setBusyKey(`drag-${type}-${draggedId}`)
      setError('')
      setFlash('')

      await Promise.all(
        reordered.map((item, index) =>
          adminFetch(token, `${endpointBase}/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify({ sort_order: index }),
          })
        )
      )

      setFlash('Urutan item berhasil diperbarui.')
      await hydrate(undefined, true)
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan urutan item.')
    } finally {
      setSaving(false)
      setBusyKey('')
      setDragItem(null)
      setDropTarget(null)
    }
  }

  const reorderProjectGalleryToIndex = async (draggedId: number, targetIndex: number) => {
    const sorted = [...editingProjectImages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    const draggedIndex = sorted.findIndex((item) => item.id === draggedId)
    if (draggedIndex === -1 || targetIndex < 0 || targetIndex >= sorted.length) return

    const reordered = [...sorted]
    const [draggedItem] = reordered.splice(draggedIndex, 1)
    reordered.splice(targetIndex, 0, draggedItem)

    try {
      setSaving(true)
      setBusyKey(`drag-gallery-${draggedId}`)
      setError('')
      setFlash('')

      await Promise.all(
        reordered.map((item, index) =>
          adminFetch(token, `/projects/images/${item.id}/sort`, {
            method: 'PATCH',
            body: JSON.stringify({ sort_order: index }),
          })
        )
      )

      setFlash('Urutan galeri berhasil diperbarui.')
      if (editingProjectId) {
        const activeProject = projects.find((project) => project.id === editingProjectId)
        if (activeProject) await loadProjectEditor(activeProject)
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan urutan galeri.')
    } finally {
      setSaving(false)
      setBusyKey('')
      setDragItem(null)
      setDropTarget(null)
    }
  }

  const toggleSelection = (
    setter: Dispatch<SetStateAction<number[]>>,
    id: number
  ) => {
    setter((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  const fetchAllIdsFromEndpoint = async <
    T extends { id: number }
  >(
    endpoint: string
  ) => {
    const ids: number[] = []
    let page = 1
    let hasNextPage = true

    while (hasNextPage) {
      const separator = endpoint.includes('?') ? '&' : '?'
      const payload = await adminFetch<PaginatedResponse<T>>(
        token,
        `${endpoint}${separator}page=${page}&limit=${BULK_SELECT_BATCH_SIZE}`
      )

      ids.push(...payload.data.map((item) => item.id))
      hasNextPage = Boolean(payload.meta?.hasNextPage)
      page += 1
    }

    return Array.from(new Set(ids))
  }

  const selectAllAcrossDataset = async (
    section: 'projects' | 'blog' | 'services' | 'testimonials' | 'team' | 'leads'
  ) => {
    try {
      setSelectionBusyKey(section)
      setError('')

      if (section === 'projects') {
        const query = buildQueryString({
          status: projectStatusFilter !== 'all' ? projectStatusFilter : undefined,
          q: debouncedProjectSearch.trim() || undefined,
        })
        const ids = await fetchAllIdsFromEndpoint<ProjectItem>(
          withCmsScope(`/projects${query ? `?${query}` : ''}`)
        )
        setSelectedProjectIds(ids)
        setFlash(`${ids.length} project berhasil dipilih dari seluruh dataset.`)
        return
      }

      if (section === 'blog') {
        const query = buildQueryString({
          status: blogStatusFilter !== 'all' ? blogStatusFilter : undefined,
          q: debouncedBlogSearch.trim() || undefined,
        })
        const ids = await fetchAllIdsFromEndpoint<BlogItem>(
          withCmsScope(`/blog${query ? `?${query}` : ''}`)
        )
        setSelectedBlogIds(ids)
        setFlash(`${ids.length} artikel berhasil dipilih dari seluruh dataset.`)
        return
      }

      if (section === 'leads') {
        const query = buildQueryString({
          status: leadFilter !== 'all' ? leadFilter : undefined,
        })
        const ids = await fetchAllIdsFromEndpoint<LeadItem>(
          `/consultations${query ? `?${query}` : ''}`
        )
        setSelectedLeadIds(ids)
        setFlash(`${ids.length} lead berhasil dipilih dari seluruh dataset.`)
        return
      }

      if (section === 'services') {
        const query = buildQueryString({
          status: serviceStatusFilter !== 'all' ? serviceStatusFilter : undefined,
          q: debouncedServiceSearch.trim() || undefined,
        })
        const ids = await fetchAllIdsFromEndpoint<ServiceItem>(
          withCmsScope(`/services${query ? `?${query}` : ''}`)
        )
        setSelectedServiceIds(ids)
        setFlash(`${ids.length} layanan berhasil dipilih dari seluruh dataset.`)
        return
      }

      if (section === 'testimonials') {
        const query = buildQueryString({
          status: testimonialStatusFilter !== 'all' ? testimonialStatusFilter : undefined,
          q: debouncedTestimonialSearch.trim() || undefined,
        })
        const ids = await fetchAllIdsFromEndpoint<TestimonialItem>(
          withCmsScope(`/testimonials${query ? `?${query}` : ''}`)
        )
        setSelectedTestimonialIds(ids)
        setFlash(`${ids.length} testimonial berhasil dipilih dari seluruh dataset.`)
        return
      }

      const query = buildQueryString({
        status: teamStatusFilter !== 'all' ? teamStatusFilter : undefined,
        q: debouncedTeamSearch.trim() || undefined,
      })
      const ids = await fetchAllIdsFromEndpoint<TeamItem>(
        withCmsScope(`/team${query ? `?${query}` : ''}`)
      )
      setSelectedTeamIds(ids)
      setFlash(`${ids.length} anggota tim berhasil dipilih dari seluruh dataset.`)
    } catch (err: any) {
      setError(err.message || 'Gagal memilih seluruh dataset.')
    } finally {
      setSelectionBusyKey('')
    }
  }

  const bulkDelete = async (
    type: 'projects' | 'blog' | 'services' | 'testimonials' | 'team',
    ids: number[],
    clearSelection: Dispatch<SetStateAction<number[]>>
  ) => {
    if (!ids.length) return
    const confirmed = await requestConfirmation({
      title: `Hapus ${ids.length} item di section ${type}?`,
      description:
        'Aksi ini permanen dan akan menghapus konten terpilih dari CMS. Data yang sudah dihapus tidak bisa dipulihkan otomatis.',
      confirmLabel: 'Delete selected',
      tone: 'danger',
    })
    if (!confirmed) {
      return
    }

    try {
      setSaving(true)
      setBusyKey(`bulk-delete-${type}`)
      await Promise.all(ids.map((id) => handleDelete(type, id)))
      clearSelection([])
      setFlash(`${ids.length} item berhasil dihapus.`)
    } catch (err: any) {
      setError(err.message || 'Bulk delete gagal dijalankan.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const bulkUpdateLeads = async (status: string) => {
    if (!selectedLeadIds.length) return
    const confirmed = await requestConfirmation({
      title: `Ubah ${selectedLeadIds.length} lead menjadi ${status}?`,
      description:
        'Status baru akan diterapkan ke semua lead terpilih. Catatan follow up yang sudah ada akan tetap dipertahankan.',
      confirmLabel: `Save ${status}`,
      tone: 'default',
    })
    if (!confirmed) {
      return
    }

    try {
      setSaving(true)
      setBusyKey(`bulk-leads-${status}`)
      await Promise.all(
        selectedLeadIds.map((id) => {
          const draft = leadDrafts[id]
          return adminFetch(token, `/consultations/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status, notes: draft?.notes || '' }),
          })
        })
      )
      setSelectedLeadIds([])
      setFlash(`Status ${selectedLeadIds.length} lead berhasil diubah ke ${status}.`)
      await hydrate(undefined, true)
    } catch (err: any) {
      setError(err.message || 'Bulk update lead gagal.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const bulkSetContentStatus = async (
    type: 'projects' | 'blog',
    ids: number[],
    status: 'published' | 'draft'
  ) => {
    if (!ids.length) return
    if (!canPublish) {
      setError('Hanya superadmin yang dapat mengubah status publish.')
      return
    }
    const confirmed = await requestConfirmation({
      title: `Ubah ${ids.length} item ${type} menjadi ${status}?`,
      description:
        'Perubahan ini akan langsung memengaruhi konten yang tampil di website publik dan area editorial CMS.',
      confirmLabel: status === 'published' ? 'Publish selected' : 'Unpublish selected',
      tone: 'default',
    })
    if (!confirmed) {
      return
    }

    try {
      setSaving(true)
      setBusyKey(`bulk-status-${type}-${status}`)
      const source = type === 'projects' ? projects : posts
      const endpointBase = type === 'projects' ? '/projects' : '/blog'

      await Promise.all(
        ids.map((id) => {
          const item = source.find((entry) => entry.id === id)
          return adminFetch(token, `${endpointBase}/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
              ...(item || {}),
              status,
            }),
          })
        })
      )

      if (type === 'projects') setSelectedProjectIds([])
      else setSelectedBlogIds([])

      setFlash(`${ids.length} item berhasil diubah ke status ${status}.`)
      await hydrate(undefined, true)
    } catch (err: any) {
      setError(err.message || 'Bulk update status gagal.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const bulkSetServiceActive = async (isActive: boolean) => {
    if (!selectedServiceIds.length) return
    const label = isActive ? 'active' : 'inactive'

    const confirmed = await requestConfirmation({
      title: `Set ${selectedServiceIds.length} layanan menjadi ${label}?`,
      description:
        'Perubahan ini langsung mengubah visibilitas layanan di website dan daftar layanan yang bisa dipilih pengunjung.',
      confirmLabel: `Set ${label}`,
      tone: 'default',
    })
    if (!confirmed) {
      return
    }

    try {
      setSaving(true)
      setBusyKey(`bulk-services-${label}`)

      await Promise.all(
        selectedServiceIds.map((id) => {
          const item = services.find((entry) => entry.id === id)
          return adminFetch(token, `/services/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
              ...(item || {}),
              is_active: isActive,
            }),
          })
        })
      )

      setSelectedServiceIds([])
      setFlash(`${selectedServiceIds.length} layanan berhasil diubah menjadi ${label}.`)
      await hydrate(undefined, true)
    } catch (err: any) {
      setError(err.message || 'Bulk update layanan gagal.')
    } finally {
      setSaving(false)
      setBusyKey('')
    }
  }

  const isAllProjectsOnPageSelected =
    projects.length > 0 &&
    projects.every((item) => selectedProjectIds.includes(item.id))

  const isAllPostsOnPageSelected =
    posts.length > 0 && posts.every((item) => selectedBlogIds.includes(item.id))

  const isAllServicesOnPageSelected =
    services.length > 0 && services.every((item) => selectedServiceIds.includes(item.id))

  const isAllTestimonialsOnPageSelected =
    testimonials.length > 0 && testimonials.every((item) => selectedTestimonialIds.includes(item.id))

  const isAllTeamOnPageSelected =
    teamMembers.length > 0 && teamMembers.every((item) => selectedTeamIds.includes(item.id))

  const isAllLeadsOnPageSelected =
    leads.length > 0 && leads.every((item) => selectedLeadIds.includes(item.id))

  const activeSelectionCount =
    activeSection === 'projects'
      ? selectedProjectIds.length
      : activeSection === 'blog'
        ? selectedBlogIds.length
        : activeSection === 'services'
          ? selectedServiceIds.length
        : activeSection === 'testimonials'
          ? selectedTestimonialIds.length
          : activeSection === 'team'
            ? selectedTeamIds.length
            : activeSection === 'leads'
              ? selectedLeadIds.length
              : 0

  const currentSection = cmsNavItems.find((item) => item.id === activeSection)

  return (
    <div className="flex min-h-screen bg-stone-50 font-body">
      <ConfirmDialog
        dialog={confirmDialog}
        submitting={saving}
        onCancel={() => closeConfirmation(false)}
        onConfirm={() => closeConfirmation(true)}
      />
      <div className="fixed right-5 top-5 z-[70] space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex w-[320px] items-start gap-3 rounded-2xl border px-4 py-4 shadow-lg backdrop-blur ${
              toast.tone === 'success'
                ? 'border-emerald-200 bg-white/95 text-emerald-700'
                : 'border-red-200 bg-white/95 text-red-700'
            }`}
          >
            <div className="flex-1 text-sm leading-6">{toast.message}</div>
            <button
              onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
              className="rounded-xl p-1 transition hover:bg-black/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      {activeSelectionCount > 0 ? (
        <div className="fixed bottom-[70px] left-1/2 z-[65] flex w-[min(920px,calc(100%-2rem))] -translate-x-1/2 flex-wrap items-center justify-between gap-4 rounded-[24px] border border-stone-200 bg-white/95 px-5 py-4 shadow-xl backdrop-blur">
          <div>
            <p className="text-sm font-semibold text-stone-900">
              {activeSelectionCount} item selected
            </p>
            <p className="text-xs text-stone-500">
              Bulk actions tersedia untuk section {currentSection?.label || activeSection}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeSection === 'projects' ? (
              <>
                {canPublish ? (
                  <>
                    <button
                      onClick={() => bulkSetContentStatus('projects', selectedProjectIds, 'published')}
                      className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => bulkSetContentStatus('projects', selectedProjectIds, 'draft')}
                      className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
                    >
                      Unpublish
                    </button>
                  </>
                ) : null}
                <button
                  onClick={() => bulkDelete('projects', selectedProjectIds, setSelectedProjectIds)}
                  className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                >
                  Delete
                </button>
              </>
            ) : null}
            {activeSection === 'blog' ? (
              <>
                {selectedBlogItem ? (
                  <button
                    type="button"
                    onClick={() => loadBlogEditor(selectedBlogItem)}
                    className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
                  >
                    Edit selected
                  </button>
                ) : null}
                {canPublish ? (
                  <>
                    <button
                      onClick={() => bulkSetContentStatus('blog', selectedBlogIds, 'published')}
                      className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => bulkSetContentStatus('blog', selectedBlogIds, 'draft')}
                      className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
                    >
                      Unpublish
                    </button>
                  </>
                ) : null}
                <button
                  onClick={() => bulkDelete('blog', selectedBlogIds, setSelectedBlogIds)}
                  className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                >
                  Delete
                </button>
              </>
            ) : null}
            {activeSection === 'services' ? (
              <>
                <button
                  onClick={() => bulkSetServiceActive(true)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
                >
                  Set active
                </button>
                <button
                  onClick={() => bulkSetServiceActive(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
                >
                  Set inactive
                </button>
                <button
                  onClick={() => bulkDelete('services', selectedServiceIds, setSelectedServiceIds)}
                  className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                >
                  Delete
                </button>
              </>
            ) : null}
            {activeSection === 'testimonials' ? (
              <button
                onClick={() =>
                  bulkDelete('testimonials', selectedTestimonialIds, setSelectedTestimonialIds)
                }
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
              >
                Delete
              </button>
            ) : null}
            {activeSection === 'team' ? (
              <button
                onClick={() => bulkDelete('team', selectedTeamIds, setSelectedTeamIds)}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
              >
                Delete
              </button>
            ) : null}
            {activeSection === 'leads' ? (
              <>
                <button
                  onClick={() => bulkUpdateLeads('contacted')}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
                >
                  Mark contacted
                </button>
                <button
                  onClick={() => bulkUpdateLeads('closed')}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
                >
                  Mark closed
                </button>
              </>
            ) : null}
            <button
              onClick={() => {
                if (activeSection === 'projects') setSelectedProjectIds([])
                if (activeSection === 'blog') setSelectedBlogIds([])
                if (activeSection === 'services') setSelectedServiceIds([])
                if (activeSection === 'testimonials') setSelectedTestimonialIds([])
                if (activeSection === 'team') setSelectedTeamIds([])
                if (activeSection === 'leads') setSelectedLeadIds([])
              }}
              className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
            >
              Clear selection
            </button>
          </div>
        </div>
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-stone-950 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
              <CmsBrandLogo imageClassName={`h-auto ${sidebarOpen ? 'w-[32px]' : 'w-[24px]'}`} priority />
            </div>
            {sidebarOpen ? (
              <div>
                <p className="text-sm font-semibold">MikroLiving CMS</p>
                <p className="text-xs text-stone-400">Content and publishing desk</p>
              </div>
            ) : null}
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-2.5 py-3">
          {cmsNavItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                    onClick={() => setActiveSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition ${
                  activeSection === item.id
                    ? 'bg-white text-stone-950'
                    : 'text-stone-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
                {sidebarOpen ? <span>{item.label}</span> : null}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-white/10 px-2.5 py-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-stone-400 transition hover:bg-white/5 hover:text-red-300"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.9} />
            {sidebarOpen ? <span>Logout</span> : null}
          </button>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white/90 px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen((current) => !current)}
              className="rounded-xl p-2 text-stone-600 transition hover:bg-stone-100"
            >
              {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Workspace</p>
              <h1 className="mt-1 text-lg text-stone-900 font-headline">
                {currentSection?.label || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                {getInitials(currentUserName || currentUserEmail || 'MikroLiving')}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-stone-400">
                  Signed in
                </p>
                <p className="truncate text-sm font-semibold text-stone-900">
                  {currentUserName || currentUserEmail || 'MikroLiving User'}
                </p>
                {currentUserEmail ? (
                  <p className="truncate text-xs text-stone-500">{currentUserEmail}</p>
                ) : null}
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                {formatRoleLabel(currentUserRole)}
              </span>
            </div>

            <button
              onClick={() => hydrate(undefined, true)}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-stone-700 transition hover:border-primary hover:text-primary"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </header>

        <div className="p-5">
          {loading ? (
            <div className="rounded-[22px] border border-stone-200 bg-white p-12 text-center shadow-sm">
              <p className="text-sm text-stone-500">Memuat workspace CMS...</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
              {activeSection === 'dashboard' ? (
                <SectionFrame
                  eyebrow="Overview"
                  title="Pantau konten tayang dan ringkasan aktivitas website dari satu panel."
                >
                  <div className="grid gap-4 lg:grid-cols-4">
                    {[
                      ['Published Projects', stats?.counts.projects ?? 0, 'bg-amber-50 text-amber-700'],
                      ['Published Posts', stats?.counts.posts ?? 0, 'bg-blue-50 text-blue-700'],
                      ['Consultations', stats?.counts.consultations ?? 0, 'bg-stone-100 text-stone-700'],
                      ['New Leads', stats?.counts.newConsultations ?? 0, 'bg-red-50 text-red-700'],
                    ].map(([label, value, tone]) => (
                      <div key={String(label)} className="rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
                          {label}
                        </span>
                        <p className="mt-5 text-3xl text-stone-900 font-headline">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <div className="overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-sm">
                      <div className="border-b border-stone-100 px-5 py-4">
                        <h3 className="text-lg text-stone-900 font-headline">Recent consultations</h3>
                      </div>
                      {stats?.recentConsultations?.length ? (
                        <div
                          className={`divide-y divide-stone-100 transition-opacity ${
                            listLoading.projects ? 'opacity-60' : 'opacity-100'
                          }`}
                        >
                          {stats.recentConsultations.map((lead) => (
                            <div key={lead.id} className="flex items-center justify-between px-5 py-3.5">
                              <div>
                                <p className="text-sm font-semibold text-stone-800">{lead.name}</p>
                                <p className="text-xs text-stone-500">
                                  {lead.email} / {lead.service_type || 'General inquiry'}
                                </p>
                              </div>
                              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold capitalize text-stone-600">
                                {lead.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          title="Belum ada consultation baru"
                          body="Saat form website mulai dipakai, lead terbaru akan muncul di sini agar tim bisa langsung follow up."
                        />
                      )}
                    </div>

                    <div className="overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-sm">
                      <div className="border-b border-stone-100 px-5 py-4">
                        <h3 className="text-lg text-stone-900 font-headline">Top projects</h3>
                      </div>
                      {stats?.topProjects?.length ? (
                        <div
                          className={`divide-y divide-stone-100 transition-opacity ${
                            listLoading.blog ? 'opacity-60' : 'opacity-100'
                          }`}
                        >
                          {stats.topProjects.map((project, index) => (
                            <div key={project.id} className="flex items-center gap-3 px-5 py-3.5">
                              <span className="w-8 text-center text-2xl text-stone-300 font-headline">{index + 1}</span>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-stone-800">{project.title}</p>
                                <p className="text-xs capitalize text-stone-500">{project.category}</p>
                              </div>
                              <span className="text-sm font-semibold text-primary">{project.views} views</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          title="Belum ada project yang terbaca"
                          body="Setelah pengunjung membuka halaman project, daftar dengan view tertinggi akan muncul otomatis di panel ini."
                        />
                      )}
                    </div>
                  </div>
                </SectionFrame>
              ) : null}

              {activeSection === 'settings' ? (
                <SectionFrame
                  eyebrow="Settings"
                  title="Atur konten Studio Section, Marquee Strip, dan stat homepage langsung dari CMS."
                >
                  <SiteSettingsSection currentUserRole={currentUserRole} />
                </SectionFrame>
              ) : null}

              {activeSection === 'projects' ? (
                <SectionFrame
                  eyebrow="Projects"
                  title="Kelola portfolio yang tampil di homepage dan halaman detail project."
                  action={
                    <button
                      onClick={resetProjectEditor}
                      className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary"
                    >
                      <Plus className="h-4 w-4" />
                      New project
                    </button>
                  }
                >
                  <div className="grid gap-5 xl:grid-cols-[1fr_0.92fr]">
                    <div className="overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-sm">
                      <div className="border-b border-stone-100 px-5 py-4">
                        <h3 className="text-lg text-stone-900 font-headline">Portfolio list</h3>
                        <div className="mt-3 grid gap-2.5 md:grid-cols-2">
                          <input
                            value={projectSearch}
                            onChange={(e) => setProjectSearch(e.target.value)}
                            className={inputClassName}
                            placeholder="Cari project atau lokasi"
                          />
                          <select
                            value={projectStatusFilter}
                            onChange={(e) => setProjectStatusFilter(e.target.value)}
                            className={inputClassName}
                          >
                            {['all', 'draft', 'published', 'archived'].map((option) => (
                              <option key={option} value={option}>
                                {option === 'all' ? 'All statuses' : option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <button
                            onClick={() =>
                              setSelectedProjectIds((current) =>
                                isAllProjectsOnPageSelected
                                  ? current.filter((id) => !projects.some((item) => item.id === id))
                                  : mergeUniqueIds(current, projects.map((item) => item.id))
                              )
                            }
                            className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
                          >
                            {isAllProjectsOnPageSelected ? 'Unselect page' : 'Select page'}
                          </button>
                          <button
                            onClick={() => selectAllAcrossDataset('projects')}
                            disabled={selectionBusyKey === 'projects'}
                            className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 disabled:opacity-40"
                          >
                            {selectionBusyKey === 'projects' ? 'Selecting dataset...' : 'Select all dataset'}
                          </button>
                        </div>
                        <ListHeaderMeta
                          isLoading={listLoading.projects}
                          isRetrying={listRetrying.projects}
                          hasQuery={Boolean(projectSearch.trim())}
                          timestamp={listUpdatedAt.projects}
                          errorMessage={listErrors.projects}
                          onRetry={() => {
                            if (!token) return
                            loadProjectList(token).catch((err: any) =>
                              setError(err.message || 'Gagal memuat project.')
                            )
                          }}
                        />
                      </div>
                      {listLoading.projects && !projects.length ? (
                        <ListSkeleton />
                      ) : projects.length ? (
                        <div
                          className={`divide-y divide-stone-100 transition-opacity ${
                            listLoading.services ? 'opacity-60' : 'opacity-100'
                          }`}
                        >
                          {projects.map((item) => (
                            <div key={item.id} className="flex items-start justify-between gap-4 px-5 py-4">
                              <div className="min-w-0">
                                <div className="mb-3 flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedProjectIds.includes(item.id)}
                                    onChange={() => toggleSelection(setSelectedProjectIds, item.id)}
                                  />
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                                  <span className="rounded-full bg-stone-100 px-2 py-1 text-[11px] uppercase tracking-wider text-stone-600">
                                    {item.status}
                                  </span>
                                  {item.is_featured ? (
                                    <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] uppercase tracking-wider text-amber-700">
                                      Featured
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-2 text-xs text-stone-500">
                                  {item.category} / {item.location || 'Location not set'}
                                </p>
                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">
                                  {item.description || 'Belum ada deskripsi singkat untuk project ini.'}
                                </p>
                              </div>
                              <div className="flex shrink-0 gap-2">
                                <button
                                  onClick={() => loadProjectEditor(item)}
                                  className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-primary hover:text-primary"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete('projects', item.id)}
                                  className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          title="Portfolio masih kosong"
                          body="Tambahkan project pertama agar homepage dan halaman portfolio langsung punya konten nyata."
                          action={
                            <button
                              onClick={resetProjectEditor}
                              className="rounded-xl bg-primary px-3.5 py-2.5 text-[13px] font-semibold text-on-primary"
                            >
                              Buat project pertama
                            </button>
                          }
                        />
                      )}
                      <Pagination
                        page={projectPage}
                        totalPages={projectMeta.totalPages}
                        onPageChange={setProjectPage}
                      />
                    </div>

                    <div className="rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-[22px] text-stone-900 font-headline">
                          {editingProjectId ? 'Edit project' : 'New project'}
                        </h3>
                        <DraftIndicator state={projectDraftState} />
                      </div>
                      <div className="mt-5 grid gap-3.5 md:grid-cols-2">
                        <Field label="Title">
                          <input className={inputClassName} value={projectForm.title} onChange={(e) => setProjectForm((c) => ({ ...c, title: e.target.value }))} />
                        </Field>
                        <Field label="Category">
                          <select className={inputClassName} value={projectForm.category} onChange={(e) => setProjectForm((c) => ({ ...c, category: e.target.value }))}>
                            {['apartment', 'residential', 'kitchen', 'bedroom', 'office', 'commercial'].map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Location">
                          <input className={inputClassName} value={projectForm.location} onChange={(e) => setProjectForm((c) => ({ ...c, location: e.target.value }))} />
                        </Field>
                        <Field label="Status">
                          <select
                            className={inputClassName}
                            value={projectForm.status}
                            disabled={!canPublish}
                            onChange={(e) => setProjectForm((c) => ({ ...c, status: e.target.value }))}
                          >
                            {['draft', 'published', 'archived'].map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          {!canPublish ? (
                            <p className="mt-2 text-xs text-stone-500">
                              Status publish hanya dapat diubah oleh superadmin.
                            </p>
                          ) : null}
                        </Field>
                        <Field label="Area (sqm)">
                          <input className={inputClassName} value={projectForm.area_sqm} onChange={(e) => setProjectForm((c) => ({ ...c, area_sqm: e.target.value }))} />
                        </Field>
                        <Field label="Year completed">
                          <input className={inputClassName} value={projectForm.year_completed} onChange={(e) => setProjectForm((c) => ({ ...c, year_completed: e.target.value }))} />
                        </Field>
                        <Field label="Client name">
                          <input className={inputClassName} value={projectForm.client_name} onChange={(e) => setProjectForm((c) => ({ ...c, client_name: e.target.value }))} />
                        </Field>
                        <Field label="Sort order">
                          <input className={inputClassName} value={projectForm.sort_order} onChange={(e) => setProjectForm((c) => ({ ...c, sort_order: e.target.value }))} />
                        </Field>
                        <Field label="Meta title">
                          <input className={inputClassName} value={projectForm.meta_title} onChange={(e) => setProjectForm((c) => ({ ...c, meta_title: e.target.value }))} />
                        </Field>
                        <Field label="Meta description">
                          <input className={inputClassName} value={projectForm.meta_desc} onChange={(e) => setProjectForm((c) => ({ ...c, meta_desc: e.target.value }))} />
                        </Field>
                      </div>
                      <Field label="Description">
                        <textarea className={`${inputClassName} mt-2 min-h-40`} value={projectForm.description} onChange={(e) => setProjectForm((c) => ({ ...c, description: e.target.value }))} />
                      </Field>
                      <AssetPreview
                        label="Current cover"
                        url={projects.find((project) => project.id === editingProjectId)?.cover_url}
                      />
                      <Field label="Cover image">
                        <input
                          type="file"
                          accept="image/*"
                          className={`${inputClassName} mt-2 file:mr-4 file:rounded-xl file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white`}
                          onChange={(e) => setProjectCoverFile(e.target.files?.[0] || null)}
                        />
                      </Field>
                      <FileSelectionNote files={projectCoverFile ? [projectCoverFile] : []} />
                      <UploadProgressList
                        progressEntries={Object.entries(uploadProgress).filter(([key]) => key === projectCoverFile?.name)}
                      />
                      <label className="mt-5 flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-[13px] text-stone-700">
                        <input type="checkbox" checked={projectForm.is_featured} onChange={(e) => setProjectForm((c) => ({ ...c, is_featured: e.target.checked }))} />
                        Tampilkan sebagai featured project
                      </label>
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        <button onClick={submitProject} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary disabled:opacity-60">
                          <Save className="h-4 w-4" />
                          {busyKey === 'project-form'
                            ? 'Menyimpan project...'
                            : editingProjectId
                              ? 'Update project'
                              : 'Create project'}
                        </button>
                        {editingProjectId ? (
                          <button onClick={resetProjectEditor} className="rounded-xl border border-stone-200 px-3.5 py-2.5 text-[13px] font-semibold text-stone-700">
                            Reset
                          </button>
                        ) : null}
                      </div>

                      {editingProjectId ? (
                        <div className="mt-6 space-y-3 rounded-[22px] border border-stone-200 bg-stone-50 p-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                              Project gallery
                            </p>
                            <h4 className="mt-2 text-lg text-stone-900 font-headline">
                              Upload multiple gallery images
                            </h4>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className={`${inputClassName} file:mr-4 file:rounded-xl file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white`}
                            onChange={(e) => setProjectGalleryFiles(Array.from(e.target.files || []))}
                          />
                          {projectGalleryFiles.length ? (
                            <p className="text-sm text-stone-600">
                              {projectGalleryFiles.length} file siap diunggah ke galeri.
                            </p>
                          ) : null}
                          <button
                            onClick={uploadProjectGallery}
                            disabled={saving || projectGalleryFiles.length === 0}
                            className="rounded-xl bg-stone-900 px-3.5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
                          >
                            {busyKey === 'project-gallery' ? 'Mengunggah galeri...' : 'Upload gallery'}
                          </button>
                          <FileSelectionNote files={projectGalleryFiles} />
                          <UploadProgressList
                            progressEntries={Object.entries(uploadProgress).filter(([key]) =>
                              projectGalleryFiles.some((file) => file.name === key)
                            )}
                          />

                          {editingProjectImages.length ? (
                            <div className="grid gap-4 md:grid-cols-2">
                              {editingProjectImages
                                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                                .map((image) => (
                                  <div
                                    key={image.id}
                                    draggable
                                    onDragStart={() => setDragItem({ type: 'gallery', id: image.id })}
                                    onDragOver={(e) => {
                                      e.preventDefault()
                                      setDropTarget({ type: 'gallery', id: image.id })
                                    }}
                                    onDrop={() => {
                                      if (dragItem?.type === 'gallery') {
                                        void moveByDrag('gallery', dragItem.id, image.id)
                                      }
                                    }}
                                    onDragEnd={() => {
                                      setDragItem(null)
                                      setDropTarget(null)
                                    }}
                                    className={`overflow-hidden rounded-2xl border border-stone-200 bg-white ${
                                      dropTarget?.type === 'gallery' && dropTarget.id === image.id
                                        ? 'ring-2 ring-amber-300'
                                        : ''
                                    }`}
                                  >
                                    <div className="relative aspect-[4/3]">
                                      <Image
                                        src={image.url}
                                        alt={image.alt_text || 'Project gallery'}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 25vw"
                                      />
                                    </div>
                                    <div className="flex items-center justify-between gap-3 p-4">
                                      <div className="flex items-center gap-3">
                                        <DragHandle />
                                        <p className="line-clamp-1 text-sm text-stone-600">
                                          {image.alt_text || 'Project gallery image'}
                                        </p>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => removeProjectGalleryImage(image.id)}
                                          className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <p className="text-sm text-stone-500">
                              Belum ada gambar galeri untuk project ini.
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </SectionFrame>
              ) : null}

              {activeSection === 'blog' ? (
                <SectionFrame
                  eyebrow="Blog"
                  title="Kelola artikel, insight, dan catatan editorial yang tampil di halaman jurnal."
                  action={
                    <button
                      onClick={resetBlogEditor}
                      className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary"
                    >
                      <Plus className="h-4 w-4" />
                      New article
                    </button>
                  }
                >
                  <div className="grid gap-5 xl:grid-cols-[1fr_0.92fr]">
                    <div className="overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-sm">
                      <div className="border-b border-stone-100 px-5 py-4">
                        <h3 className="text-lg text-stone-900 font-headline">Article list</h3>
                        <div className="mt-3 grid gap-2.5 md:grid-cols-2">
                          <input
                            value={blogSearch}
                            onChange={(e) => setBlogSearch(e.target.value)}
                            className={inputClassName}
                            placeholder="Cari judul atau kategori"
                          />
                          <select
                            value={blogStatusFilter}
                            onChange={(e) => setBlogStatusFilter(e.target.value)}
                            className={inputClassName}
                          >
                            {['all', 'draft', 'published', 'archived'].map((option) => (
                              <option key={option} value={option}>
                                {option === 'all' ? 'All statuses' : option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <button
                            onClick={() =>
                              setSelectedBlogIds((current) =>
                                isAllPostsOnPageSelected
                                  ? current.filter((id) => !posts.some((item) => item.id === id))
                                  : mergeUniqueIds(current, posts.map((item) => item.id))
                              )
                            }
                            className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
                          >
                            {isAllPostsOnPageSelected ? 'Unselect page' : 'Select page'}
                          </button>
                          <button
                            onClick={() => selectAllAcrossDataset('blog')}
                            disabled={selectionBusyKey === 'blog'}
                            className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 disabled:opacity-40"
                          >
                            {selectionBusyKey === 'blog' ? 'Selecting dataset...' : 'Select all dataset'}
                          </button>
                        </div>
                        <ListHeaderMeta
                          isLoading={listLoading.blog}
                          isRetrying={listRetrying.blog}
                          hasQuery={Boolean(blogSearch.trim())}
                          timestamp={listUpdatedAt.blog}
                          errorMessage={listErrors.blog}
                          onRetry={() => {
                            if (!token) return
                            loadBlogList(token).catch((err: any) =>
                              setError(err.message || 'Gagal memuat artikel.')
                            )
                          }}
                        />
                      </div>
                      {listLoading.blog && !posts.length ? (
                        <ListSkeleton />
                      ) : posts.length ? (
                        <div
                          className={`divide-y divide-stone-100 transition-opacity ${
                            listLoading.testimonials ? 'opacity-60' : 'opacity-100'
                          }`}
                        >
                          {posts.map((item) => (
                            <div key={item.id} className="flex items-start justify-between gap-4 px-5 py-4">
                              <div className="min-w-0">
                                <div className="mb-3 flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedBlogIds.includes(item.id)}
                                    onChange={() => toggleSelection(setSelectedBlogIds, item.id)}
                                  />
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                                  <span className="rounded-full bg-stone-100 px-2 py-1 text-[11px] uppercase tracking-wider text-stone-600">
                                    {item.status}
                                  </span>
                                </div>
                                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-primary">{item.category}</p>
                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">
                                  {item.excerpt || 'Belum ada ringkasan singkat untuk artikel ini.'}
                                </p>
                              </div>
                              <div className="flex shrink-0 gap-2">
                                <button
                                  type="button"
                                  onClick={() => loadBlogEditor(item)}
                                  className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-primary hover:text-primary"
                                >
                                  {busyKey === 'blog-editor' && editingPostId === item.id ? 'Loading...' : 'Edit'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete('blog', item.id)}
                                  className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          title="Belum ada artikel"
                          body="Tambahkan artikel pertama untuk mengisi section insight di homepage dan halaman blog."
                          action={
                            <button
                              onClick={resetBlogEditor}
                              className="rounded-xl bg-primary px-3.5 py-2.5 text-[13px] font-semibold text-on-primary"
                            >
                              Buat artikel pertama
                            </button>
                          }
                        />
                      )}
                      <Pagination
                        page={blogPage}
                        totalPages={blogMeta.totalPages}
                        onPageChange={setBlogPage}
                      />
                    </div>

                    <div
                      ref={blogEditorRef}
                      className={`rounded-[22px] border bg-white p-5 shadow-sm transition-all duration-300 ${
                        editingPostId
                          ? 'border-primary/40 bg-primary/5 shadow-[0_24px_60px_-36px_rgba(120,86,0,0.35)] ring-1 ring-primary/15'
                          : 'border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-[22px] text-stone-900 font-headline">
                            {editingPostId ? 'Edit article' : 'New article'}
                          </h3>
                          {editingPostId ? (
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                              {busyKey === 'blog-editor'
                                ? 'Loading selected article...'
                                : `Editing: ${blogForm.title || 'Selected article'}`}
                            </p>
                          ) : (
                            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-stone-400">
                              Pilih artikel dari daftar lalu klik edit untuk memuat datanya ke form ini.
                            </p>
                          )}
                        </div>
                        <DraftIndicator state={blogDraftState} />
                      </div>
                      <div className="mt-5 grid gap-3.5 md:grid-cols-2">
                        <Field label="Title">
                          <input className={inputClassName} value={blogForm.title} onChange={(e) => setBlogForm((c) => ({ ...c, title: e.target.value }))} />
                        </Field>
                        <Field label="Category">
                          <select className={inputClassName} value={blogForm.category} onChange={(e) => setBlogForm((c) => ({ ...c, category: e.target.value }))}>
                            {['trends', 'aesthetics', 'material', 'tips', 'news'].map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Status">
                          <select
                            className={inputClassName}
                            value={blogForm.status}
                            disabled={!canPublish}
                            onChange={(e) => setBlogForm((c) => ({ ...c, status: e.target.value }))}
                          >
                            {['draft', 'published', 'archived'].map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          {!canPublish ? (
                            <p className="mt-2 text-xs text-stone-500">
                              Status publish hanya dapat diubah oleh superadmin.
                            </p>
                          ) : null}
                        </Field>
                        <Field label="Read time (minutes)">
                          <input className={inputClassName} value={blogForm.read_time} onChange={(e) => setBlogForm((c) => ({ ...c, read_time: e.target.value }))} />
                        </Field>
                        <Field label="Meta title">
                          <input className={inputClassName} value={blogForm.meta_title} onChange={(e) => setBlogForm((c) => ({ ...c, meta_title: e.target.value }))} />
                        </Field>
                        <Field label="Meta description">
                          <input className={inputClassName} value={blogForm.meta_desc} onChange={(e) => setBlogForm((c) => ({ ...c, meta_desc: e.target.value }))} />
                        </Field>
                      </div>
                      <Field label="Excerpt">
                        <textarea className={`${inputClassName} mt-2 min-h-28`} value={blogForm.excerpt} onChange={(e) => setBlogForm((c) => ({ ...c, excerpt: e.target.value }))} />
                      </Field>
                      <Field label="Content">
                        <div className="mt-2 rounded-[20px] border border-stone-200 bg-stone-50 p-3">
                          <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
                            {[
                              { label: 'Bold', icon: Bold, action: 'bold' as const },
                              { label: 'Italic', icon: Italic, action: 'italic' as const },
                              { label: 'Underline', icon: Underline, action: 'underline' as const },
                              { label: 'Bullet List', icon: List, action: 'bullet-list' as const },
                              { label: 'Numbered List', icon: ListOrdered, action: 'numbered-list' as const },
                            ].map((tool) => {
                              const Icon = tool.icon
                              return (
                                <button
                                  key={tool.action}
                                  type="button"
                                  onMouseDown={(event) => event.preventDefault()}
                                  onClick={() => applyBlogContentFormat(tool.action)}
                                  className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-primary hover:text-primary"
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                  {tool.label}
                                </button>
                              )
                            })}
                          </div>
                          <p className="mt-3 text-[11px] leading-5 text-stone-500">
                            Gunakan toolbar untuk memberi format cepat. Editor ini akan menyimpan
                            format tebal, miring, garis bawah, dan list secara otomatis ke tampilan
                            artikel public.
                          </p>
                          <textarea
                            ref={blogContentRef}
                            className={`${inputClassName} mt-3 min-h-56 bg-white`}
                            value={blogForm.content}
                            onChange={(e) => updateBlogContent(e.target.value)}
                            placeholder="Tulis isi artikel di sini. Enter akan dibaca sebagai pemisah paragraf di halaman public."
                          />
                        </div>
                      </Field>
                      <AssetPreview
                        label="Current cover"
                        url={editingBlogSnapshot?.cover_url}
                      />
                      <ExistingAssetNote
                        url={editingBlogSnapshot?.cover_url}
                        helper="Biarkan field choose file kosong jika ingin mempertahankan cover current."
                      />
                      <Field label="Cover image">
                        <input
                          type="file"
                          accept="image/*"
                          className={`${inputClassName} mt-2 file:mr-4 file:rounded-xl file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white`}
                          onChange={(e) => setBlogCoverFile(e.target.files?.[0] || null)}
                        />
                      </Field>
                      <FileSelectionNote files={blogCoverFile ? [blogCoverFile] : []} />
                      <UploadProgressList
                        progressEntries={Object.entries(uploadProgress).filter(([key]) => key === blogCoverFile?.name)}
                      />
                      <Field label="Tags">
                        <input className={`${inputClassName} mt-2`} value={blogForm.tagsText} onChange={(e) => setBlogForm((c) => ({ ...c, tagsText: e.target.value }))} placeholder="compact living, interior, material" />
                      </Field>
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        <button onClick={submitBlog} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary disabled:opacity-60">
                          <Save className="h-4 w-4" />
                          {busyKey === 'blog-form'
                            ? 'Menyimpan artikel...'
                            : editingPostId
                              ? 'Update article'
                              : 'Create article'}
                        </button>
                        {editingPostId ? (
                          <button onClick={resetBlogEditor} className="rounded-xl border border-stone-200 px-3.5 py-2.5 text-[13px] font-semibold text-stone-700">
                            Reset
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </SectionFrame>
              ) : null}

              {activeSection === 'services' ? (
                <SectionFrame
                  eyebrow="Services"
                  title="Atur penawaran layanan yang muncul di homepage dan halaman layanan."
                  action={
                    <button
                      onClick={resetServiceEditor}
                      className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary"
                    >
                      <Plus className="h-4 w-4" />
                      New service
                    </button>
                  }
                >
                  <div className="grid gap-5 xl:grid-cols-[1fr_0.92fr]">
                    <div className="overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-sm">
                      <div className="border-b border-stone-100 px-5 py-4">
                        <h3 className="text-lg text-stone-900 font-headline">Service list</h3>
                        <div className="mt-3 grid gap-2.5 md:grid-cols-2">
                          <input
                            value={serviceSearch}
                            onChange={(e) => setServiceSearch(e.target.value)}
                            className={inputClassName}
                            placeholder="Cari judul atau deskripsi"
                          />
                          <select
                            value={serviceStatusFilter}
                            onChange={(e) => setServiceStatusFilter(e.target.value)}
                            className={inputClassName}
                          >
                            {['all', 'active', 'inactive'].map((option) => (
                              <option key={option} value={option}>
                                {option === 'all' ? 'All statuses' : option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <p className="mt-4 text-sm text-stone-500">
                          Drag and drop untuk mengubah urutan layanan dengan lebih cepat.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <button
                            onClick={() =>
                              setSelectedServiceIds((current) =>
                                isAllServicesOnPageSelected
                                  ? current.filter((id) => !services.some((item) => item.id === id))
                                  : mergeUniqueIds(current, services.map((item) => item.id))
                              )
                            }
                            className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
                          >
                            {isAllServicesOnPageSelected ? 'Unselect page' : 'Select page'}
                          </button>
                          <button
                            onClick={() => selectAllAcrossDataset('services')}
                            disabled={selectionBusyKey === 'services'}
                            className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 disabled:opacity-40"
                          >
                            {selectionBusyKey === 'services' ? 'Selecting dataset...' : 'Select all dataset'}
                          </button>
                        </div>
                        <ListHeaderMeta
                          isLoading={listLoading.services}
                          isRetrying={listRetrying.services}
                          hasQuery={Boolean(serviceSearch.trim())}
                          timestamp={listUpdatedAt.services}
                          errorMessage={listErrors.services}
                          onRetry={() => {
                            if (!token) return
                            loadServiceList(token).catch((err: any) =>
                              setError(err.message || 'Gagal memuat layanan.')
                            )
                          }}
                        />
                      </div>
                      {listLoading.services && !services.length ? (
                        <ListSkeleton />
                      ) : services.length ? (
                        <div
                          className={`divide-y divide-stone-100 transition-opacity ${
                            listLoading.team ? 'opacity-60' : 'opacity-100'
                          }`}
                        >
                          {services.map((item) => (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={() => setDragItem({ type: 'services', id: item.id })}
                              onDragOver={(e) => {
                                e.preventDefault()
                                setDropTarget({ type: 'services', id: item.id })
                              }}
                              onDrop={() => {
                                if (dragItem?.type === 'services') {
                                  void moveByDrag('services', dragItem.id, item.id)
                                }
                              }}
                              onDragEnd={() => {
                                setDragItem(null)
                                setDropTarget(null)
                              }}
                              className={`flex items-start justify-between gap-4 px-5 py-4 ${
                                dropTarget?.type === 'services' && dropTarget.id === item.id
                                  ? 'bg-amber-50'
                                  : ''
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="mb-3 flex items-center gap-3">
                                  <DragHandle />
                                  <input
                                    type="checkbox"
                                    checked={selectedServiceIds.includes(item.id)}
                                    onChange={() => toggleSelection(setSelectedServiceIds, item.id)}
                                  />
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                                  <span className="rounded-full bg-stone-100 px-2 py-1 text-[11px] uppercase tracking-wider text-stone-600">
                                    {item.is_active === false ? 'inactive' : 'active'}
                                  </span>
                                </div>
                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">
                                  {item.description || 'Belum ada deskripsi singkat untuk layanan ini.'}
                                </p>
                              </div>
                              <div className="flex shrink-0 gap-2">
                                <button
                                  onClick={() => {
                                    setEditingServiceId(item.id)
                                    setServiceIconFile(null)
                                    setServiceForm({
                                      title: item.title || '',
                                      description: item.description || '',
                                      icon: item.icon || '',
                                      featuresText: item.features?.join(', ') || '',
                                      price_from: item.price_from?.toString() || '',
                                      is_active: item.is_active !== false,
                                      sort_order: item.sort_order?.toString() || '0',
                                    })
                                  }}
                                  className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-primary hover:text-primary"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete('services', item.id)}
                                  className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          title="Belum ada layanan"
                          body="Tambahkan daftar layanan utama atau ubah filter pencarian agar section ini menampilkan item yang relevan."
                          action={
                            <button
                              onClick={resetServiceEditor}
                              className="rounded-xl bg-primary px-3.5 py-2.5 text-[13px] font-semibold text-on-primary"
                            >
                              Buat layanan pertama
                            </button>
                          }
                        />
                      )}
                      <Pagination
                        page={servicePage}
                        totalPages={serviceMeta.totalPages}
                        onPageChange={setServicePage}
                      />
                    </div>

                    <div className="rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm">
                      <h3 className="text-[22px] text-stone-900 font-headline">
                        {editingServiceId ? 'Edit service' : 'New service'}
                      </h3>
                      <div className="mt-5 grid gap-3.5 md:grid-cols-2">
                        <Field label="Title">
                          <input className={inputClassName} value={serviceForm.title} onChange={(e) => setServiceForm((c) => ({ ...c, title: e.target.value }))} />
                        </Field>
                        <Field label="Icon label">
                          <input className={inputClassName} value={serviceForm.icon} onChange={(e) => setServiceForm((c) => ({ ...c, icon: e.target.value }))} placeholder="ID, AD, CF" />
                        </Field>
                        <Field label="Starting price">
                          <input className={inputClassName} value={serviceForm.price_from} onChange={(e) => setServiceForm((c) => ({ ...c, price_from: e.target.value }))} />
                        </Field>
                        <Field label="Sort order">
                          <input className={inputClassName} value={serviceForm.sort_order} onChange={(e) => setServiceForm((c) => ({ ...c, sort_order: e.target.value }))} />
                        </Field>
                      </div>
                      <Field label="Description">
                        <textarea className={`${inputClassName} mt-2 min-h-32`} value={serviceForm.description} onChange={(e) => setServiceForm((c) => ({ ...c, description: e.target.value }))} />
                      </Field>
                      <Field label="Features">
                        <textarea className={`${inputClassName} mt-2 min-h-28`} value={serviceForm.featuresText} onChange={(e) => setServiceForm((c) => ({ ...c, featuresText: e.target.value }))} placeholder="Space planning, Material curation, Custom cabinetry" />
                      </Field>
                      <AssetPreview
                        label="Current icon"
                        url={services.find((service) => service.id === editingServiceId)?.icon_url}
                      />
                      <Field label="Icon image">
                        <input
                          type="file"
                          accept="image/*"
                          className={`${inputClassName} mt-2 file:mr-4 file:rounded-xl file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white`}
                          onChange={(e) => setServiceIconFile(e.target.files?.[0] || null)}
                        />
                      </Field>
                      <FileSelectionNote files={serviceIconFile ? [serviceIconFile] : []} />
                      <UploadProgressList
                        progressEntries={Object.entries(uploadProgress).filter(([key]) => key === serviceIconFile?.name)}
                      />
                      <label className="mt-5 flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-[13px] text-stone-700">
                        <input type="checkbox" checked={serviceForm.is_active} onChange={(e) => setServiceForm((c) => ({ ...c, is_active: e.target.checked }))} />
                        Tampilkan layanan ini di website
                      </label>
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        <button onClick={submitService} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary disabled:opacity-60">
                          <Save className="h-4 w-4" />
                          {busyKey === 'service-form'
                            ? 'Menyimpan layanan...'
                            : editingServiceId
                              ? 'Update service'
                              : 'Create service'}
                        </button>
                        {editingServiceId ? (
                          <button onClick={resetServiceEditor} className="rounded-xl border border-stone-200 px-3.5 py-2.5 text-[13px] font-semibold text-stone-700">
                            Reset
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </SectionFrame>
              ) : null}

              {activeSection === 'testimonials' ? (
                <SectionFrame
                  eyebrow="Testimonials"
                  title="Kelola suara klien dan social proof yang tampil di homepage."
                  action={
                    <button
                      onClick={resetTestimonialEditor}
                      className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary"
                    >
                      <Plus className="h-4 w-4" />
                      New testimonial
                    </button>
                  }
                >
                  <div className="grid gap-5 xl:grid-cols-[1fr_0.92fr]">
                    <div className="overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-sm">
                      <div className="border-b border-stone-100 px-5 py-4">
                        <h3 className="text-lg text-stone-900 font-headline">Testimonial list</h3>
                        <div className="mt-3 grid gap-2.5 md:grid-cols-2">
                          <input
                            value={testimonialSearch}
                            onChange={(e) => setTestimonialSearch(e.target.value)}
                            className={inputClassName}
                            placeholder="Cari nama, titel, atau isi"
                          />
                          <select
                            value={testimonialStatusFilter}
                            onChange={(e) => setTestimonialStatusFilter(e.target.value)}
                            className={inputClassName}
                          >
                            {['all', 'active', 'inactive'].map((option) => (
                              <option key={option} value={option}>
                                {option === 'all' ? 'All statuses' : option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <p className="mt-3 text-sm text-stone-500">
                          Drag and drop untuk mengatur urutan testimonial.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <button
                            onClick={() =>
                              setSelectedTestimonialIds((current) =>
                                isAllTestimonialsOnPageSelected
                                  ? current.filter((id) => !testimonials.some((item) => item.id === id))
                                  : mergeUniqueIds(current, testimonials.map((item) => item.id))
                              )
                            }
                            className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
                          >
                            {isAllTestimonialsOnPageSelected ? 'Unselect page' : 'Select page'}
                          </button>
                          <button
                            onClick={() => selectAllAcrossDataset('testimonials')}
                            disabled={selectionBusyKey === 'testimonials'}
                            className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 disabled:opacity-40"
                          >
                            {selectionBusyKey === 'testimonials'
                              ? 'Selecting dataset...'
                              : 'Select all dataset'}
                          </button>
                        </div>
                        <ListHeaderMeta
                          isLoading={listLoading.testimonials}
                          isRetrying={listRetrying.testimonials}
                          hasQuery={Boolean(testimonialSearch.trim())}
                          timestamp={listUpdatedAt.testimonials}
                          errorMessage={listErrors.testimonials}
                          onRetry={() => {
                            if (!token) return
                            loadTestimonialList(token).catch((err: any) =>
                              setError(err.message || 'Gagal memuat testimonial.')
                            )
                          }}
                        />
                      </div>
                      {listLoading.testimonials && !testimonials.length ? (
                        <ListSkeleton />
                      ) : testimonials.length ? (
                        <div className="divide-y divide-stone-100 text-sm">
                          {testimonials.map((item) => (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={() => setDragItem({ type: 'testimonials', id: item.id })}
                              onDragOver={(e) => {
                                e.preventDefault()
                                setDropTarget({ type: 'testimonials', id: item.id })
                              }}
                              onDrop={() => {
                                if (dragItem?.type === 'testimonials') {
                                  void moveByDrag('testimonials', dragItem.id, item.id)
                                }
                              }}
                              onDragEnd={() => {
                                setDragItem(null)
                                setDropTarget(null)
                              }}
                              className={`flex items-start justify-between gap-4 px-5 py-4 ${
                                dropTarget?.type === 'testimonials' && dropTarget.id === item.id
                                  ? 'bg-amber-50'
                                  : ''
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="mb-3 flex items-center gap-3">
                                  <DragHandle />
                                  <input
                                    type="checkbox"
                                    checked={selectedTestimonialIds.includes(item.id)}
                                    onChange={() =>
                                      toggleSelection(setSelectedTestimonialIds, item.id)
                                    }
                                  />
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-semibold text-stone-900">{item.client_name}</p>
                                  {item.is_featured ? (
                                    <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] uppercase tracking-wider text-amber-700">
                                      Featured
                                    </span>
                                  ) : null}
                                  <span className="rounded-full bg-stone-100 px-2 py-1 text-[11px] uppercase tracking-wider text-stone-600">
                                    {item.is_active === false ? 'inactive' : 'active'}
                                  </span>
                                </div>
                                <p className="mt-2 text-xs text-stone-500">
                                  {item.client_title || item.project?.title || 'Client'}
                                </p>
                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">
                                  {item.content}
                                </p>
                              </div>
                              <div className="flex shrink-0 gap-2">
                                <button
                                  onClick={() => {
                                    setEditingTestimonialId(item.id)
                                    setTestimonialForm({
                                      client_name: item.client_name || '',
                                      client_title: item.client_title || '',
                                      content: item.content || '',
                                      rating: item.rating?.toString() || '5',
                                      project_id: item.project_id?.toString() || '',
                                      is_featured: Boolean(item.is_featured),
                                      is_active: item.is_active !== false,
                                      sort_order: item.sort_order?.toString() || '0',
                                    })
                                    setTestimonialAvatarFile(null)
                                  }}
                                  className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-primary hover:text-primary"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete('testimonials', item.id)}
                                  className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          title="Belum ada testimonial"
                          body="Tambahkan testimonial dari klien agar halaman depan terasa lebih meyakinkan."
                          action={
                            <button
                              onClick={resetTestimonialEditor}
                              className="rounded-xl bg-primary px-3.5 py-2.5 text-[13px] font-semibold text-on-primary"
                            >
                              Buat testimonial pertama
                            </button>
                          }
                        />
                      )}
                      <Pagination
                        page={testimonialPage}
                        totalPages={testimonialMeta.totalPages}
                        onPageChange={setTestimonialPage}
                      />
                    </div>

                    <div className="rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-[22px] text-stone-900 font-headline">
                          {editingTestimonialId ? 'Edit testimonial' : 'New testimonial'}
                        </h3>
                        <DraftIndicator state={testimonialDraftState} />
                      </div>
                      <div className="mt-5 grid gap-3.5 md:grid-cols-2">
                        <Field label="Client name">
                          <input className={inputClassName} value={testimonialForm.client_name} onChange={(e) => setTestimonialForm((c) => ({ ...c, client_name: e.target.value }))} />
                        </Field>
                        <Field label="Client title">
                          <input className={inputClassName} value={testimonialForm.client_title} onChange={(e) => setTestimonialForm((c) => ({ ...c, client_title: e.target.value }))} />
                        </Field>
                        <Field label="Rating">
                          <input className={inputClassName} value={testimonialForm.rating} onChange={(e) => setTestimonialForm((c) => ({ ...c, rating: e.target.value }))} />
                        </Field>
                        <Field label="Related project">
                          <select className={inputClassName} value={testimonialForm.project_id} onChange={(e) => setTestimonialForm((c) => ({ ...c, project_id: e.target.value }))}>
                            <option value="">No linked project</option>
                            {projects.map((project) => (
                              <option key={project.id} value={project.id}>{project.title}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Sort order">
                          <input className={inputClassName} value={testimonialForm.sort_order} onChange={(e) => setTestimonialForm((c) => ({ ...c, sort_order: e.target.value }))} />
                        </Field>
                        <Field label="Avatar image">
                          <input type="file" accept="image/*" className={`${inputClassName} file:mr-4 file:rounded-xl file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white`} onChange={(e) => setTestimonialAvatarFile(e.target.files?.[0] || null)} />
                        </Field>
                      </div>
                      <FileSelectionNote files={testimonialAvatarFile ? [testimonialAvatarFile] : []} />
                      <UploadProgressList
                        progressEntries={Object.entries(uploadProgress).filter(([key]) =>
                          key === (testimonialAvatarFile?.name || 'testimonial-form')
                        )}
                      />
                      <Field label="Testimonial content">
                        <textarea className={`${inputClassName} mt-2 min-h-40`} value={testimonialForm.content} onChange={(e) => setTestimonialForm((c) => ({ ...c, content: e.target.value }))} />
                      </Field>
                      <AssetPreview
                        label="Current avatar"
                        url={testimonials.find((testimonial) => testimonial.id === editingTestimonialId)?.avatar_url}
                      />
                      <label className="mt-5 flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-[13px] text-stone-700">
                        <input type="checkbox" checked={testimonialForm.is_featured} onChange={(e) => setTestimonialForm((c) => ({ ...c, is_featured: e.target.checked }))} />
                        Tampilkan sebagai testimonial unggulan
                      </label>
                      <label className="mt-3 flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-[13px] text-stone-700">
                        <input type="checkbox" checked={testimonialForm.is_active} onChange={(e) => setTestimonialForm((c) => ({ ...c, is_active: e.target.checked }))} />
                        Aktifkan di website
                      </label>
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        <button onClick={submitTestimonial} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary disabled:opacity-60">
                          <Save className="h-4 w-4" />
                          {busyKey === 'testimonial-form'
                            ? 'Menyimpan testimonial...'
                            : editingTestimonialId
                              ? 'Update testimonial'
                              : 'Create testimonial'}
                        </button>
                        {editingTestimonialId ? (
                          <button onClick={resetTestimonialEditor} className="rounded-xl border border-stone-200 px-3.5 py-2.5 text-[13px] font-semibold text-stone-700">
                            Reset
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </SectionFrame>
              ) : null}

              {activeSection === 'team' ? (
                <SectionFrame
                  eyebrow="Team"
                  title="Kelola profil tim yang tampil di website dan materi brand."
                  action={
                    <button
                      onClick={resetTeamEditor}
                      className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary"
                    >
                      <Plus className="h-4 w-4" />
                      New member
                    </button>
                  }
                >
                  <div className="grid gap-5 xl:grid-cols-[1fr_0.92fr]">
                    <div className="overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-sm">
                      <div className="border-b border-stone-100 px-5 py-4">
                        <h3 className="text-lg text-stone-900 font-headline">Team list</h3>
                        <div className="mt-3 grid gap-2.5 md:grid-cols-2">
                          <input
                            value={teamSearch}
                            onChange={(e) => setTeamSearch(e.target.value)}
                            className={inputClassName}
                            placeholder="Cari nama atau role"
                          />
                          <select
                            value={teamStatusFilter}
                            onChange={(e) => setTeamStatusFilter(e.target.value)}
                            className={inputClassName}
                          >
                            {['all', 'active', 'inactive'].map((option) => (
                              <option key={option} value={option}>
                                {option === 'all' ? 'All statuses' : option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <p className="mt-3 text-sm text-stone-500">
                          Drag and drop untuk mengatur urutan anggota tim.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <button
                            onClick={() =>
                              setSelectedTeamIds((current) =>
                                isAllTeamOnPageSelected
                                  ? current.filter((id) => !teamMembers.some((item) => item.id === id))
                                  : mergeUniqueIds(current, teamMembers.map((item) => item.id))
                              )
                            }
                            className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
                          >
                            {isAllTeamOnPageSelected ? 'Unselect page' : 'Select page'}
                          </button>
                          <button
                            onClick={() => selectAllAcrossDataset('team')}
                            disabled={selectionBusyKey === 'team'}
                            className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 disabled:opacity-40"
                          >
                            {selectionBusyKey === 'team' ? 'Selecting dataset...' : 'Select all dataset'}
                          </button>
                        </div>
                        <ListHeaderMeta
                          isLoading={listLoading.team}
                          isRetrying={listRetrying.team}
                          hasQuery={Boolean(teamSearch.trim())}
                          timestamp={listUpdatedAt.team}
                          errorMessage={listErrors.team}
                          onRetry={() => {
                            if (!token) return
                            loadTeamList(token).catch((err: any) =>
                              setError(err.message || 'Gagal memuat data tim.')
                            )
                          }}
                        />
                      </div>
                      {listLoading.team && !teamMembers.length ? (
                        <ListSkeleton />
                      ) : teamMembers.length ? (
                        <div className="divide-y divide-stone-100 text-sm">
                          {teamMembers.map((item) => (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={() => setDragItem({ type: 'team', id: item.id })}
                              onDragOver={(e) => {
                                e.preventDefault()
                                setDropTarget({ type: 'team', id: item.id })
                              }}
                              onDrop={() => {
                                if (dragItem?.type === 'team') {
                                  void moveByDrag('team', dragItem.id, item.id)
                                }
                              }}
                              onDragEnd={() => {
                                setDragItem(null)
                                setDropTarget(null)
                              }}
                              className={`flex items-start justify-between gap-4 px-5 py-4 ${
                                dropTarget?.type === 'team' && dropTarget.id === item.id
                                  ? 'bg-amber-50'
                                  : ''
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="mb-3 flex items-center gap-3">
                                  <DragHandle />
                                  <input
                                    type="checkbox"
                                    checked={selectedTeamIds.includes(item.id)}
                                    onChange={() => toggleSelection(setSelectedTeamIds, item.id)}
                                  />
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-semibold text-stone-900">{item.name}</p>
                                  <span className="rounded-full bg-stone-100 px-2 py-1 text-[11px] uppercase tracking-wider text-stone-600">
                                    {item.is_active === false ? 'inactive' : 'active'}
                                  </span>
                                </div>
                                <p className="mt-2 text-xs text-stone-500">{item.role || 'Team member'}</p>
                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">
                                  {item.bio || 'Belum ada bio singkat.'}
                                </p>
                              </div>
                              <div className="flex shrink-0 gap-2">
                                <button
                                  onClick={() => {
                                    setEditingTeamId(item.id)
                                    setTeamForm({
                                      name: item.name || '',
                                      role: item.role || '',
                                      bio: item.bio || '',
                                      instagram: item.instagram || '',
                                      linkedin: item.linkedin || '',
                                      is_active: item.is_active !== false,
                                      sort_order: item.sort_order?.toString() || '0',
                                    })
                                    setTeamAvatarFile(null)
                                  }}
                                  className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-primary hover:text-primary"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete('team', item.id)}
                                  className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          title="Belum ada anggota tim"
                          body="Tambahkan orang-orang inti studio agar identitas brand lebih terasa personal."
                          action={
                            <button
                              onClick={resetTeamEditor}
                              className="rounded-xl bg-primary px-3.5 py-2.5 text-[13px] font-semibold text-on-primary"
                            >
                              Tambah anggota pertama
                            </button>
                          }
                        />
                      )}
                      <Pagination
                        page={teamPage}
                        totalPages={teamMeta.totalPages}
                        onPageChange={setTeamPage}
                      />
                    </div>

                    <div className="rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-[22px] text-stone-900 font-headline">
                          {editingTeamId ? 'Edit member' : 'New member'}
                        </h3>
                      </div>
                      <div className="mt-5 grid gap-3.5 md:grid-cols-2">
                        <Field label="Name">
                          <input className={inputClassName} value={teamForm.name} onChange={(e) => setTeamForm((c) => ({ ...c, name: e.target.value }))} />
                        </Field>
                        <Field label="Role">
                          <input className={inputClassName} value={teamForm.role} onChange={(e) => setTeamForm((c) => ({ ...c, role: e.target.value }))} />
                        </Field>
                        <Field label="Instagram">
                          <input className={inputClassName} value={teamForm.instagram} onChange={(e) => setTeamForm((c) => ({ ...c, instagram: e.target.value }))} />
                        </Field>
                        <Field label="LinkedIn">
                          <input className={inputClassName} value={teamForm.linkedin} onChange={(e) => setTeamForm((c) => ({ ...c, linkedin: e.target.value }))} />
                        </Field>
                        <Field label="Sort order">
                          <input className={inputClassName} value={teamForm.sort_order} onChange={(e) => setTeamForm((c) => ({ ...c, sort_order: e.target.value }))} />
                        </Field>
                        <Field label="Avatar image">
                          <input type="file" accept="image/*" className={`${inputClassName} file:mr-4 file:rounded-xl file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white`} onChange={(e) => setTeamAvatarFile(e.target.files?.[0] || null)} />
                        </Field>
                      </div>
                      <FileSelectionNote files={teamAvatarFile ? [teamAvatarFile] : []} />
                      <UploadProgressList
                        progressEntries={Object.entries(uploadProgress).filter(([key]) =>
                          key === (teamAvatarFile?.name || 'team-form')
                        )}
                      />
                      <Field label="Bio">
                        <textarea className={`${inputClassName} mt-2 min-h-40`} value={teamForm.bio} onChange={(e) => setTeamForm((c) => ({ ...c, bio: e.target.value }))} />
                      </Field>
                      <AssetPreview
                        label="Current avatar"
                        url={teamMembers.find((member) => member.id === editingTeamId)?.avatar_url}
                      />
                      <label className="mt-5 flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-[13px] text-stone-700">
                        <input type="checkbox" checked={teamForm.is_active} onChange={(e) => setTeamForm((c) => ({ ...c, is_active: e.target.checked }))} />
                        Aktifkan profil ini di website
                      </label>
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        <button onClick={submitTeam} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary disabled:opacity-60">
                          <Save className="h-4 w-4" />
                          {busyKey === 'team-form'
                            ? 'Menyimpan profil...'
                            : editingTeamId
                              ? 'Update member'
                              : 'Create member'}
                        </button>
                        {editingTeamId ? (
                          <button onClick={resetTeamEditor} className="rounded-xl border border-stone-200 px-3.5 py-2.5 text-[13px] font-semibold text-stone-700">
                            Reset
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </SectionFrame>
              ) : null}

              {activeSection === 'users' ? (
                <SectionFrame
                  eyebrow="Users"
                  title="Kelola akun admin dan editor, atur status aktif, dan ganti password dari satu panel."
                >
                  <UserManagementSection currentUserRole={currentUserRole} />
                </SectionFrame>
              ) : null}

              {activeSection === 'leads' ? (
                <SectionFrame
                  eyebrow="Leads"
                  title="Pantau consultation request yang masuk dan perbarui status follow up."
                  action={
                    <select
                      value={leadFilter}
                      onChange={(e) => setLeadFilter(e.target.value)}
                      className="rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-stone-700"
                    >
                      {['all', 'new', 'contacted', 'in_progress', 'converted', 'closed'].map((option) => (
                        <option key={option} value={option}>
                          {option === 'all' ? 'All statuses' : option}
                        </option>
                      ))}
                    </select>
                  }
                >
                  {leads.length ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() =>
                            setSelectedLeadIds((current) =>
                              isAllLeadsOnPageSelected
                                ? current.filter((id) => !leads.some((item) => item.id === id))
                                : mergeUniqueIds(current, leads.map((item) => item.id))
                            )
                          }
                          className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
                        >
                          {isAllLeadsOnPageSelected ? 'Unselect page' : 'Select page'}
                        </button>
                        <button
                          onClick={() => selectAllAcrossDataset('leads')}
                          disabled={selectionBusyKey === 'leads'}
                          className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 disabled:opacity-40"
                        >
                          {selectionBusyKey === 'leads' ? 'Selecting dataset...' : 'Select all dataset'}
                        </button>
                      </div>
                      <ListHeaderMeta
                        isLoading={listLoading.leads}
                        isRetrying={listRetrying.leads}
                        hasQuery={false}
                        timestamp={listUpdatedAt.leads}
                        errorMessage={listErrors.leads}
                        onRetry={() => {
                          if (!token) return
                          loadLeadList(token).catch((err: any) =>
                            setError(err.message || 'Gagal memuat lead.')
                          )
                        }}
                      />
                      {listLoading.leads && !leads.length ? (
                        <ListSkeleton />
                      ) : (
                        <div
                          className={`space-y-4 transition-opacity ${
                            listLoading.leads ? 'opacity-60' : 'opacity-100'
                          }`}
                        >
                          {leads.map((lead) => (
                        <div key={lead.id} className="rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm">
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="max-w-3xl">
                              <div className="mb-3 flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedLeadIds.includes(lead.id)}
                                  onChange={() => toggleSelection(setSelectedLeadIds, lead.id)}
                                />
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-lg font-semibold text-stone-900">{lead.name}</p>
                                <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] uppercase tracking-wider text-stone-600">
                                  {lead.status}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-stone-500">
                                {lead.email} {lead.phone ? `/ ${lead.phone}` : ''}
                              </p>
                              <p className="mt-3 text-sm leading-7 text-stone-600">
                                {lead.message || 'Tidak ada pesan tambahan.'}
                              </p>
                              <div className="mt-4 flex flex-wrap gap-3 text-xs text-stone-500">
                                <span>Service: {lead.service_type || 'General'}</span>
                                <span>Budget: {lead.budget_range || '-'}</span>
                                <span>Location: {lead.location || '-'}</span>
                                <span>Area: {lead.area_sqm || '-'}</span>
                              </div>
                            </div>

                            <div className="w-full max-w-sm space-y-3">
                              <select
                                value={leadDrafts[lead.id]?.status || lead.status}
                                className={inputClassName}
                                onChange={(e) =>
                                  setLeadDrafts((current) => ({
                                    ...current,
                                    [lead.id]: {
                                      status: e.target.value,
                                      notes: current[lead.id]?.notes ?? lead.notes ?? '',
                                    },
                                  }))
                                }
                              >
                                {['new', 'contacted', 'in_progress', 'converted', 'closed'].map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                              <textarea
                                value={leadDrafts[lead.id]?.notes ?? lead.notes ?? ''}
                                className={`${inputClassName} min-h-28`}
                                placeholder="Internal notes for follow up"
                                onChange={(e) =>
                                  setLeadDrafts((current) => ({
                                    ...current,
                                    [lead.id]: {
                                      status: current[lead.id]?.status ?? lead.status,
                                      notes: e.target.value,
                                    },
                                  }))
                                }
                              />
                              <button
                                onClick={() =>
                                  updateLead(
                                    lead.id,
                                    leadDrafts[lead.id]?.status || lead.status,
                                    leadDrafts[lead.id]?.notes ?? lead.notes ?? ''
                                  )
                                }
                                disabled={saving}
                                className="rounded-xl bg-stone-900 px-3.5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
                              >
                                {busyKey === `lead-${lead.id}` ? 'Saving lead...' : 'Save lead'}
                              </button>
                            </div>
                          </div>
                        </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      title={leadFilter === 'all' ? 'Belum ada leads masuk' : `Tidak ada lead dengan status ${leadFilter}`}
                      body={
                        leadFilter === 'all'
                          ? 'Saat form konsultasi mulai terisi dari website, semua request akan muncul di panel ini lengkap dengan status follow up.'
                          : 'Coba pindah ke filter lain atau kembalikan ke semua status untuk melihat lead yang tersedia.'
                      }
                    />
                  )}
                  <Pagination
                    page={leadPage}
                    totalPages={leadMeta.totalPages}
                    onPageChange={setLeadPage}
                  />
                </SectionFrame>
              ) : null}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}


