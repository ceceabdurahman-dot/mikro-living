import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteShell } from '@/components/site/site-shell'
import { services } from '@/lib/site-data'

export const metadata: Metadata = {
  title: 'Consultation | MikroLiving',
  description: 'Plan a consultation for a MikroLiving apartment or residential interior project.',
}

const consultationSignals = [
  {
    label: 'Best fit',
    value: 'Apartment interiors, compact homes, and layout-led upgrades',
  },
  {
    label: 'Useful to prepare',
    value: 'Floor plan, timeline, and the routine that feels hardest right now',
  },
  {
    label: 'First session',
    value: 'We align mood, storage logic, circulation, and delivery priorities',
  },
]

const briefingChecklist = [
  'A rough floor plan, listing plan, or smartphone photos of the room',
  'The move-in, handover, or renovation window you are working toward',
  'Reference moods, material cues, or homes that feel close to the result',
  'The one friction point that makes the room feel smaller than it should',
]

const formFields = [
  { label: 'Name', placeholder: 'Your name', type: 'text' },
  { label: 'Email', placeholder: 'you@example.com', type: 'email' },
]

export default function ContactPage() {
  return (
    <SiteShell>
      <main id="main-content">
        <section className="relative isolate overflow-hidden bg-stone-950 px-6 pb-16 pt-28 text-white md:px-8 md:pb-20">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.28),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(245,245,244,0.12),_transparent_34%)]" />
            <div className="absolute left-[12%] top-24 hidden h-40 w-px bg-white/20 lg:block" />
            <div className="absolute bottom-20 right-[10%] hidden h-px w-44 bg-white/20 lg:block" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-12 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                Consultation
              </p>
              <h1 className="mt-5 max-w-5xl text-balance font-headline text-4xl leading-[0.95] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Start with the room, the routine, and the atmosphere you want to come home to.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-stone-300 md:text-lg">
                This intake is shaped like the final studio consultation flow: direct, spatial, and
                tuned around daily living. Backend submission is still paused, but the page now
                feels like a real first conversation instead of a temporary placeholder.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {consultationSignals.map((item, index) => (
                  <div
                    key={item.label}
                    className={`rounded-[1.75rem] border p-5 ${
                      index === 1
                        ? 'border-white/10 bg-white/[0.08]'
                        : 'border-white/12 bg-white/[0.04]'
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary-fixed-dim">
                      {item.label}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-stone-200">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr] xl:pl-8">
              <div className="editorial-frame overflow-hidden rounded-[2rem] bg-stone-200">
                <div className="relative aspect-[4/5] bg-[linear-gradient(145deg,_rgba(18,18,16,0.24),_rgba(18,18,16,0.56)),url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center">
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary-fixed-dim">
                      Studio rhythm
                    </p>
                    <p className="mt-3 max-w-xs text-sm leading-7 text-stone-100">
                      We usually begin by clarifying circulation, hidden storage, and which visual
                      elements should quietly anchor the room.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 self-end sm:pb-8">
                <div className="rounded-[1.75rem] border border-white/12 bg-white/[0.06] p-5 backdrop-blur">
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary-fixed-dim">
                    Typical scope
                  </p>
                  <p className="mt-3 text-2xl font-headline italic text-white">1 room to full home</p>
                  <p className="mt-2 text-sm leading-7 text-stone-300">
                    Compact apartments, new homes, and recalibrations that need stronger spatial
                    logic.
                  </p>
                </div>

                <div className="rounded-[1.75rem] bg-white px-5 py-6 text-stone-900 shadow-2xl shadow-black/20 sm:translate-x-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
                    Response note
                  </p>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                    When the backend reconnects, this route is ready to carry a real consultation
                    brief without another redesign pass.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 md:px-8 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 xl:grid-cols-[0.84fr_1.16fr]">
            <div className="space-y-6">
              <div className="rounded-[2rem] bg-stone-950 p-6 text-white shadow-2xl shadow-stone-900/10 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                  What helps most
                </p>
                <ul className="mt-5 space-y-4 text-sm leading-7 text-stone-300">
                  {briefingChecklist.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[2rem] border border-outline-variant/20 bg-white p-6 shadow-lg shadow-stone-900/5 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                  Service alignment
                </p>
                <div className="mt-5 grid gap-3">
                  {services.map((service, index) => (
                    <div
                      key={service.slug}
                      className={`rounded-[1.5rem] border p-4 ${
                        index === 1
                          ? 'border-stone-900/10 bg-stone-950 text-white'
                          : 'border-outline-variant/20 bg-stone-50'
                      }`}
                    >
                      <p
                        className={`text-xs font-bold uppercase tracking-[0.28em] ${
                          index === 1 ? 'text-primary-fixed-dim' : 'text-on-surface'
                        }`}
                      >
                        {service.title}
                      </p>
                      <p
                        className={`mt-2 text-sm leading-7 ${
                          index === 1 ? 'text-stone-300' : 'text-on-surface-variant'
                        }`}
                      >
                        {service.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="editorial-frame overflow-hidden rounded-[2.25rem] bg-white shadow-2xl shadow-stone-900/8">
              <div className="grid gap-0 lg:grid-cols-[0.42fr_0.58fr]">
                <div className="bg-stone-100 px-6 py-7 sm:px-8 sm:py-9">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                    Consultation brief
                  </p>
                  <h2 className="mt-4 max-w-sm text-balance font-headline text-3xl leading-tight text-on-surface sm:text-[2.2rem]">
                    Share the project in the same order we would discuss it in studio.
                  </h2>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-on-surface-variant">
                    The structure below is already ready for final wiring. Right now it behaves as a
                    static intake so the route stays polished while backend handoff is restored.
                  </p>

                  <div className="mt-8 rounded-[1.5rem] bg-white p-5 shadow-lg shadow-stone-900/5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
                      Current status
                    </p>
                    <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                      Submission is intentionally paused. Once the original endpoint returns, this
                      form can reconnect without changing the visual flow.
                    </p>
                    <Link
                      href="/projects"
                      className="mt-5 inline-flex text-xs font-bold uppercase tracking-[0.35em] text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    >
                      Review selected projects
                    </Link>
                  </div>
                </div>

                <form className="px-6 py-7 sm:px-8 sm:py-9">
                  <div className="grid gap-5 md:grid-cols-2">
                    {formFields.map((field) => (
                      <label key={field.label} className="grid gap-2 text-sm font-medium text-on-surface">
                        {field.label}
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          className="rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium text-on-surface">
                      Project type
                      <input
                        type="text"
                        placeholder="Apartment, residence, or studio"
                        className="rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-on-surface">
                      Timing
                      <input
                        type="text"
                        placeholder="Preferred start month or handover target"
                        className="rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary"
                      />
                    </label>
                  </div>

                  <label className="mt-5 grid gap-2 text-sm font-medium text-on-surface">
                    Project brief
                    <textarea
                      rows={6}
                      placeholder="Tell us about the room, the mood you want, what feels unresolved, and how the space should support daily life more clearly."
                      className="rounded-[1.5rem] border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary"
                    />
                  </label>

                  <div className="mt-6 rounded-[1.5rem] bg-stone-950 p-5 text-white">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <p className="max-w-xl text-sm leading-7 text-stone-300">
                        The button stays disabled until backend intake is live again. The page is
                        already composed for the final consultation flow.
                      </p>
                      <button
                        type="button"
                        disabled
                        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-on-primary opacity-60 sm:w-auto"
                      >
                        Consultation intake pending
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-stone-950 px-6 py-16 text-white md:px-8 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                Before we begin
              </p>
              <h2 className="mt-4 max-w-3xl text-balance font-headline text-3xl leading-tight sm:text-4xl">
                The strongest consultations usually start with one clear problem and a feeling worth
                protecting.
              </h2>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-stone-950 transition hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                See project rhythm
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:border-white/30 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Read studio notes
              </Link>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
