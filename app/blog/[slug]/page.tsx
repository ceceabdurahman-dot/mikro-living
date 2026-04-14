import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPostBySlug, getPosts } from '@/lib/api'
import { SiteShell } from '@/components/site/site-shell'

type BlogPageProps = {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return {}
  }

  return {
    title: `${post.title} | MikroLiving`,
    description: post.summary,
  }
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const [posts, post] = await Promise.all([
    getPosts(),
    getPostBySlug(params.slug),
  ])

  if (!post) {
    notFound()
  }

  const postIndex = posts.findIndex((entry) => entry.slug === post.slug)
  const nextPost = posts[(postIndex + 1) % posts.length]

  return (
    <SiteShell>
      <main id="main-content">
        <section className="relative isolate overflow-hidden bg-stone-950 text-white">
          <div className="absolute inset-0">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(108deg,rgba(20,18,14,0.9)_0%,rgba(20,18,14,0.78)_34%,rgba(20,18,14,0.28)_68%,rgba(20,18,14,0.34)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(247,189,72,0.2),transparent_24%),radial-gradient(circle_at_84%_20%,rgba(255,255,255,0.08),transparent_20%)]" />
          </div>

          <div className="relative z-10 flex min-h-[82svh] items-end px-6 pb-12 pt-28 md:px-8 md:pb-16">
            <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.84fr_0.16fr] lg:items-end">
              <div>
                <Link
                  href="/blog"
                  className="inline-flex text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-fixed-dim"
                >
                  Back to journal
                </Link>

                <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                  {post.category}
                </p>
                <h1 className="mt-4 max-w-5xl text-balance font-headline text-5xl leading-[0.94] text-white sm:text-6xl md:text-7xl">
                  {post.title}
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8 text-white/72 md:text-lg">
                  {post.summary}
                </p>
              </div>

              <div className="hidden lg:block">
                <p className="border-t border-white/15 pt-5 text-sm leading-7 text-white/60">
                  A studio note on spatial clarity, warmth, and the subtle design decisions that make compact rooms feel more generous.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.34fr_0.66fr]">
            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[1.75rem] bg-stone-950 p-6 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                  In this note
                </p>
                <div className="mt-5 space-y-4">
                  {post.sections.map((section, index) => (
                    <div key={section} className="border-t border-white/10 pt-4 first:border-t-0 first:pt-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary-fixed-dim">
                        0{index + 1}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-stone-300">
                        {section.split('. ')[0]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-outline-variant/20 bg-white/80 p-6 shadow-lg shadow-stone-900/5">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                  Reading lens
                </p>
                <p className="mt-4 text-sm leading-7 text-on-surface-variant">
                  The point is not to add more to a room. It is to remove friction until the space feels calmer, clearer, and easier to inhabit.
                </p>
              </div>
            </aside>

            <div className="space-y-6">
              {post.sections.map((section, index) => (
                <section
                  key={section}
                  className={`rounded-[2rem] border border-outline-variant/20 bg-white/80 p-6 shadow-lg shadow-stone-900/5 sm:p-8 ${
                    index % 2 === 1 ? 'md:translate-x-8' : ''
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                    Section 0{index + 1}
                  </p>
                  <p className="mt-4 text-base leading-8 text-on-surface-variant">{section}</p>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-stone-950 px-6 py-20 text-white md:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                Next note
              </p>
              <h2 className="mt-4 max-w-2xl text-balance font-headline text-4xl leading-[1.02] text-white sm:text-5xl">
                Keep moving through the editorial sequence.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-stone-400">
                Each note sharpens a different design instinct, from layout logic and material warmth to the subtler ways rooms can feel lighter.
              </p>
            </div>

            <Link
              href={`/blog/${nextPost.slug}`}
              className="editorial-frame group relative block min-h-[340px] overflow-hidden"
            >
              <Image
                src={nextPost.image}
                alt={nextPost.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                sizes="(max-width: 1024px) 100vw, 46vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                  {nextPost.category}
                </p>
                <h3 className="mt-3 text-balance font-headline text-4xl leading-none">
                  {nextPost.title}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-7 text-white/70">
                  {nextPost.excerpt}
                </p>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
