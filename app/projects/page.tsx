import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { SectionHeading } from '@/components/site/section-heading'
import { SiteShell } from '@/components/site/site-shell'
import { projects } from '@/lib/site-data'

export const metadata: Metadata = {
  title: 'Projects | MikroLiving',
  description: 'A curated view of MikroLiving interior projects and compact living transformations.',
}

export default function ProjectsPage() {
  return (
    <SiteShell>
      <main className="pt-24">
        <section className="px-6 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Portfolio"
              title="Recovered project pages with enough structure to grow into the full archive again."
              description="Each entry below is reconstructed from the saved brand direction and the surviving HTML snapshots. The routes are live, the layout is stable, and the data can later move into a CMS or API without changing the page shape."
            />

            <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className="group overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-white/80 shadow-lg shadow-stone-900/5"
                >
                  <div className="relative min-h-[260px]">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 1280px) 50vw, 33vw"
                    />
                  </div>
                  <div className="space-y-3 p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                      {project.category}
                    </p>
                    <h2 className="font-headline text-2xl text-on-surface">{project.title}</h2>
                    <p className="text-sm uppercase tracking-[0.25em] text-on-surface-variant">
                      {project.location} / {project.size} / {project.year}
                    </p>
                    <p className="text-sm leading-7 text-on-surface-variant">{project.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
