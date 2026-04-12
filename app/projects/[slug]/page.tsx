import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import PublicPageFrame from '../../../components/PublicPageFrame'
import { projectsApi } from '../../../lib/api'

const fallbackImage =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  try {
    const { slug } = await params
    const response = await projectsApi.getOne(slug)
    const project = response.data
    const gallery = [
      ...(project.cover_url ? [{ id: 'cover', url: project.cover_url, alt_text: project.title }] : []),
      ...((project.images || []).map((image: any) => ({
        id: image.id,
        url: image.url,
        alt_text: image.alt_text || project.title,
      })) as Array<{ id: string | number; url: string; alt_text: string }>),
    ]

    return (
      <PublicPageFrame>
        <main className="min-h-screen bg-background px-6 pb-24 pt-28 md:px-8">
          <div className="mx-auto max-w-6xl">
            <Link href="/projects" className="text-sm font-semibold text-primary hover:underline">
              Back to Projects
            </Link>

            <div className="mt-8 grid gap-12 lg:grid-cols-[1.2fr,0.8fr]">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
                  <Image
                    src={gallery[0]?.url || fallbackImage}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                </div>

                {gallery.length > 1 ? (
                  <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                    {gallery.slice(1).map((image) => (
                      <div key={image.id} className="relative aspect-square overflow-hidden rounded-2xl">
                        <Image
                          src={image.url}
                          alt={image.alt_text}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <aside className="space-y-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    {project.category}
                  </span>
                  <h1 className="mt-3 text-4xl font-headline text-on-surface">{project.title}</h1>
                  <p className="mt-4 leading-relaxed text-on-surface-variant">
                    {project.description || 'This project highlights MikroLiving design thinking.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-2xl bg-surface-container-low p-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                      Location
                    </p>
                    <p className="mt-2 text-lg font-semibold text-on-surface">
                      {project.location || 'Indonesia'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                      Area
                    </p>
                    <p className="mt-2 text-lg font-semibold text-on-surface">
                      {project.area_sqm ? `${project.area_sqm} m2` : 'Custom'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                      Client
                    </p>
                    <p className="mt-2 text-lg font-semibold text-on-surface">
                      {project.client_name || 'Private Client'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                      Completed
                    </p>
                    <p className="mt-2 text-lg font-semibold text-on-surface">
                      {project.year_completed || 'In Progress'}
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </PublicPageFrame>
    )
  } catch {
    notFound()
  }
}
