import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { getPosts } from '@/lib/api'
import { SiteShell } from '@/components/site/site-shell'

export const metadata: Metadata = {
  title: 'Journal | MikroLiving',
  description: 'Editorial notes on compact living, warm materials, and spatial clarity.',
}

export default async function BlogPage() {
  const posts = await getPosts()
  const featuredPost = posts[0]
  const secondaryPosts = posts.slice(1)

  return (
    <SiteShell>
      <main id="main-content">
        <section className="relative isolate overflow-hidden bg-stone-950 px-6 pb-16 pt-28 text-white md:px-8 md:pb-20">
          <div className="absolute inset-0">
            <div className="absolute left-[-8rem] top-12 h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
            <div className="absolute right-[-10rem] top-32 h-80 w-80 rounded-full bg-primary-fixed/10 blur-3xl" />
            <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-stone-950 to-transparent" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                  Journal
                </p>
                <h1 className="mt-4 max-w-4xl text-balance font-headline text-5xl leading-[0.94] text-white sm:text-6xl md:text-7xl">
                  Notes on warmer materials, lighter rooms, and sharper daily living.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-stone-400 md:text-lg">
                  The journal extends the design language of the studio into short editorial observations about compact spaces, calmer atmospheres, and the decisions that make rooms feel more resolved.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <p className="font-headline text-4xl text-primary-fixed-dim">{posts.length}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.35em] text-stone-500">
                    Notes live
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <p className="font-headline text-4xl text-primary-fixed-dim">3</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.35em] text-stone-500">
                    Themes
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <p className="font-headline text-4xl text-primary-fixed-dim">01</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.35em] text-stone-500">
                    Studio voice
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="space-y-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                  Featured Note
                </p>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="editorial-frame group relative block min-h-[560px] overflow-hidden"
                >
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    sizes="(max-width: 1024px) 100vw, 54vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/15 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white sm:p-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                      {featuredPost.category}
                    </p>
                    <h2 className="mt-3 max-w-lg text-balance font-headline text-4xl leading-none sm:text-5xl">
                      {featuredPost.title}
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                      {featuredPost.summary}
                    </p>
                  </div>
                </Link>
              </div>

              <div className="pt-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                  Editorial Sequence
                </p>
                <div className="mt-6 divide-y divide-outline-variant/20">
                  {posts.map((post, index) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className={`group grid gap-4 py-6 sm:grid-cols-[0.16fr_1fr] ${
                        index % 2 === 1 ? 'lg:translate-x-10' : ''
                      }`}
                    >
                      <p className="font-headline text-4xl leading-none text-primary/75">
                        {String(index + 1).padStart(2, '0')}
                      </p>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-on-surface-variant">
                          {post.category}
                        </p>
                        <h3 className="mt-3 text-balance font-headline text-3xl text-on-surface transition-colors group-hover:text-primary">
                          {post.title}
                        </h3>
                        <p className="mt-3 max-w-lg text-sm leading-7 text-on-surface-variant">
                          {post.excerpt}
                        </p>
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
                Editorial Themes
              </p>
              <h2 className="mt-4 max-w-2xl text-balance font-headline text-4xl leading-[1.02] text-white sm:text-5xl">
                Compact living, material warmth, and better room hierarchy.
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {secondaryPosts.map((post) => (
                <div
                  key={post.slug}
                  className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                    {post.category}
                  </p>
                  <p className="mt-3 font-headline text-2xl text-white">{post.title}</p>
                  <p className="mt-3 text-sm leading-7 text-stone-400">{post.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
