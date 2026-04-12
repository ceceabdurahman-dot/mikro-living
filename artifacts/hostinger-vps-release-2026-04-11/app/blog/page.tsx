import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, Clock3, Sparkles } from 'lucide-react'

import PublicPageFrame from '../../components/PublicPageFrame'
import { blogApi } from '../../lib/api'

const fallbackImage =
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80'

const getReadLabel = (value?: number | string | null) => {
  const minutes = Number(value)
  return Number.isFinite(minutes) && minutes > 0 ? `${minutes} min read` : 'Quick read'
}

export default async function BlogPage() {
  let posts: any[] = []

  try {
    const response = await blogApi.getAll({ limit: 12 })
    posts = response.data
  } catch {
    posts = []
  }

  const [featuredPost, ...remainingPosts] = posts
  const sideRailPosts = remainingPosts.slice(0, 2)
  const fieldNotePosts = remainingPosts.slice(2, 5)
  const archivePosts = remainingPosts.slice(5)
  const categories = Array.from(
    new Set(
      posts
        .map((post) => String(post.category || 'Insights').trim())
        .filter(Boolean)
    )
  ).slice(0, 6)

  const totalReadMinutes = posts.reduce(
    (sum, post) => sum + (Number(post.read_time) > 0 ? Number(post.read_time) : 0),
    0
  )

  return (
    <PublicPageFrame>
      <main className="min-h-screen bg-[linear-gradient(180deg,#f4eee4_0%,#faf6f0_16%,#ffffff_42%,#fbf7f2_100%)] pb-24 pt-24">
        <section className="relative overflow-hidden border-b border-stone-200/80">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,159,91,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(120,86,0,0.09),transparent_24%)]" />

          <div className="relative mx-auto max-w-[1440px] px-6 py-12 md:px-8 lg:px-10 lg:py-16">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.28fr)_360px] lg:items-end">
              <div className="max-w-5xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/85 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.34em] text-primary shadow-sm backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  Insights Journal
                </div>

                <h1 className="mt-7 text-5xl leading-[0.9] text-stone-900 font-headline md:text-6xl xl:text-8xl">
                  Interior notes for
                  <span className="block text-primary">measured, modern living.</span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600 md:text-lg">
                  Editorial reflections from MikroLiving on compact space planning, material
                  warmth, lifestyle rhythm, and decisions that make a room feel more intentional
                  every day.
                </p>

                <div className="mt-10 grid gap-6 border-t border-stone-200/80 pt-6 sm:grid-cols-3">
                  <div>
                    <p className="text-4xl text-stone-900 font-headline">
                      {String(posts.length).padStart(2, '0')}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-500">
                      Stories
                    </p>
                  </div>
                  <div>
                    <p className="text-4xl text-stone-900 font-headline">
                      {String(categories.length).padStart(2, '0')}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-500">
                      Themes
                    </p>
                  </div>
                  <div>
                    <p className="text-4xl text-stone-900 font-headline">
                      {String(totalReadMinutes || 0).padStart(2, '0')}m
                    </p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-500">
                      Reading Time
                    </p>
                  </div>
                </div>
              </div>

              <aside className="lg:pb-1">
                <div className="border-l border-stone-200 pl-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
                    Journal Index
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {categories.length ? (
                      categories.map((category) => (
                        <span
                          key={category}
                          className="rounded-full border border-stone-200 bg-white/85 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-stone-600"
                        >
                          {category}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm leading-7 text-stone-500">
                        New journal categories will appear here as soon as posts are published.
                      </span>
                    )}
                  </div>

                  <div className="mt-8 border-t border-stone-200 pt-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-stone-400">
                      Editorial Mood
                    </p>
                    <p className="mt-3 text-base leading-8 text-stone-700">
                      Fewer trends, sharper decisions, and a calmer reading rhythm for people who
                      want spaces to feel thoughtful before they feel decorated.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-6 md:px-8 lg:px-10">
          {featuredPost ? (
            <>
              <section className="grid gap-8 py-12 xl:grid-cols-[minmax(0,1.16fr)_360px]">
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="group relative block overflow-hidden rounded-[38px] bg-stone-900 shadow-[0_44px_120px_-58px_rgba(31,20,8,0.7)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/30 to-primary/20" />
                  <div className="relative aspect-[16/12] overflow-hidden md:aspect-[16/10]">
                    <Image
                      src={featuredPost.cover_url || fallbackImage}
                      alt={featuredPost.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      sizes="(max-width: 1280px) 100vw, 66vw"
                      priority
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 bg-gradient-to-t from-black via-black/30 to-transparent px-7 pb-7 pt-24 text-white md:px-9 md:pb-9">
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
                      <span>Featured Story</span>
                      <span className="h-1 w-1 rounded-full bg-white/30" />
                      <span>{featuredPost.category || 'Insight'}</span>
                    </div>
                    <h2 className="max-w-4xl text-3xl leading-tight font-headline md:text-5xl">
                      {featuredPost.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/75">
                      <span>{featuredPost.author?.name || 'MikroLiving Studio'}</span>
                      <span className="h-1 w-1 rounded-full bg-white/30" />
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        {getReadLabel(featuredPost.read_time)}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="flex flex-col justify-between gap-8">
                  <div className="border-b border-stone-200 pb-7">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
                      Lead Story
                    </p>
                    <h2 className="mt-4 text-4xl leading-[1.02] text-stone-900 font-headline">
                      A slower, richer rhythm for design thinking.
                    </h2>
                    <p className="mt-4 text-sm leading-8 text-stone-600">
                      {featuredPost.excerpt ||
                        'A closer editorial look at the kind of design decisions that shape a home from the inside out.'}
                    </p>
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-stone-900"
                    >
                      Read featured story
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-400">
                        Editor&apos;s Shortlist
                      </p>
                      <Link
                        href="/blog"
                        className="text-xs font-semibold uppercase tracking-[0.24em] text-primary transition hover:text-stone-900"
                      >
                        Explore archive
                      </Link>
                    </div>

                    {sideRailPosts.length ? (
                      sideRailPosts.map((post, index) => (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className="group block border-t border-stone-200 pt-4 transition-transform duration-300 hover:-translate-y-1"
                        >
                          <div className="flex items-start gap-4">
                            <div className="pt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
                              {String(index + 1).padStart(2, '0')}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                                {post.category || 'Insight'}
                              </p>
                              <h3 className="mt-2 text-2xl leading-snug text-stone-900 font-headline transition-colors group-hover:text-primary">
                                {post.title}
                              </h3>
                              <p className="mt-2 line-clamp-2 text-sm leading-7 text-stone-600">
                                {post.excerpt || 'Open the next note from the MikroLiving journal.'}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="border-t border-stone-200 pt-4 text-sm leading-7 text-stone-500">
                        As more stories are published from CMS, this editorial rail will fill
                        automatically with the next strongest reads.
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {fieldNotePosts.length ? (
                <section className="border-t border-stone-200/80 py-12">
                  <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">
                        Field Notes
                      </p>
                      <h2 className="mt-3 text-3xl text-stone-900 font-headline md:text-5xl">
                        Fresh dispatches with stronger visual rhythm.
                      </h2>
                    </div>
                    <p className="max-w-md text-sm leading-7 text-stone-500">
                      The newest stories are arranged with more contrast and breathing room, so the
                      page feels editorial instead of repetitive.
                    </p>
                  </div>

                  <div className="grid gap-8 lg:grid-cols-12">
                    {fieldNotePosts.map((post, index) => {
                      const isPrimary = index === 0

                      return (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className={`group block border-t border-stone-200 pt-5 transition-transform duration-300 hover:-translate-y-1 ${
                            isPrimary ? 'lg:col-span-7' : 'lg:col-span-5'
                          }`}
                        >
                          <div
                            className={`relative overflow-hidden rounded-[28px] bg-stone-100 ${
                              isPrimary ? 'aspect-[16/10]' : 'aspect-[4/3]'
                            }`}
                          >
                            <Image
                              src={post.cover_url || fallbackImage}
                              alt={post.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                              sizes="(max-width: 1280px) 100vw, 50vw"
                            />
                          </div>

                          <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
                            <span>{post.category || 'Insight'}</span>
                            <span className="h-1 w-1 rounded-full bg-stone-300" />
                            <span>{getReadLabel(post.read_time)}</span>
                          </div>

                          <h3
                            className={`mt-3 text-stone-900 font-headline transition-colors group-hover:text-primary ${
                              isPrimary ? 'text-3xl leading-tight md:text-4xl' : 'text-2xl leading-snug'
                            }`}
                          >
                            {post.title}
                          </h3>

                          <p className="mt-3 line-clamp-3 text-sm leading-7 text-stone-600">
                            {post.excerpt ||
                              'A practical interior reflection with a calmer, more tactile design lens.'}
                          </p>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              ) : null}

              {archivePosts.length ? (
                <section className="border-t border-stone-200/80 py-12">
                  <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">
                        Archive
                      </p>
                      <h2 className="mt-3 text-3xl text-stone-900 font-headline md:text-5xl">
                        A quieter archive with a sharper scan line.
                      </h2>
                    </div>
                    <p className="max-w-md text-sm leading-7 text-stone-500">
                      The archive is intentionally leaner, so readers can skim titles, themes, and
                      reading time in one pass without the page feeling crowded.
                    </p>
                  </div>

                  <div className="divide-y divide-stone-200 border-y border-stone-200">
                    {archivePosts.map((post, index) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="grid gap-4 py-6 transition-colors duration-200 hover:bg-white/80 md:grid-cols-[96px_minmax(0,1fr)_220px]"
                      >
                        <div className="text-4xl leading-none text-stone-300 font-headline">
                          {String(index + 1).padStart(2, '0')}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
                            <span>{post.category || 'Insight'}</span>
                            <span className="h-1 w-1 rounded-full bg-stone-300" />
                            <span>{getReadLabel(post.read_time)}</span>
                          </div>
                          <h3 className="mt-3 text-2xl leading-snug text-stone-900 font-headline">
                            {post.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-7 text-stone-600">
                            {post.excerpt ||
                              'Practical reflections from the MikroLiving team on composing rooms with stronger rhythm, warmth, and usable clarity.'}
                          </p>
                        </div>

                        <div className="flex items-start justify-between gap-4 text-sm text-stone-500 md:justify-end">
                          <span>{post.author?.name || 'Studio'}</span>
                          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            <section className="py-16">
              <div className="rounded-[36px] border border-dashed border-stone-300 bg-white/80 px-8 py-20 text-center shadow-[0_30px_100px_-60px_rgba(61,39,14,0.35)] backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">
                  Empty journal
                </p>
                <h2 className="mt-5 text-4xl text-stone-900 font-headline md:text-5xl">
                  Insight baru sedang dirakit.
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-stone-600">
                  Saat tim mempublikasikan tulisan baru dari CMS, halaman ini akan terisi otomatis
                  dengan ritme editorial yang sama tanpa perlu sentuh kode lagi.
                </p>
                <Link
                  href="/"
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-900 transition hover:border-primary hover:text-primary"
                >
                  Back to homepage
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>
    </PublicPageFrame>
  )
}
