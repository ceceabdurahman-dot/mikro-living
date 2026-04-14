import type { ReactNode } from 'react'

import type { Metadata } from 'next'

import './globals.css'

import { siteMeta } from '@/lib/site-data'

export const metadata: Metadata = {
  metadataBase: new URL(siteMeta.url),
  title: siteMeta.title,
  description: siteMeta.description,
  keywords: siteMeta.keywords,
  openGraph: {
    title: siteMeta.title,
    description: siteMeta.description,
    siteName: siteMeta.name,
    locale: siteMeta.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteMeta.title,
    description: 'Elegant & functional interior design studio in Jakarta and Bandung.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="overflow-x-hidden bg-background font-body text-on-surface antialiased">
        <a
          href="#main-content"
          className="absolute left-4 top-4 z-[100] -translate-y-20 rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-on-primary transition-transform focus:translate-y-0 focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}
