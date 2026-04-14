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
      <main id="main-content">
        <section className="relative isolate overflow-hidden bg-stone-950 text-white">
          <div className="absolute inset-0">
            <Image
              src={project.image}
              alt={project.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(108deg,rgba(20,18,14,0.88)_0%,rgba(20,18,14,0.74)_36%,rgba(20,18,14,0.22)_68%,rgba(20,18,14,0.32)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(247,189,72,0.18),transparent_24%),radial-gradient(circle_at_86%_22%,rgba(255,255,255,0.08),transparent_18%)]" />
          </div>

          <div className="relative z-10 flex min-h-[86svh] items-end px-6 pb-12 pt-28 md:px-8 md:pb-16">
            <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.82fr_0.18fr] lg:items-end">
              <div>
                <Link
                  href="/projects"
                  className="inline-flex text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-fixed-dim"
                >
                  Back to portfolio
                </Link>

                <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                  {project.category}
                </p>
                <h1 className="mt-4 max-w-5xl text-balance font-headline text-5xl leading-[0.94] text-white sm:text-6xl md:text-7xl">
                  {project.title}
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8 text-white/70 md:text-lg">
                  {project.summary}
                </p>
              </div>

              <div className="hidden lg:block">
                <div className="border-t border-white/15 pt-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/45">
                    {project.location} / {project.size} / {project.year}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-white/60">
                    A residential commission planned around material calm, better movement, and quieter utility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                    Project brief
                  </p>
                  <p className="mt-4 text-lg leading-8 text-on-surface">
                    {project.description}
                  </p>
                </div>

                <div className="divide-y divide-outline-variant/20 border-t border-outline-variant/20">
                  {[
                    { label: 'Location', value: project.location },
                    { label: 'Footprint', value: project.size },
                    { label: 'Category', value: project.category },
                    { label: 'Year', value: project.year },
                  ].map((item) => (
                    <div key={item.label} className="flex items-end justify-between gap-5 py-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-on-surface-variant">
                        {item.label}
                      </p>
                      <p className="text-right font-headline text-2xl text-on-surface sm:text-3xl">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                <div className="editorial-frame relative min-h-[420px] overflow-hidden sm:min-h-[560px]">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    priority
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-[1.75rem] bg-stone-950 p-6 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                      Scope
                    </p>
                    <ul className="mt-5 space-y-4 text-sm leading-7 text-stone-300">
                      {project.scope.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-3 h-1.5 w-1.5 rounded-full bg-primary-fixed-dim" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-[1.75rem] border border-outline-variant/20 bg-white/80 p-6 shadow-lg shadow-stone-900/5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                      Design intent
                    </p>
                    <p className="mt-4 text-sm leading-7 text-on-surface-variant">
                      The spatial language here is built around warmer contrast, quieter sightlines, and planning choices that keep the room feeling lighter once daily life begins to occupy it.
                    </p>
                    <div className="mt-5 grid gap-3">
                      <div className="rounded-[1.25rem] border border-outline-variant/20 bg-background/70 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-on-surface-variant">
                          Spatial tone
                        </p>
                        <p className="mt-2 text-sm leading-7 text-on-surface">
                          Warm, measured, and visually calm.
                        </p>
                      </div>
                      <div className="rounded-[1.25rem] border border-outline-variant/20 bg-background/70 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-on-surface-variant">
                          Planning lens
                        </p>
                        <p className="mt-2 text-sm leading-7 text-on-surface">
                          Utility is integrated into the envelope rather than layered on top.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-stone-950 px-6 py-20 text-white md:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                Next project
              </p>
              <h2 className="mt-4 max-w-2xl text-balance font-headline text-4xl leading-[1.02] text-white sm:text-5xl">
                Continue through the portfolio sequence.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-stone-400">
                Each commission extends the same studio logic differently, depending on footprint, atmosphere, and how the client wants the home to behave.
              </p>
              <Link
                href={`/projects/${nextProject.slug}`}
                className="mt-8 inline-flex text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim"
              >
                Open {nextProject.title}
              </Link>
            </div>

            <Link
              href={`/projects/${nextProject.slug}`}
              className="editorial-frame group relative block min-h-[340px] overflow-hidden"
            >
              <Image
                src={nextProject.image}
                alt={nextProject.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                sizes="(max-width: 1024px) 100vw, 46vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                  {nextProject.location} / {nextProject.category}
                </p>
                <h3 className="mt-3 text-balance font-headline text-4xl leading-none">
                  {nextProject.title}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-7 text-white/70">
                  {nextProject.summary}
                </p>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
