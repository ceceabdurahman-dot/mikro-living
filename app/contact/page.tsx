import type { Metadata } from 'next'

import { SectionHeading } from '@/components/site/section-heading'
import { SiteShell } from '@/components/site/site-shell'

export const metadata: Metadata = {
  title: 'Consultation | MikroLiving',
  description: 'Plan a consultation and align the next phase of the MikroLiving frontend rebuild.',
}

export default function ContactPage() {
  return (
    <SiteShell>
      <main className="pt-24">
        <section className="px-6 py-20 md:px-8 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <SectionHeading
              eyebrow="Consultation"
              title="A contact screen is back in place, ready for future API wiring."
              description="The original site clearly wanted a strong conversion path. This rebuild restores that route with structure, form fields, and copy, while being honest that submission wiring still depends on the missing backend source."
            />

            <div className="grid gap-8">
              <div className="rounded-[2rem] border border-outline-variant/20 bg-white/80 p-8 shadow-lg shadow-stone-900/5">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                  What to prepare
                </p>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-on-surface-variant">
                  <li>- Project type and square-meter estimate</li>
                  <li>- Desired move-in or handover timeline</li>
                  <li>- Reference mood, images, or material cues</li>
                  <li>- The main storage or circulation problem to solve</li>
                </ul>
              </div>

              <form className="rounded-[2rem] border border-outline-variant/20 bg-white/80 p-8 shadow-lg shadow-stone-900/5">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-on-surface">
                    Name
                    <input
                      type="text"
                      placeholder="Your name"
                      className="rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-on-surface">
                    Email
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none"
                    />
                  </label>
                </div>

                <label className="mt-5 grid gap-2 text-sm font-medium text-on-surface">
                  Project brief
                  <textarea
                    rows={6}
                    placeholder="Tell us about the space, timeline, and design direction."
                    className="rounded-[1.5rem] border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none"
                  />
                </label>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-7 text-on-surface-variant">
                    Submission is intentionally disabled in this frontend-only recovery build until the original API flow is restored.
                  </p>
                  <button
                    type="button"
                    disabled
                    className="rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-on-primary opacity-60"
                  >
                    Submit later
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
