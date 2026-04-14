import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  )
}
