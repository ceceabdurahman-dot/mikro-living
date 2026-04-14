import Link from 'next/link'

import { navigation, siteMeta } from '@/lib/site-data'

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background/55 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-6 md:px-8">
        <div className="min-w-0">
          <Link
            href="/"
            className="inline-flex items-baseline gap-1 text-[1.35rem] font-headline italic tracking-tight text-on-surface transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:text-2xl"
          >
            Mikro<span className="text-primary">Living</span>
          </Link>
          <p className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.3em] text-on-surface-variant lg:block">
            Interior architecture / Jakarta & Bandung
          </p>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-white/55 bg-white/55 p-1 shadow-lg shadow-stone-900/5 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:bg-white hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/login"
            className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            CMS
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-[background-color,transform] duration-200 hover:bg-primary-container motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Book Consultation
          </Link>
        </div>

        <details className="group relative shrink-0 lg:hidden">
          <summary className="list-none rounded-full border border-outline-variant/40 bg-white/70 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface transition-colors hover:border-outline-variant/60 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:px-4 sm:text-sm sm:font-semibold sm:normal-case sm:tracking-normal">
            Menu
          </summary>
          <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(21rem,calc(100vw-2.5rem))] overflow-hidden rounded-[2rem] border border-outline-variant/30 bg-background/95 p-5 shadow-2xl shadow-stone-900/10 backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
              {siteMeta.name}
            </p>
            <p className="mt-3 max-w-[15rem] font-headline text-2xl leading-tight text-on-surface">
              Calmer interiors for compact living.
            </p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              Interior architecture for apartments and residences across Jakarta and Bandung.
            </p>

            <div className="mt-5 grid gap-2 border-t border-outline-variant/20 pt-5">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl px-3 py-3 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <Link
                href="/contact"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Consultation
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-outline-variant/40 px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                CMS
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  )
}
