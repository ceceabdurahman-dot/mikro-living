import Link from 'next/link'

import { navigation, siteMeta } from '@/lib/site-data'

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant/20 bg-stone-100/95 px-6 py-16 md:px-8 md:py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <div className="grid gap-8 rounded-[2rem] border border-outline-variant/20 bg-white/75 p-6 shadow-lg shadow-stone-900/5 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
              Next Step
            </p>
            <h2 className="mt-4 max-w-2xl text-balance font-headline text-3xl leading-tight text-on-surface sm:text-4xl">
              Planning a home that needs more clarity, warmth, and hidden utility?
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-on-surface-variant sm:text-base">
              Bring the floor plan, the timeline, and the way you want the rooms to feel. We&apos;ll shape the spatial logic around daily life.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
              <span className="rounded-full border border-outline-variant/30 px-3 py-1.5">
                Apartments
              </span>
              <span className="rounded-full border border-outline-variant/30 px-3 py-1.5">
                Residences
              </span>
              <span className="rounded-full border border-outline-variant/30 px-3 py-1.5">
                Design & Build
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-on-primary transition-[background-color,transform] duration-200 hover:bg-primary-container motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:w-auto"
            >
              Book Consultation
            </Link>
            <Link
              href="/projects"
              className="inline-flex w-full items-center justify-center rounded-full border border-outline-variant/35 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:w-auto"
            >
              View Portfolio
            </Link>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-[1.2fr_0.9fr_0.9fr]">
          <div className="max-w-md">
            <Link href="/" className="text-2xl font-headline italic text-on-surface">
              Mikro<span className="text-primary">Living</span>
            </Link>
            <p className="mt-4 text-sm leading-7 text-on-surface-variant sm:text-base">
              {siteMeta.name} crafts residential interiors with quieter sightlines, warmer material palettes, and storage that feels built into the architecture.
            </p>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
              Jakarta / Bandung / Compact & family residences
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:contents">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-on-surface">
                Explore
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm text-on-surface-variant">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-on-surface">
                Connect
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm text-on-surface-variant">
                <Link
                  href="/projects"
                  className="transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Selected Projects
                </Link>
                <Link
                  href="/blog"
                  className="transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Journal
                </Link>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Consultation
                </Link>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-outline-variant/20 bg-white/70 p-5 md:hidden">
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
                Studio Note
              </p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                Start with the floor plan, the timeline, and the main friction in the room. That is usually enough to begin a sharper conversation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-outline-variant/20 pt-6 text-xs uppercase tracking-[0.25em] text-on-surface-variant md:flex-row md:items-center md:justify-between">
          <p>(c) 2026 {siteMeta.name} Interior Studio. All rights reserved.</p>
          <p>Crafted in Jakarta & Bandung</p>
        </div>
      </div>
    </footer>
  )
}
