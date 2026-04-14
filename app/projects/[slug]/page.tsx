import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { SiteShell } from '@/components/site/site-shell'
import { projects } from '@/lib/site-data'

type ProjectPageProps = {
  params: {
    slug: string
  }
}

function getProject(slug: string) {
  return projects.find((project) => project.slug === slug)
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

export function generateMetadata({ params }: ProjectPageProps): Metadata {
  const project = getProject(params.slug)

  if (!project) {
    return {}
  }

  return {
    title: `${project.title} | MikroLiving`,
    description: project.summary,
  }
}

export default function ProjectDetailPage({ params }: ProjectPageProps) {
  const project = getProject(params.slug)

  if (!project) {
    notFound()
  }

  const projectIndex = projects.findIndex((entry) => entry.slug === project.slug)
  const nextProject = projects[(projectIndex + 1) % projects.length]

  return (
    <SiteShell>
      <main id="main-content" className="pt-20">
        <section className="relative overflow-hidden px-6 pb-16 pt-8 md:px-8 md:pb-20 md:pt-10">
          <div className="absolute inset-0">
            <div className="absolute right-[-8rem] top-0 h-64 w-64 rounded-full bg-primary-fixed/50 blur-3xl" />
            <div className="absolute left-[-6rem] top-64 h-56 w-56 rounded-full bg-stone-200/80 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.35em] text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Back to portfolio
            </Link>

            <div className="mt-8 grid gap-10 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                  {project.category}
                </p>
                <h1 className="mt-4 max-w-4xl text-balance font-headline text-4xl leading-[0.98] text-on-surface sm:text-5xl md:text-6xl">
                  {project.title}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-on-surface-variant md:text-xl">
                  {project.summary}
                </p>
                <p className="mt-6 max-w-3xl text-base leading-8 text-on-surface-variant">
                  {project.description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[1.75rem] border border-outline-variant/20 bg-white/80 p-6 shadow-lg shadow-stone-900/5">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                    Project Brief
                  </p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-on-surface-variant">
                        Location
                      </p>
                      <p className="mt-2 text-base text-on-surface">{project.location}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-on-surface-variant">
                        Footprint
                      </p>
                      <p className="mt-2 text-base text-on-surface">{project.size}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-on-surface-variant">
                        Category
                      </p>
                      <p className="mt-2 text-base text-on-surface">{project.category}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-on-surface-variant">
                        Year
                      </p>
                      <p className="mt-2 text-base text-on-surface">{project.year}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] bg-stone-900 p-6 text-white shadow-2xl shadow-stone-900/10">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                    Scope
                  </p>
                  <ul className="mt-5 space-y-4">
                    {project.scope.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-7 text-stone-300">
                        <span className="mt-3 h-1.5 w-1.5 rounded-full bg-primary-fixed-dim" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="relative min-h-[380px] overflow-hidden rounded-[2rem] shadow-2xl shadow-stone-900/10 sm:min-h-[520px]">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
              </div>

              <div className="grid gap-6">
                <div className="rounded-[2rem] border border-outline-variant/20 bg-white/80 p-6 shadow-lg shadow-stone-900/5 sm:p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                    Design Intent
                  </p>
                  <p className="mt-4 text-sm leading-7 text-on-surface-variant sm:text-base sm:leading-8">
                    The brief centered on making the footprint feel composed in use, not just refined in photographs. Material warmth, measured storage, and a cleaner circulation path were used to keep the home calmer from morning through evening.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[1.75rem] border border-outline-variant/20 bg-background/70 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-on-surface-variant">
                      Spatial tone
                    </p>
                    <p className="mt-3 text-sm leading-7 text-on-surface">
                      Warm, quiet, and built to hold daily routines without clutter.
                    </p>
                  </div>
                  <div className="rounded-[1.75rem] border border-outline-variant/20 bg-background/70 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-on-surface-variant">
                      Planning lens
                    </p>
                    <p className="mt-3 text-sm leading-7 text-on-surface">
                      Storage and movement are treated as core architecture, not afterthoughts.
                    </p>
                  </div>
                  <div className="rounded-[1.75rem] border border-outline-variant/20 bg-background/70 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-on-surface-variant">
                      Delivery
                    </p>
                    <p className="mt-3 text-sm leading-7 text-on-surface">
                      Detailed through {project.scope[0].toLowerCase()} and supported by precise material choices.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href={`/projects/${nextProject.slug}`}
              className="mt-12 grid gap-6 rounded-[2rem] border border-outline-variant/20 bg-white/80 p-6 shadow-lg shadow-stone-900/5 transition-transform duration-200 motion-safe:hover:-translate-y-1 motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:p-8 lg:grid-cols-[0.95fr_0.7fr] lg:items-center"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                  Next Project
                </p>
                <h2 className="mt-4 text-balance font-headline text-3xl text-on-surface">
                  {nextProject.title}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                  {nextProject.summary}
                </p>
              </div>
              <div className="relative min-h-[220px] overflow-hidden rounded-[1.75rem]">
                <Image
                  src={nextProject.image}
                  alt={nextProject.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 35vw"
                />
              </div>
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
