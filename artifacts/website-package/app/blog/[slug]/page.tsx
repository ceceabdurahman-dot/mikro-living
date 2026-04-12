import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { blogApi } from '../../../lib/api'

const fallbackImage =
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80'

export default async function BlogDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  try {
    const response = await blogApi.getOne(params.slug)
    const post = response.data

    return (
      <main className="min-h-screen bg-background px-6 py-20 md:px-8">
        <article className="mx-auto max-w-4xl">
          <Link href="/blog" className="text-sm font-semibold text-primary hover:underline">
            Back to Blog
          </Link>

          <header className="mt-8">
            <div className="text-xs font-bold uppercase tracking-widest text-primary">
              {post.category}
            </div>
            <h1 className="mt-3 text-4xl font-headline text-on-surface md:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 leading-relaxed text-on-surface-variant">
              {post.excerpt || 'An interior insight from the MikroLiving studio.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-on-surface-variant">
              <span>{post.author?.name || 'MikroLiving Studio'}</span>
              <span>/</span>
              <span>{post.read_time ? `${post.read_time} min read` : 'Quick read'}</span>
            </div>
          </header>

          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl">
            <Image
              src={post.cover_url || fallbackImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>

          <div
            className="prose prose-stone mt-10 max-w-none prose-headings:font-headline"
            dangerouslySetInnerHTML={{ __html: post.content || '<p>No content available.</p>' }}
          />
        </article>
      </main>
    )
  } catch {
    notFound()
  }
}
