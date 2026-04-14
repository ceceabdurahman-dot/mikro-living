import { NextResponse } from 'next/server'

import { createConsultationRequest } from '@/lib/api'
import { siteMeta } from '@/lib/site-data'

type Payload = {
  brief?: unknown
  company?: unknown
  email?: unknown
  name?: unknown
  projectType?: unknown
  timeline?: unknown
}

export const runtime = 'nodejs'

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 5

const consultationRateLimitStore =
  (globalThis as typeof globalThis & { __mlConsultationRateLimit?: Map<string, number[]> })
    .__mlConsultationRateLimit ||
  new Map<string, number[]>()

;(globalThis as typeof globalThis & { __mlConsultationRateLimit?: Map<string, number[]> }).__mlConsultationRateLimit =
  consultationRateLimitStore

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function readClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  return request.headers.get('x-real-ip') || 'unknown'
}

function isAllowedRequestOrigin(request: Request) {
  const configuredOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    siteMeta.url,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean)

  const allowedOrigins = new Set(
    configuredOrigins.map((value) => {
      try {
        return new URL(value as string).origin
      } catch {
        return value as string
      }
    }),
  )

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  if (origin && !allowedOrigins.has(origin)) {
    return false
  }

  if (referer) {
    try {
      if (!allowedOrigins.has(new URL(referer).origin)) {
        return false
      }
    } catch {
      return false
    }
  }

  return true
}

function isRateLimited(request: Request) {
  const ip = readClientIp(request)
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const recentAttempts = (consultationRateLimitStore.get(ip) || []).filter(
    (timestamp) => timestamp > windowStart,
  )

  if (recentAttempts.length >= RATE_LIMIT_MAX_REQUESTS) {
    consultationRateLimitStore.set(ip, recentAttempts)
    return true
  }

  recentAttempts.push(now)
  consultationRateLimitStore.set(ip, recentAttempts)
  return false
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254
}

export async function POST(request: Request) {
  let payload: Payload

  try {
    payload = (await request.json()) as Payload
  } catch {
    return NextResponse.json(
      { message: 'Invalid consultation payload.' },
      { status: 400 },
    )
  }

  const name = readString(payload.name)
  const email = readString(payload.email)
  const projectType = readString(payload.projectType)
  const timeline = readString(payload.timeline)
  const brief = readString(payload.brief)
  const company = readString(payload.company)

  if (!isAllowedRequestOrigin(request)) {
    return NextResponse.json(
      { message: 'This request origin is not allowed.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  if (company) {
    return NextResponse.json(
      { message: 'Consultation request received.' },
      { status: 202, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  if (isRateLimited(request)) {
    return NextResponse.json(
      { message: 'Too many consultation attempts. Please try again later.' },
      { status: 429, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  if (!name || !email || !projectType || !timeline || !brief) {
    return NextResponse.json(
      { message: 'Please complete every required consultation field.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { message: 'Please provide a valid email address.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  if (
    name.length > 120 ||
    projectType.length > 120 ||
    timeline.length > 120 ||
    brief.length > 4000
  ) {
    return NextResponse.json(
      { message: 'One or more consultation fields are too long.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const result = await createConsultationRequest({
    name,
    email,
    projectType,
    timeline,
    brief,
  })

  return NextResponse.json(
    { message: result.message },
    { status: result.status, headers: { 'Cache-Control': 'no-store' } },
  )
}
