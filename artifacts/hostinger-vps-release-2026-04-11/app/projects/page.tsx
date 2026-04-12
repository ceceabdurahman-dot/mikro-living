import Link from 'next/link'
import Image from 'next/image'

import PublicPageFrame from '../../components/PublicPageFrame'
import { projectsApi } from '../../lib/api'

const fallbackImage =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'

export default async function ProjectsPage() {
  let projects: any[] = []

  try {
    const response = await projectsApi.getAll({ limit: 12 })
    projects = response.data
  } catch {
    projects = []
  }

  return (
    <PublicPageFrame>
      <main className="min-h-screen bg-background px-6 pb-24 pt-28 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Portfolio
            </span>
            <h1 className="mt-3 text-4xl font-headline md:text-5xl">Published Projects</h1>
            <p className="mt-4 leading-relaxed text-on-surface-variant">
              Explore the residential and compact-living spaces built by MikroLiving.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {projects.length ? (
              projects.map((project: any) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="group overflow-hidden rounded-2xl bg-surface-container-low shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={project.cover_url || project.images?.[0]?.url || fallbackImage}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <div className="mb-2 flex flex-wrap gap-2 text-xs uppercase tracking-widest text-primary">
                      <span>{project.category}</span>
                      <span>/</span>
                      <span>{project.location || 'Indonesia'}</span>
                    </div>
                    <h2 className="text-2xl font-headline text-on-surface">{project.title}</h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
                      {project.description || 'A modern interior project by MikroLiving.'}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="md:col-span-2 xl:col-span-3">
                <div className="rounded-[32px] border border-dashed border-stone-300 bg-surface-container-low px-8 py-16 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                    Empty portfolio
                  </p>
                  <h2 className="mt-4 text-3xl font-headline text-on-surface">
                    Koleksi project sedang disiapkan.
                  </h2>
                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant">
                    Konten portfolio belum tersedia saat ini. Halaman ini akan terisi otomatis begitu
                    project dipublikasikan dari CMS.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </PublicPageFrame>
  )
}
