import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteShell } from '@/components/site/site-shell'
import { services } from '@/lib/site-data'

export const metadata: Metadata = {
  title: 'Consultation | MikroLiving',
  description: 'Plan a consultation for a MikroLiving apartment or residential interior project.',
}

const consultationNotes = [
  {
    label: 'Project type',
    value: 'Apartment, residence, or compact-living upgrade',
  },
  {
    label: 'Best to prepare',
    value: 'Floor plan, timeline, and the main friction in the room',
  },
  {
    label: 'First conversation',
    value: 'A clear brief on layout, mood, storage, and delivery priorities',
  },
]

const formFields = [
  { label: 'Name', placeholder: 'Your name', type: 'text' },
  { label: 'Email', placeholder: 'you@example.com', type: 'email' },
]

export default function ContactPage() {
  return (
    <SiteShell>
      <main id="main-content" className="pt-20">
        <section className="relative overflow-hidden px-6 pb-16 pt-8 md:px-8 md:pb-20 md:pt-10">
          <div className="absolute inset-0">
            <div className="absolute left-[-10rem] top-20 h-72 w-72 rounded-full bg-primary-fixed/50 blur-3xl" />
            <div className="absolute right-[-8rem] bottom-0 h-80 w-80 rounded-full bg-stone-200/80 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr] xl:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                  Consultation
                </p>
                <h1 className="mt-4 max-w-4xl text-balance font-headline text-4xl leading-[0.98] text-on-surface sm:text-5xl md:text-6xl">
                  Start the conversation with the room, the routine, and the feeling you want to live in.
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8 text-on-surface-variant md:text-lg">
                  This page is shaped like a real consultation intake so the route feels complete and conversion-ready. Form submission stays paused for now, but the structure, pacing, and service framing are already in place.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {consultationNotes.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1.75rem] border border-outline-variant/20 bg-white/80 p-5 shadow-lg shadow-stone-900/5"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
                        {item.label}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-on-surface-variant">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-outline-variant/20 bg-white/80 p-6 shadow-2xl shadow-stone-900/8 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                  Scope Alignment
                </p>
                <div className="mt-5 grid gap-3">
                  {services.map((service) => (
                    <div
                      key={service.slug}
                      className="rounded-[1.5rem] border border-outline-variant/20 bg-background/70 p-4"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.28em] text-on-surface">
                        {service.title}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                        {service.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-8 xl:grid-cols-[0.82fr_1.18fr]">
              <div className="space-y-6">
                <div className="rounded-[2rem] bg-stone-900 p-6 text-white shadow-2xl shadow-stone-900/10 sm:p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                    What helps most
                  </p>
                  <ul className="mt-5 space-y-4 text-sm leading-7 text-stone-300">
                    <li>- A rough floor plan or photo of the current room</li>
                    <li>- The target handover or move-in window</li>
                    <li>- Reference moods, material cues, or examples you respond to</li>
                    <li>- The main storage, circulation, or visual-clutter problem to solve</li>
                  </ul>
                </div>

                <div className="rounded-[2rem] border border-outline-variant/20 bg-white/80 p-6 shadow-lg shadow-stone-900/5 sm:p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                    For now
                  </p>
                  <p className="mt-4 text-sm leading-7 text-on-surface-variant">
                    Submission is intentionally paused until the original backend handoff is reconnected. The route stays polished and stable so the final API can slot in without redesigning the page.
                  </p>
                  <Link
                    href="/projects"
                    className="mt-5 inline-flex text-xs font-bold uppercase tracking-[0.35em] text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    Review selected projects
                  </Link>
                </div>
              </div>

              <form className="rounded-[2rem] border border-outline-variant/20 bg-white/80 p-6 shadow-2xl shadow-stone-900/8 sm:p-8">
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
                    placeholder="Tell us about the room, the mood you want, and what needs to work better day to day."
                    className="rounded-[1.5rem] border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary"
                  />
                </label>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <p className="max-w-xl text-sm leading-7 text-on-surface-variant">
                    The button stays disabled until backend intake is connected. Everything else on the page is already tuned for the final consultation flow.
                  </p>
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-on-primary opacity-60 sm:w-auto"
                  >
                    Consultation intake pending
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
