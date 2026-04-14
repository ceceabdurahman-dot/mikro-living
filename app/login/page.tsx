import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Login | MikroLiving',
  description: 'CMS access page for the MikroLiving studio workspace.',
}

type LoginPageProps = {
  searchParams?: {
    redirect?: string
  }
}

const accessNotes = [
  'The redirect contract remains preserved, so CMS routing can reconnect cleanly.',
  'This page now reads like a deliberate studio access surface rather than a temporary stop.',
  'Authentication is still paused until the original backend handoff is restored.',
]

export default function LoginPage({ searchParams }: LoginPageProps) {
  const redirectTarget = searchParams?.redirect || '/cms'

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-stone-950 px-6 py-8 text-white md:px-8 md:py-10">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.34),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(245,245,244,0.12),_transparent_34%)]" />
        <div className="absolute left-[12%] top-0 hidden h-full w-px bg-white/10 lg:block" />
        <div className="absolute right-[8%] top-24 hidden h-px w-40 bg-white/15 lg:block" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="flex flex-col justify-between gap-10">
          <div>
            <Link href="/" className="inline-flex text-2xl font-headline italic text-white">
              Mikro<span className="text-primary-fixed-dim">Living</span>
            </Link>

            <p className="mt-12 text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
              CMS Access
            </p>
            <h1 className="mt-5 max-w-xl text-balance font-headline text-4xl leading-[0.96] text-white sm:text-5xl lg:text-6xl">
              Studio access with a calmer, more precise arrival.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-stone-300">
              The page now carries the same tone as the rest of the site: darker, cleaner, and more
              intentional. It is ready for authentication to reconnect without redesigning the
              visual entry point.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {accessNotes.map((item, index) => (
              <div
                key={item}
                className={`rounded-[1.75rem] border p-5 ${
                  index === 1
                    ? 'border-white/10 bg-white/[0.08]'
                    : 'border-white/12 bg-white/[0.04]'
                } ${index === 2 ? 'lg:translate-x-8' : ''}`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary-fixed-dim">
                  0{index + 1}
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-200">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="editorial-frame overflow-hidden rounded-[2.25rem] bg-white text-stone-950 shadow-2xl shadow-black/25">
          <div className="grid gap-0 lg:grid-cols-[0.44fr_0.56fr]">
            <div className="bg-stone-100 px-6 py-7 sm:px-8 sm:py-9">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                Access note
              </p>
              <h2 className="mt-4 max-w-sm text-balance font-headline text-3xl leading-tight text-on-surface sm:text-[2.1rem]">
                The route is intact. The credentials layer is the only piece still missing.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-on-surface-variant">
                We are preserving the real redirect target and entry flow, so once auth is restored
                the studio team can step back in without a new UX pass.
              </p>

              <div className="mt-8 rounded-[1.5rem] bg-white p-5 shadow-lg shadow-stone-900/5">
                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
                  Redirect after sign-in
                </p>
                <p className="mt-3 break-all font-mono text-xs text-on-surface">{redirectTarget}</p>
              </div>

              <Link
                href="/contact"
                className="mt-6 inline-flex text-xs font-bold uppercase tracking-[0.35em] text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Need studio assistance?
              </Link>
            </div>

            <div className="px-6 py-7 sm:px-8 sm:py-9">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                    Sign in
                  </p>
                  <p className="mt-3 max-w-md text-sm leading-7 text-on-surface-variant">
                    Inputs stay visible and stable while backend credentials, sessions, and protected
                    CMS handoff are being reconnected.
                  </p>
                </div>

                <div className="rounded-[1.5rem] bg-stone-950 px-4 py-3 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary-fixed-dim">
                    Status
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.28em] text-stone-200">
                    Authentication paused
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-on-surface">
                  Email
                  <input
                    type="email"
                    placeholder="admin@mikroliving.com"
                    className="rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-on-surface">
                  Password
                  <input
                    type="password"
                    placeholder="Password"
                    className="rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary"
                  />
                </label>
              </div>

              <label className="mt-5 grid gap-2 text-sm font-medium text-on-surface">
                Workspace note
                <textarea
                  rows={4}
                  placeholder="Optional context for the final handoff, such as role, environment, or redirect expectations."
                  className="rounded-[1.5rem] border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary"
                />
              </label>

              <div className="mt-6 rounded-[1.5rem] bg-stone-950 p-5 text-white">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <p className="max-w-xl text-sm leading-7 text-stone-300">
                    Sign-in remains non-submitting for now, but the screen is already ready for the
                    final authentication layer.
                  </p>
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-on-primary opacity-60 sm:w-auto"
                  >
                    Authentication paused
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
