import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant/20 bg-stone-100 px-6 py-14 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="text-2xl font-headline italic text-on-surface">
              Mikro<span className="text-primary">Living</span>
            </Link>
            <p className="mt-4 text-sm leading-7 text-on-surface-variant">
              Crafting intelligent, elegant spaces that elevate the standard of compact and residential living.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-on-surface">
              Explore
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-on-surface-variant">
              <Link href="/projects" className="transition-colors hover:text-primary">
                Projects
              </Link>
              <Link href="/blog" className="transition-colors hover:text-primary">
                Journal
              </Link>
              <Link href="/contact" className="transition-colors hover:text-primary">
                Consultation
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-on-surface">
              System
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-on-surface-variant">
              <Link href="/login" className="transition-colors hover:text-primary">
                CMS Login
              </Link>
              <Link href="/#studio" className="transition-colors hover:text-primary">
                Studio Story
              </Link>
              <Link href="/#insights" className="transition-colors hover:text-primary">
                Latest Insight
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-outline-variant/20 pt-6 text-xs uppercase tracking-[0.25em] text-on-surface-variant md:flex-row md:items-center md:justify-between">
          <p>(c) 2026 MikroLiving Interior Studio. All rights reserved.</p>
          <p>Crafted in Jakarta</p>
        </div>
      </div>
    </footer>
  )
}
