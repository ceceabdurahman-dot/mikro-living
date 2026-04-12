import Link from 'next/link'
import Image from 'next/image'
import { blogApi } from '../../lib/api'

const fallbackImage =
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'

export default async function BlogPage() {
  let posts: any[] = []

  try {
    const response = await blogApi.getAll({ limit: 12 })
    posts = response.data
  } catch {
    posts = []
  }

  return (
    <main className="min-h-screen bg-background px-6 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Journal
          </span>
          <h1 className="mt-3 text-4xl font-headline md:text-5xl">Latest Insights</h1>
          <p className="mt-4 leading-relaxed text-on-surface-variant">
            Practical notes on compact living, interior materials, and thoughtful spaces.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {posts.length ? (
            posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-2xl bg-surface-container-low shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={post.cover_url || fallbackImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-2 text-xs uppercase tracking-widest text-primary">
                    {post.category}
                  </div>
                  <h2 className="text-2xl font-headline text-on-surface">{post.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
                    {post.excerpt || 'Read the latest note from MikroLiving.'}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="md:col-span-2 xl:col-span-3">
              <div className="rounded-[32px] border border-dashed border-stone-300 bg-surface-container-low px-8 py-16 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  Empty journal
                </p>
                <h2 className="mt-4 text-3xl font-headline text-on-surface">
                  Insight baru sedang dirakit.
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant">
                  Artikel belum tersedia sekarang, tetapi halaman ini akan terisi otomatis saat tim
                  mempublikasikan tulisan baru dari CMS.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
