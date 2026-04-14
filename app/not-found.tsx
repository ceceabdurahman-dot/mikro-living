import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="relative z-10 min-h-screen overflow-hidden bg-stone-950 px-6 py-24 text-white md:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.2),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(245,245,244,0.12),_transparent_36%)]" />

      <div className="relative mx-auto flex max-w-5xl flex-col gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-10 backdrop-blur md:p-14">
        <span className="w-fit rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-primary-fixed-dim">
          404
        </span>
        <div className="max-w-2xl">
          <h1 className="font-headline text-5xl leading-tight md:text-7xl">
            Halaman yang Anda cari tidak ada di ruang ini.
          </h1>
          <p className="mt-5 text-base leading-8 text-stone-300 md:text-lg">
            Bisa jadi tautannya sudah berubah, kontennya belum dipublikasikan, atau halaman aslinya hilang bersama source frontend yang sedang kami pulihkan.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/"
            className="rounded-2xl bg-amber-400 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
          >
            Kembali ke homepage
          </Link>
          <Link
            href="/projects"
            className="rounded-2xl border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Lihat projects
          </Link>
          <Link
            href="/blog"
            className="rounded-2xl border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Buka journal
          </Link>
        </div>
      </div>
    </main>
  )
}
