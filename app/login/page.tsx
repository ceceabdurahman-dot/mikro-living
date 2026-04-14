import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Login | MikroLiving',
  description: 'Admin login placeholder for the reconstructed MikroLiving frontend.',
}

type LoginPageProps = {
  searchParams?: {
    redirect?: string
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const redirectTarget = searchParams?.redirect || '/cms'

  return (
    <main className="relative z-10 min-h-screen overflow-hidden px-6 py-12 md:px-8">
      <div className="absolute inset-0">
        <div className="absolute left-[-10rem] top-[-4rem] h-80 w-80 rounded-full bg-primary-fixed/60 blur-3xl" />
        <div className="absolute right-[-10rem] bottom-[-6rem] h-96 w-96 rounded-full bg-stone-200/70 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100svh-6rem)] max-w-6xl gap-10 rounded-[2.5rem] border border-outline-variant/20 bg-white/75 p-8 shadow-2xl shadow-stone-900/10 backdrop-blur lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <Link href="/" className="text-2xl font-headline italic text-on-surface">
              Mikro<span className="text-primary">Living</span>
            </Link>

            <p className="mt-12 text-xs font-bold uppercase tracking-[0.35em] text-primary">
              CMS Access
            </p>
            <h1 className="mt-4 max-w-xl font-headline text-4xl leading-tight text-on-surface md:text-5xl">
              The login route is restored so protected navigation is no longer broken.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-on-surface-variant">
              The original client-side login code is gone, so this page is a clean placeholder that keeps the route alive while backend auth wiring is rebuilt.
            </p>
          </div>

          <div className="rounded-[2rem] bg-stone-900 p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
              Redirect target
            </p>
            <p className="mt-4 break-all font-mono text-sm text-stone-300">{redirectTarget}</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-outline-variant/20 bg-background p-8">
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-medium text-on-surface">
              Email
              <input
                type="email"
                placeholder="admin@mikroliving.com"
                className="rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-on-surface">
              Password
              <input
                type="password"
                placeholder="Password"
                className="rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none"
              />
            </label>

            <button
              type="button"
              disabled
              className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-on-primary opacity-60"
            >
              Auth wiring pending
            </button>

            <p className="text-sm leading-7 text-on-surface-variant">
              This screen is intentionally non-submitting in the recovery build. Once the API layer is restored, the form can post to the real auth endpoint without changing the route contract.
            </p>

            <Link
              href="/"
              className="mt-4 text-xs font-bold uppercase tracking-[0.35em] text-primary"
            >
              Return to homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
