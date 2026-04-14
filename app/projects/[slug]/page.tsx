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

  return (
    <SiteShell>
      <main className="pt-24">
        <section className="px-6 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-6xl">
            <Link
              href="/projects"
              className="text-xs font-bold uppercase tracking-[0.35em] text-primary"
            >
              Back to projects
            </Link>

            <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_0.65fr] lg:items-end">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-on-surface-variant">
                  {project.location} / {project.size} / {project.category} / {project.year}
                </p>
                <h1 className="mt-4 font-headline text-4xl leading-tight text-on-surface md:text-6xl">
                  {project.title}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-on-surface-variant">
                  {project.description}
                </p>
              </div>

              <div className="rounded-[2rem] border border-outline-variant/20 bg-white/80 p-6 shadow-lg shadow-stone-900/5">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                  Scope
                </p>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-on-surface-variant">
                  {project.scope.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative mt-12 min-h-[360px] overflow-hidden rounded-[2rem] shadow-2xl shadow-stone-900/10 md:min-h-[560px]">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
