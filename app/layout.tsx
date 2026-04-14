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
      <body className="bg-background font-body text-on-surface antialiased">
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}
