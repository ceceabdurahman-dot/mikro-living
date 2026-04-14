import type { Metadata } from 'next'

import { SiteShell } from '@/components/site/site-shell'

export const metadata: Metadata = {
  title: 'CMS | MikroLiving',
  description: 'Admin workspace placeholder for the reconstructed MikroLiving frontend.',
}

export default function CmsPage() {
  return (
    <SiteShell>
      <main className="pt-24">
        <section className="px-6 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-outline-variant/20 bg-white/80 p-8 shadow-lg shadow-stone-900/5 md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
              CMS Placeholder
            </p>
            <h1 className="mt-4 font-headline text-4xl leading-tight text-on-surface">
              The protected admin route is back in place.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-on-surface-variant">
              Middleware still guards this route via the existing cookie check. The page content here is intentionally light until the original CMS modules and API source are restored.
            </p>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
