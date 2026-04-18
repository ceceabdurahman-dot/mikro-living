import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { SESSION_TOKEN } from '../../lib/authSession'

export default async function CmsLayout({
  children,
}: {
  children: ReactNode
}) {
  const cookieStore = await cookies()
  const hasSessionMarker = Boolean(cookieStore.get(SESSION_TOKEN)?.value)

  if (!hasSessionMarker) {
    redirect('/login?redirect=%2Fcms')
  }

  return children
}
