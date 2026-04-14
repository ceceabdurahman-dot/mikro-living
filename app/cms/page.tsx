import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteShell } from '@/components/site/site-shell'

export const metadata: Metadata = {
  title: 'CMS | MikroLiving',
  description: 'Protected studio workspace placeholder for the reconstructed MikroLiving frontend.',
}

const workspaceSignals = [
  {
    label: 'Access',
    value: 'This route is still protected and keeps the original entry point intact.',
  },
  {
    label: 'Current state',
    value: 'UI is ready while the original CMS modules and API source are still being restored.',
  },
  {
    label: 'Next handoff',
    value: 'Auth, content modules, and publishing actions can reconnect here without a new layout pass.',
  },
]

const workspaceAreas = [
  {
    title: 'Projects',
    detail: 'Manage portfolio records, featured status, slugs, and visual sequencing for the project pages.',
  },
  {
    title: 'Journal',
    detail: 'Reconnect editorial entries, summaries, and publishing controls for the blog structure now live on site.',
  },
  {
    title: 'Leads',
    detail: 'Wire consultation intake handling back into the protected workspace once the backend handoff returns.',
  },
]

const restoreChecklist = [
  'Reconnect session handling and the original credential flow',
  'Restore project and blog management modules',
  'Reattach publishing actions, draft states, and form handoff',
  'Validate protected navigation, redirects, and API contracts',
]

export default function CmsPage() {
  return (
    <SiteShell>
      <main id="main-content">
        <section className="relative isolate overflow-hidden bg-stone-950 px-6 pb-16 pt-28 text-white md:px-8 md:pb-20">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.24),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(245,245,244,0.1),_transparent_34%)]" />
            <div className="absolute left-[10%] top-20 hidden h-40 w-px bg-white/15 lg:block" />
            <div className="absolute right-[8%] bottom-20 hidden h-px w-40 bg-white/15 lg:block" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-12 xl:grid-cols-[1.04fr_0.96fr] xl:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                Studio CMS
              </p>
              <h1 className="mt-5 max-w-5xl text-balance font-headline text-4xl leading-[0.95] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                The protected workspace is back in place and visually aligned with the rest of the site.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-stone-300 md:text-lg">
                This screen now feels like a real studio workspace surface rather than a bare recovery
                route. The structure is ready for modules, actions, and protected content flows to
                reconnect.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {workspaceSignals.map((item, index) => (
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

            <div className="grid gap-4 sm:grid-cols-[1.05fr_0.95fr] xl:pl-8">
              <div className="rounded-[2rem] border border-white/12 bg-white/[0.05] p-6 backdrop-blur sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                  Workspace status
                </p>
                <div className="mt-6 space-y-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-white/60">
                      Route
                    </p>
                    <p className="mt-2 text-2xl font-headline italic text-white">Protected and stable</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-white/60">
                      Content modules
                    </p>
                    <p className="mt-2 text-sm leading-7 text-stone-300">
                      Waiting for the original admin source and publishing actions to return.
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-white/60">
                      Handoff
                    </p>
                    <p className="mt-2 text-sm leading-7 text-stone-300">
                      Ready to accept auth, CRUD modules, and route-aware redirects without another visual rewrite.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 self-end sm:pb-8">
                <div className="rounded-[1.75rem] bg-white px-5 py-6 text-stone-900 shadow-2xl shadow-black/20">
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
                    Admin note
                  </p>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                    Middleware, route structure, and visual framing are in place. The missing piece is the original CMS logic, not the screen itself.
                  </p>
                </div>

                <Link
                  href="/login?redirect=%2Fcms"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:border-white/30 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Revisit access flow
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 md:px-8 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 xl:grid-cols-[0.82fr_1.18fr]">
            <div className="space-y-6">
              <div className="rounded-[2rem] bg-stone-950 p-6 text-white shadow-2xl shadow-stone-900/10 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                  Restore checklist
                </p>
                <ul className="mt-5 space-y-4 text-sm leading-7 text-stone-300">
                  {restoreChecklist.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[2rem] border border-outline-variant/20 bg-white p-6 shadow-lg shadow-stone-900/5 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                  Why this matters
                </p>
                <p className="mt-4 text-sm leading-7 text-on-surface-variant">
                  The public site is already rebuilt around projects, notes, consultation, and protected access.
                  Aligning the CMS surface now means the operational side can return without feeling disconnected from the brand system.
                </p>
              </div>
            </div>

            <div className="editorial-frame overflow-hidden rounded-[2.25rem] bg-white shadow-2xl shadow-stone-900/8">
              <div className="grid gap-0 lg:grid-cols-[0.42fr_0.58fr]">
                <div className="bg-stone-100 px-6 py-7 sm:px-8 sm:py-9">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                    Workspace surfaces
                  </p>
                  <h2 className="mt-4 max-w-sm text-balance font-headline text-3xl leading-tight text-on-surface sm:text-[2.15rem]">
                    The admin side is framed around the same core flows already visible on the live site.
                  </h2>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-on-surface-variant">
                    These areas describe the modules that can slot back in first once source and backend endpoints are available again.
                  </p>

                  <div className="mt-8 rounded-[1.5rem] bg-white p-5 shadow-lg shadow-stone-900/5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
                      Current behavior
                    </p>
                    <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                      This route is currently a polished operational placeholder. It preserves the guardrail and prepares the shape of the final workspace.
                    </p>
                  </div>
                </div>

                <div className="px-6 py-7 sm:px-8 sm:py-9">
                  <div className="grid gap-4">
                    {workspaceAreas.map((area, index) => (
                      <div
                        key={area.title}
                        className={`rounded-[1.75rem] border p-5 ${
                          index === 1
                            ? 'border-stone-900/10 bg-stone-950 text-white'
                            : 'border-outline-variant/20 bg-stone-50'
                        } ${index === 2 ? 'md:translate-x-8' : ''}`}
                      >
                        <p
                          className={`text-xs font-bold uppercase tracking-[0.3em] ${
                            index === 1 ? 'text-primary-fixed-dim' : 'text-on-surface'
                          }`}
                        >
                          {area.title}
                        </p>
                        <p
                          className={`mt-3 text-sm leading-7 ${
                            index === 1 ? 'text-stone-300' : 'text-on-surface-variant'
                          }`}
                        >
                          {area.detail}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col gap-4 border-t border-outline-variant/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-md text-sm leading-7 text-on-surface-variant">
                      Once the original modules come back, this page can become the operational entry to the studio system without losing its current visual consistency.
                    </p>
                    <Link
                      href="/projects"
                      className="inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-950"
                    >
                      Review live output
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
