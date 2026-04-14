import { NextResponse } from 'next/server'

import { createConsultationRequest } from '@/lib/api'

type Payload = {
  brief?: unknown
  email?: unknown
  name?: unknown
  projectType?: unknown
  timeline?: unknown
}

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
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

  if (!name || !email || !projectType || !timeline || !brief) {
    return NextResponse.json(
      { message: 'Please complete every required consultation field.' },
      { status: 400 },
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
    { status: result.status },
  )
}
