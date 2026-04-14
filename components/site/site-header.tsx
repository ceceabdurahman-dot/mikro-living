import Link from 'next/link'

import { navigation, siteMeta } from '@/lib/site-data'

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-outline-variant/20 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 md:px-8">
        <Link href="/" className="text-2xl font-headline italic tracking-tight text-on-surface">
          Mikro<span className="text-primary">Living</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium tracking-wide text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/contact"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container"
          >
            Book Consultation
          </Link>
        </div>

        <details className="relative md:hidden">
          <summary className="list-none rounded-full border border-outline-variant/40 px-4 py-2 text-sm font-semibold text-on-surface">
            Menu
          </summary>
          <div className="absolute right-0 top-14 w-64 rounded-3xl border border-outline-variant/30 bg-background p-4 shadow-2xl shadow-stone-900/10">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-primary">
              {siteMeta.name}
            </p>
            <div className="flex flex-col gap-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="mt-2 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-on-primary"
              >
                Book Consultation
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  )
}
