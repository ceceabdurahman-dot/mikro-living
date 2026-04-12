import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MikroLiving | Designing Smart Living Spaces',
  description:
    'Creating Elegant & Functional Interiors that resonate with your lifestyle and personality. Studio interior design Jakarta & Bandung.',
  keywords: [
    'interior design',
    'smart living',
    'apartment design',
    'Jakarta',
    'Bandung',
    'desain interior',
    'mikroliving',
  ],
  authors: [{ name: 'MikroLiving Studio' }],
  openGraph: {
    title: 'MikroLiving | Designing Smart Living Spaces',
    description:
      'Creating Elegant & Functional Interiors that resonate with your lifestyle and personality.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'MikroLiving',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MikroLiving | Designing Smart Living Spaces',
    description: 'Elegant & Functional Interior Design Studio — Jakarta & Bandung',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface font-body antialiased overflow-x-hidden">
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}
