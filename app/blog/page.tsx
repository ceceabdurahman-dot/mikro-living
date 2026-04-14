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
  return (
    <SiteShell>
      <main className="pt-24">
        <section className="px-6 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Journal"
              title="A simple editorial layer rebuilt from the surviving routes in the snapshot."
              description="The old HTML clearly pointed to insight pages, so this reconstruction restores that reading path with a static list and individual article routes."
            />

            <div className="mt-14 grid gap-8 xl:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-white/80 shadow-lg shadow-stone-900/5"
                >
                  <div className="relative min-h-[240px]">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 1280px) 100vw, 33vw"
                    />
                  </div>
                  <div className="space-y-3 p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                      {post.category}
                    </p>
                    <h2 className="font-headline text-2xl text-on-surface">{post.title}</h2>
                    <p className="text-sm leading-7 text-on-surface-variant">{post.excerpt}</p>
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
