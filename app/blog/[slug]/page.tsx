import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { SiteShell } from '@/components/site/site-shell'
import { posts } from '@/lib/site-data'

type BlogPageProps = {
  params: {
    slug: string
  }
}

function getPost(slug: string) {
  return posts.find((post) => post.slug === slug)
}

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: BlogPageProps): Metadata {
  const post = getPost(params.slug)

  if (!post) {
    return {}
  }

  return {
    title: `${post.title} | MikroLiving`,
    description: post.summary,
  }
}

export default function BlogDetailPage({ params }: BlogPageProps) {
  const post = getPost(params.slug)

  if (!post) {
    notFound()
  }

  const postIndex = posts.findIndex((entry) => entry.slug === post.slug)
  const nextPost = posts[(postIndex + 1) % posts.length]
  const sectionPreviews = post.sections.map((section) => section.split('. ')[0])

  return (
    <SiteShell>
      <main id="main-content" className="pt-20">
        <article className="relative overflow-hidden px-6 pb-16 pt-8 md:px-8 md:pb-20 md:pt-10">
          <div className="absolute inset-0">
            <div className="absolute right-[-8rem] top-0 h-64 w-64 rounded-full bg-primary-fixed/50 blur-3xl" />
            <div className="absolute left-[-6rem] top-64 h-56 w-56 rounded-full bg-stone-200/80 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.35em] text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Back to journal
            </Link>

            <div className="mt-8 grid gap-10 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                  {post.category}
                </p>
                <h1 className="mt-4 max-w-4xl text-balance font-headline text-4xl leading-[0.98] text-on-surface sm:text-5xl md:text-6xl">
                  {post.title}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-on-surface-variant md:text-xl">
                  {post.summary}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[1.75rem] border border-outline-variant/20 bg-white/80 p-6 shadow-lg shadow-stone-900/5">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                    Editorial Note
                  </p>
                  <p className="mt-4 text-sm leading-7 text-on-surface-variant">
                    The journal is where the studio distills practical design thinking into short, useful reads about compact living and residential clarity.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-outline-variant/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                      Compact living
                    </span>
                    <span className="rounded-full border border-outline-variant/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                      Material warmth
                    </span>
                    <span className="rounded-full border border-outline-variant/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                      Daily function
                    </span>
                  </div>
                </div>

                <div className="rounded-[1.75rem] bg-stone-900 p-6 text-white shadow-2xl shadow-stone-900/10">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                    In This Note
                  </p>
                  <div className="mt-5 space-y-4">
                    {sectionPreviews.map((section, index) => (
                      <div key={section} className="border-t border-white/10 pt-4 first:border-t-0 first:pt-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary-fixed-dim">
                          0{index + 1}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-stone-300">{section}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-12 min-h-[320px] overflow-hidden rounded-[2rem] shadow-2xl shadow-stone-900/10 sm:min-h-[420px] md:min-h-[560px]">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>

            <div className="mt-12 grid gap-8 xl:grid-cols-[0.34fr_0.66fr]">
              <aside className="space-y-6">
                <div className="rounded-[1.75rem] border border-outline-variant/20 bg-white/80 p-6 shadow-lg shadow-stone-900/5">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                    Reading Lens
                  </p>
                  <p className="mt-4 text-sm leading-7 text-on-surface-variant">
                    The strongest small-space interiors are shaped by what disappears: clutter, friction, and unnecessary visual breaks.
                  </p>
                </div>

                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="block rounded-[1.75rem] border border-outline-variant/20 bg-background/70 p-6 transition-transform duration-200 motion-safe:hover:-translate-y-1 motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                    Next Note
                  </p>
                  <h2 className="mt-3 text-balance font-headline text-2xl text-on-surface">
                    {nextPost.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                    {nextPost.excerpt}
                  </p>
                </Link>
              </aside>

              <div className="space-y-5">
                {post.sections.map((section, index) => (
                  <section
                    key={section}
                    className="rounded-[1.75rem] border border-outline-variant/20 bg-white/80 p-6 shadow-lg shadow-stone-900/5 sm:p-8"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                      Section 0{index + 1}
                    </p>
                    <p className="mt-4 text-base leading-8 text-on-surface-variant">{section}</p>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </article>
      </main>
    </SiteShell>
  )
}
