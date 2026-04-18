import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { getProjects, orderProjectsForShowcase } from '@/lib/api'
import { SiteShell } from '@/components/site/site-shell'

export const metadata: Metadata = {
  title: 'Projects | MikroLiving',
  description: 'A curated view of MikroLiving interior projects and compact living transformations.',
}

export default async function ProjectsPage() {
  const projects = await getProjects()
  const showcaseProjects = orderProjectsForShowcase(projects)
  const featuredProject = showcaseProjects[0]
  const secondaryProjects = showcaseProjects.slice(1)
  const years = projects
    .map((project) => Number(project.year))
    .sort((yearA, yearB) => yearA - yearB)
  const yearRange = `${years[0]}-${years[years.length - 1]}`

  return (
    <SiteShell>
      <main id="main-content">
        <section className="relative isolate overflow-hidden bg-stone-950 px-6 pb-16 pt-28 text-white md:px-8 md:pb-20">
          <div className="absolute inset-0">
            <div className="absolute left-[-10rem] top-10 h-80 w-80 rounded-full bg-primary/12 blur-3xl" />
            <div className="absolute right-[-8rem] top-28 h-72 w-72 rounded-full bg-primary-fixed/12 blur-3xl" />
            <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-stone-950 to-transparent" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                  Portfolio
                </p>
                <h1 className="mt-4 max-w-4xl text-balance font-headline text-5xl leading-[0.94] text-white sm:text-6xl md:text-7xl">
                  Spaces selected for atmosphere, flow, and built-in precision.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-stone-400 md:text-lg">
                  This portfolio is arranged like a sequence rather than a grid, so each project feels like part of a larger studio language while still keeping its own spatial identity.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <p className="font-headline text-4xl text-primary-fixed-dim">{projects.length}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.35em] text-stone-500">
                    Selected homes
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <p className="font-headline text-4xl text-primary-fixed-dim">2</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.35em] text-stone-500">
                    Cities active
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <p className="font-headline text-4xl text-primary-fixed-dim">{yearRange}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.35em] text-stone-500">
                    Current span
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                  Signature Residence
                </p>

                <Link
                  href={`/projects/${featuredProject.slug}`}
                  className="editorial-frame group relative block min-h-[560px] overflow-hidden"
                >
                  <Image
                    src={featuredProject.image}
                    alt={featuredProject.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    sizes="(max-width: 1024px) 100vw, 56vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/15 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white sm:p-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                      {featuredProject.location} / {featuredProject.size} / {featuredProject.year}
                    </p>
                    <h2 className="mt-3 max-w-lg text-balance font-headline text-4xl leading-none sm:text-5xl">
                      {featuredProject.title}
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                      {featuredProject.description}
                    </p>
                  </div>
                </Link>
              </div>

              <div className="pt-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                  Sequence
                </p>
                <div className="mt-6 divide-y divide-outline-variant/20">
                  {secondaryProjects.map((project, index) => (
                    <Link
                      key={project.slug}
                      href={`/projects/${project.slug}`}
                      className={`group grid gap-4 py-6 sm:grid-cols-[0.16fr_1fr] ${
                        index % 2 === 1 ? 'lg:translate-x-10' : ''
                      }`}
                    >
                      <p className="font-headline text-4xl leading-none text-primary/75">
                        {String(index + 1).padStart(2, '0')}
                      </p>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-on-surface-variant">
                          {project.location} / {project.category} / {project.size}
                        </p>
                        <h3 className="mt-3 text-balance font-headline text-3xl text-on-surface transition-colors group-hover:text-primary">
                          {project.title}
                        </h3>
                        <p className="mt-3 max-w-lg text-sm leading-7 text-on-surface-variant">
                          {project.summary}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {project.scope.map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-outline-variant/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-stone-950 px-6 py-20 text-white md:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.88fr_1.12fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                What holds the work together
              </p>
              <h2 className="mt-4 max-w-2xl text-balance font-headline text-4xl leading-[1.02] text-white sm:text-5xl">
                Warm material contrast, lighter sightlines, and hidden utility as architecture.
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                  Layout first
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-400">
                  Each room is planned for movement and visual calm before decoration enters the conversation.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                  Joinery logic
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-400">
                  Storage is integrated so the space feels more intentional, not more full.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                  Tactile warmth
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-400">
                  Softened tones and measured material contrast keep compact rooms atmospheric.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
