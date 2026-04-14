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
  'The route and redirect contract are already preserved.',
  'Protected CMS navigation can reconnect here without changing the UI entry point.',
  'Authentication stays paused until the original backend handoff is restored.',
]

export default function LoginPage({ searchParams }: LoginPageProps) {
  const redirectTarget = searchParams?.redirect || '/cms'

  return (
    <main className="relative z-10 min-h-screen overflow-hidden px-6 py-8 md:px-8 md:py-10">
      <div className="absolute inset-0">
        <div className="absolute left-[-10rem] top-[-4rem] h-80 w-80 rounded-full bg-primary-fixed/60 blur-3xl" />
        <div className="absolute right-[-10rem] bottom-[-6rem] h-96 w-96 rounded-full bg-stone-200/70 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl gap-8 rounded-[2rem] border border-outline-variant/20 bg-white/80 p-6 shadow-2xl shadow-stone-900/10 backdrop-blur sm:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:p-12">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <Link href="/" className="text-2xl font-headline italic text-on-surface">
              Mikro<span className="text-primary">Living</span>
            </Link>

            <p className="mt-10 text-xs font-bold uppercase tracking-[0.35em] text-primary">
              CMS Access
            </p>
            <h1 className="mt-4 max-w-xl text-balance font-headline text-4xl leading-[1.02] text-on-surface sm:text-5xl">
              A clean sign-in point for the studio workspace, ready for auth to reconnect.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-on-surface-variant">
              This page now behaves like a deliberate studio login surface rather than a temporary redirect stop. The form is styled, stable, and waiting for the final authentication layer to slot in.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {accessNotes.map((item, index) => (
              <div
                key={item}
                className={`rounded-[1.5rem] border border-outline-variant/20 p-5 ${
                  index === 1 ? 'bg-stone-900 text-white' : 'bg-background/70'
                }`}
              >
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.32em] ${
                    index === 1 ? 'text-primary-fixed-dim' : 'text-primary'
                  }`}
                >
                  0{index + 1}
                </p>
                <p
                  className={`mt-3 text-sm leading-7 ${
                    index === 1 ? 'text-stone-300' : 'text-on-surface-variant'
                  }`}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 rounded-[2rem] border border-outline-variant/20 bg-background/85 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                Sign In
              </p>
              <p className="mt-3 max-w-md text-sm leading-7 text-on-surface-variant">
                Studio access stays intentionally paused until backend credentials and session handoff are restored.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-outline-variant/20 bg-white/80 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-on-surface-variant">
                Redirect after sign-in
              </p>
              <p className="mt-2 break-all font-mono text-xs text-on-surface">{redirectTarget}</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
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

          <label className="grid gap-2 text-sm font-medium text-on-surface">
            Workspace note
            <textarea
              rows={4}
              placeholder="Optional notes for the eventual handoff, such as environment, role, or redirect context."
              className="rounded-[1.5rem] border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary"
            />
          </label>

          <div className="flex flex-col gap-4 border-t border-outline-variant/20 pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm leading-7 text-on-surface-variant">
                Sign-in stays non-submitting for now, but this route is visually and structurally ready for the final auth connection.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex text-xs font-bold uppercase tracking-[0.35em] text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Need studio assistance?
              </Link>
            </div>

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
    </main>
  )
}
