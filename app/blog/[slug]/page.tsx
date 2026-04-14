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

  return (
    <SiteShell>
      <main className="pt-24">
        <article className="px-6 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/blog"
              className="text-xs font-bold uppercase tracking-[0.35em] text-primary"
            >
              Back to journal
            </Link>

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-primary">
              {post.category}
            </p>
            <h1 className="mt-4 font-headline text-4xl leading-tight text-on-surface md:text-6xl">
              {post.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-on-surface-variant">{post.summary}</p>

            <div className="relative mt-12 min-h-[320px] overflow-hidden rounded-[2rem] shadow-2xl shadow-stone-900/10 md:min-h-[520px]">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>

            <div className="mt-12 space-y-8 rounded-[2rem] border border-outline-variant/20 bg-white/80 p-8 shadow-lg shadow-stone-900/5">
              {post.sections.map((section) => (
                <p key={section} className="text-base leading-8 text-on-surface-variant">
                  {section}
                </p>
              ))}
            </div>
          </div>
        </article>
      </main>
    </SiteShell>
  )
}
