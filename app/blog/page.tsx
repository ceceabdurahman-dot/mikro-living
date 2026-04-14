import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { SectionHeading } from '@/components/site/section-heading'
import { SiteShell } from '@/components/site/site-shell'
import { posts } from '@/lib/site-data'

export const metadata: Metadata = {
  title: 'Journal | MikroLiving',
  description: 'Editorial notes on compact living, warm materials, and spatial clarity.',
}

export default function BlogPage() {
  const featuredPost = posts[0]
  const secondaryPosts = posts.slice(1)

  return (
    <SiteShell>
      <main id="main-content" className="pt-20">
        <section className="px-6 py-16 sm:py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <SectionHeading
                eyebrow="Journal"
                title="Notes on compact living, warm finishes, and the details that make rooms read lighter."
                description="Short editorial pieces from the studio on layout clarity, integrated storage, and the subtle material choices that improve daily life."
              />

              <div className="rounded-[2rem] border border-outline-variant/20 bg-white/75 p-6 shadow-lg shadow-stone-900/5 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                  Editorial Focus
                </p>
                <p className="mt-4 text-sm leading-7 text-on-surface-variant sm:text-base">
                  The journal stays practical and visual. Each note is meant to sharpen how a room feels, functions, and settles into everyday use.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl border border-outline-variant/25 bg-background/70 p-4">
                    <p className="font-headline text-3xl text-primary">{posts.length}</p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.32em] text-on-surface-variant">
                      Notes live
                    </p>
                  </div>
                  <div className="rounded-3xl border border-outline-variant/25 bg-background/70 p-4">
                    <p className="font-headline text-3xl text-primary">3</p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.32em] text-on-surface-variant">
                      Themes
                    </p>
                  </div>
                  <div className="rounded-3xl border border-outline-variant/25 bg-background/70 p-4">
                    <p className="font-headline text-3xl text-primary">01</p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.32em] text-on-surface-variant">
                      Studio voice
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-14 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-white/80 shadow-2xl shadow-stone-900/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <div className="relative min-h-[340px] sm:min-h-[420px]">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 1280px) 100vw, 55vw"
                  />
                </div>
                <div className="space-y-4 p-6 sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                    Featured Note
                  </p>
                  <h2 className="text-balance font-headline text-3xl text-on-surface sm:text-4xl">
                    {featuredPost.title}
                  </h2>
                  <p className="text-xs uppercase tracking-[0.25em] text-on-surface-variant sm:text-sm">
                    {featuredPost.category}
                  </p>
                  <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base sm:leading-8">
                    {featuredPost.summary}
                  </p>
                </div>
              </Link>

              <div className="grid gap-8">
                {secondaryPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group grid overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-white/80 shadow-lg shadow-stone-900/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:grid-cols-[0.88fr_1.12fr]"
                  >
                    <div className="relative min-h-[220px]">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, 35vw"
                      />
                    </div>
                    <div className="space-y-3 p-6">
                      <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                        {post.category}
                      </p>
                      <h2 className="text-balance font-headline text-2xl text-on-surface">
                        {post.title}
                      </h2>
                      <p className="text-sm leading-7 text-on-surface-variant">{post.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
