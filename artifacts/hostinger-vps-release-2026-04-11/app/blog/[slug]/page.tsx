import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Clock3, Sparkles } from 'lucide-react'

import PublicPageFrame from '../../../components/PublicPageFrame'
import { blogApi } from '../../../lib/api'
import { sanitizeRichText } from '../../../lib/sanitizeHtml'

const fallbackImage =
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80'

const formatPublishedDate = (value?: string | null) => {
  if (!value) return 'Editorial note'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Editorial note'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsed)
}

export default async function BlogDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  try {
    const [postResponse, listResponse] = await Promise.all([
      blogApi.getOne(params.slug),
      blogApi.getAll({ limit: 4 }),
    ])

    const post = postResponse.data
    const sanitizedContent = sanitizeRichText(post.content)
    const publishedDate = formatPublishedDate(post.published_at || post.created_at)
    const tags = Array.isArray(post.tags) ? post.tags.filter(Boolean) : []
    const relatedPosts = (listResponse.data || [])
      .filter((item: any) => item.slug !== post.slug)
      .slice(0, 3)

    return (
      <PublicPageFrame>
        <main className="min-h-screen bg-[linear-gradient(180deg,#f6f1e8_0%,#fbf8f3_16%,#ffffff_42%,#fbf8f3_100%)] px-6 pb-24 pt-28 md:px-8">
          <article className="mx-auto max-w-7xl">
            <div className="border-b border-stone-200/80 pb-10">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-stone-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Insights
              </Link>

              <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_320px] lg:items-end">
                <div className="max-w-4xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-primary shadow-sm backdrop-blur">
                    <Sparkles className="h-3.5 w-3.5" />
                    {post.category || 'Insight'}
                  </div>
                  <h1 className="mt-6 max-w-5xl text-5xl leading-[0.95] text-stone-900 font-headline md:text-6xl xl:text-7xl">
                    {post.title}
                  </h1>
                  <p className="mt-6 max-w-3xl text-base leading-8 text-stone-600 md:text-lg">
                    {post.excerpt || 'An interior insight from the MikroLiving studio.'}
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_-48px_rgba(61,39,14,0.35)] backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">
                    Article Details
                  </p>

                  <div className="mt-5 space-y-5">
                    <div className="flex items-center gap-3">
                      {post.author?.avatar_url ? (
                        <Image
                          src={post.author.avatar_url}
                          alt={post.author?.name || 'Author avatar'}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                          ML
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-stone-900">
                          {post.author?.name || 'MikroLiving Studio'}
                        </p>
                        <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
                          Editorial Team
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-stone-200 pt-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
                          Published
                        </p>
                        <p className="mt-2 text-sm font-medium text-stone-800">{publishedDate}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
                          Reading Time
                        </p>
                        <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-stone-800">
                          <Clock3 className="h-4 w-4 text-primary" />
                          {post.read_time ? `${post.read_time} min read` : 'Quick read'}
                        </p>
                      </div>
                    </div>

                    {tags.length ? (
                      <div className="border-t border-stone-200 pt-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
                          Tags
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-stone-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-10 overflow-hidden rounded-[36px] bg-stone-900 shadow-[0_40px_120px_-56px_rgba(31,20,8,0.7)]">
              <div className="absolute inset-0 bg-gradient-to-tr from-stone-950 via-stone-900/40 to-primary/20" />
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={post.cover_url || fallbackImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              </div>
            </div>

            <section className="grid gap-12 border-b border-stone-200/80 py-14 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div
                className="article-rich-content prose prose-stone max-w-none prose-headings:font-headline prose-headings:text-stone-900 prose-h2:mt-14 prose-h2:text-4xl prose-h2:leading-tight prose-h3:mt-10 prose-h3:text-2xl prose-h3:leading-snug prose-p:my-6 prose-p:text-[17px] prose-p:leading-8 prose-p:text-stone-700 prose-a:text-primary prose-a:no-underline hover:prose-a:text-stone-900 prose-strong:text-stone-900 prose-em:text-stone-800 prose-u:decoration-primary prose-u:underline-offset-4 prose-s:text-stone-500 prose-blockquote:border-l-primary prose-blockquote:bg-stone-50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:font-headline prose-blockquote:text-xl prose-blockquote:text-stone-800 prose-ol:my-8 prose-ol:list-decimal prose-ol:pl-6 prose-ul:my-8 prose-ul:list-disc prose-ul:pl-6 prose-li:my-1 prose-li:pl-1 prose-li:text-stone-700 prose-li:marker:text-primary prose-img:rounded-[28px]"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />

              <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
                <div className="rounded-[28px] border border-stone-200 bg-white/85 p-6 shadow-[0_24px_80px_-52px_rgba(61,39,14,0.3)] backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
                    Reading Cue
                  </p>
                  <h2 className="mt-4 text-2xl leading-snug text-stone-900 font-headline">
                    Simpan insight ini sebagai referensi untuk ruang berikutnya.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-stone-600">
                    Artikel ini cocok dijadikan acuan awal sebelum diskusi mood, material, dan
                    kebutuhan ruang bersama tim MikroLiving.
                  </p>
                  <Link
                    href="/"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-stone-900"
                  >
                    Mulai konsultasi
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="rounded-[28px] border border-stone-200 bg-stone-900 p-6 text-white shadow-[0_24px_80px_-52px_rgba(31,20,8,0.6)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
                    Next Step
                  </p>
                  <h2 className="mt-4 text-2xl leading-snug font-headline">
                    Jelajahi project yang sudah mewujudkan prinsip serupa.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-white/70">
                    Lihat bagaimana ide di artikel ini diterjemahkan menjadi ruang yang lebih nyata,
                    tenang, dan presisi.
                  </p>
                  <Link
                    href="/projects"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-fixed-dim transition hover:text-white"
                  >
                    View portfolio
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </aside>
            </section>

            {relatedPosts.length ? (
              <section className="py-14">
                <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">
                      Related Stories
                    </p>
                    <h2 className="mt-3 text-3xl text-stone-900 font-headline md:text-4xl">
                      Continue reading with a calmer rhythm.
                    </h2>
                  </div>
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900 transition hover:text-primary"
                  >
                    View all insights
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {relatedPosts.map((relatedPost: any) => (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="group border-t border-stone-200 pt-5 transition-transform duration-300 hover:-translate-y-1"
                    >
                      <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-[24px] bg-stone-100">
                        <Image
                          src={relatedPost.cover_url || fallbackImage}
                          alt={relatedPost.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                          sizes="(max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">
                        <span>{relatedPost.category || 'Insight'}</span>
                        <span>
                          {relatedPost.read_time ? `${relatedPost.read_time} min` : 'Quick read'}
                        </span>
                      </div>
                      <h3 className="mt-3 text-2xl leading-snug text-stone-900 font-headline">
                        {relatedPost.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-stone-600">
                        {relatedPost.excerpt ||
                          'Read another measured note from the MikroLiving studio journal.'}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </article>
        </main>
      </PublicPageFrame>
    )
  } catch {
    notFound()
  }
}
