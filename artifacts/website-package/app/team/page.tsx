import Image from 'next/image'
import Link from 'next/link'

import fetchAPI from '../../lib/api'

type TeamMember = {
  id: number
  name: string
  role?: string
  bio?: string
  avatar_url?: string
  instagram?: string
  linkedin?: string
}

async function getTeamMembers() {
  try {
    const payload = await fetchAPI<{ data: TeamMember[] }>('/team')
    return payload.data || []
  } catch {
    return []
  }
}

export default async function TeamPage() {
  const teamMembers = await getTeamMembers()

  return (
    <main className="min-h-screen bg-stone-950 px-6 py-24 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
            Meet the Team
          </p>
          <h1 className="mt-4 text-5xl leading-tight font-headline md:text-6xl">
            The people behind MikroLiving
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-300">
            Kenali tim yang membentuk setiap keputusan desain, detail built-in, dan pengalaman
            hunian yang kami kerjakan bersama klien.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/"
              className="rounded-2xl bg-amber-400 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
            >
              Back to homepage
            </Link>
            <Link
              href="/projects"
              className="rounded-2xl border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View projects
            </Link>
          </div>
        </div>

        {teamMembers.length ? (
          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {teamMembers.map((member) => (
              <article
                key={member.id}
                className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-xl backdrop-blur"
              >
                <div className="relative aspect-[4/4.5] bg-stone-900">
                  {member.avatar_url ? (
                    <Image
                      src={member.avatar_url}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.28),_transparent_42%)] text-6xl font-headline text-amber-200">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <p className="text-2xl font-headline text-white">{member.name}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
                      {member.role || 'Team Member'}
                    </p>
                  </div>
                  <p className="text-sm leading-7 text-stone-300">
                    {member.bio || 'Profil anggota tim ini akan segera kami lengkapi.'}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {member.instagram ? (
                      <a
                        href={member.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-200 transition hover:bg-white/10"
                      >
                        Instagram
                      </a>
                    ) : null}
                    {member.linkedin ? (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-200 transition hover:bg-white/10"
                      >
                        LinkedIn
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/5 px-8 py-16 text-center backdrop-blur">
            <p className="text-sm leading-7 text-stone-300">
              Data tim belum tersedia untuk halaman publik saat ini.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
