import Image from 'next/image'
import Link from 'next/link'

import { SectionHeading } from '@/components/site/section-heading'
import { SiteShell } from '@/components/site/site-shell'
import {
  heroStats,
  keywords,
  posts,
  processSteps,
  projects,
  services,
  studioHighlights,
  testimonial,
} from '@/lib/site-data'

const heroImage =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80'

const primaryCtaClass =
  'rounded-full bg-primary px-7 py-4 text-sm font-bold uppercase tracking-[0.2em] text-on-primary shadow-lg shadow-primary/20 transition-colors hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary'

const secondaryCtaClass =
  'rounded-full border border-outline-variant/50 px-7 py-4 text-sm font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary'

export default function HomePage() {
  const featuredProject = projects[0]
  const featuredPost = posts[0]

  return (
    <SiteShell>
      <main id="main-content" className="pt-20">
        <section className="relative overflow-hidden px-6 pb-24 pt-10 md:px-8 md:pb-28">
          <div className="absolute inset-0">
            <div className="absolute right-[-12rem] top-[-4rem] h-80 w-80 rounded-full bg-primary-fixed/50 blur-3xl" />
            <div className="absolute left-[-10rem] top-56 h-64 w-64 rounded-full bg-stone-200/80 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="relative mx-auto grid min-h-[calc(100svh-7rem)] w-full max-w-7xl items-center gap-14 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary-fixed bg-primary-fixed/50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.35em] text-on-primary-fixed-variant">
                <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                Jakarta & Bandung Studio
              </p>

              <h1 className="mt-8 max-w-4xl font-headline text-5xl leading-[0.96] text-on-surface md:text-6xl xl:text-7xl">
                Designing <span className="text-primary">Smart</span>
                <br />
                Living Spaces
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-on-surface-variant md:text-xl">
                Interior architecture for apartments and residences that need clarity, warmth, and every square meter working beautifully.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/contact" className={primaryCtaClass}>
                  Book Consultation
                </Link>
                <Link href="/projects" className={secondaryCtaClass}>
                  View Portfolio
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold uppercase tracking-[0.28em] text-on-surface-variant">
                <span>Apartment Specialists</span>
                <span>Design & Build</span>
                <span>Custom Joinery</span>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-5 border-t border-outline-variant/25 pt-8">
                {heroStats.map((item) => (
                  <div key={item.label}>
                    <p className="font-headline text-3xl text-primary md:text-4xl">{item.value}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-on-surface-variant">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:col-span-6">
              <div className="hero-panel min-h-[460px] md:min-h-[620px]">
                <Image
                  src={heroImage}
                  alt="Warm modern living room with layered natural textures"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>

              <div className="absolute right-6 top-6 max-w-[15rem] rounded-[1.5rem] border border-white/50 bg-white/90 p-4 shadow-xl shadow-stone-900/10 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-on-surface-variant">
                  Signature Project
                </p>
                <p className="mt-2 font-headline text-lg text-on-surface">{featuredProject.title}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-on-surface-variant">
                  {featuredProject.location} / {featuredProject.size}
                </p>
              </div>

              <div className="absolute -bottom-8 left-6 max-w-sm rounded-[1.75rem] border border-white/70 bg-white/92 p-6 shadow-2xl shadow-stone-900/10 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
                  What defines the rooms
                </p>
                <div className="mt-4 grid gap-3 text-sm leading-7 text-on-surface-variant">
                  <p>Layout first, styling second, detail throughout.</p>
                  <p>Hidden utility, lighter sightlines, warmer material rhythm.</p>
                  <p>Made for daily living, not just presentation photos.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary px-6 py-5 text-on-primary md:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-3 text-center text-xs font-bold uppercase tracking-[0.35em] md:text-sm">
            {keywords.map((item, index) => (
              <span key={item}>
                {item}
                {index < keywords.length - 1 ? ' *' : ''}
              </span>
            ))}
          </div>
        </section>

        <section id="studio" className="scroll-mt-28 px-6 py-24 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1fr_1.2fr]">
            <SectionHeading
              eyebrow="Studio"
              title="Small footprints deserve calm, generous rooms."
              description="MikroLiving designs compact homes with the discipline of interior architecture and the softness of a lived-in residence. The goal is never to fill a room. It is to make it breathe."
            />

            <div className="space-y-8">
              <p className="text-lg leading-8 text-on-surface-variant">
                Every project starts with the same question: how should the space feel once daily life moves in? That answer shapes storage, circulation, material tone, and the level of visual quiet we keep in the room.
              </p>

              <div className="rounded-[2rem] border border-outline-variant/25 bg-white/75 p-7 shadow-lg shadow-stone-900/5">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                  Signature Language
                </p>
                <div className="mt-4 grid gap-4 text-sm leading-7 text-on-surface-variant md:grid-cols-3">
                  <p>Integrated storage that behaves like architecture, not furniture clutter.</p>
                  <p>Warm natural finishes that keep compact rooms tactile, grounded, and bright.</p>
                  <p>Composed sightlines that make each transition feel measured and calm.</p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                {studioHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-outline-variant/30 bg-white/70 p-6 shadow-lg shadow-stone-900/5"
                  >
                    <p className="font-headline text-3xl text-primary">{item.value}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-on-surface-variant">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="portfolio" className="section-divider scroll-mt-28 px-6 py-24 md:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Portfolio"
              title="Selected homes shaped around storage, flow, and warm material contrast."
              description="From compact apartments to larger family residences, each project balances architectural discipline with a quieter residential atmosphere."
            />

            <div className="mt-14 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
              <Link
                href={`/projects/${featuredProject.slug}`}
                className="group overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-white/80 shadow-2xl shadow-stone-900/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <div className="relative min-h-[380px]">
                  <Image
                    src={featuredProject.image}
                    alt={featuredProject.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 65vw"
                  />
                </div>
                <div className="space-y-4 p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                    Featured Residence
                  </p>
                  <h3 className="font-headline text-3xl text-on-surface">{featuredProject.title}</h3>
                  <p className="text-sm uppercase tracking-[0.25em] text-on-surface-variant">
                    {featuredProject.location} / {featuredProject.size} / {featuredProject.category}
                  </p>
                  <p className="max-w-2xl text-base leading-8 text-on-surface-variant">
                    {featuredProject.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {featuredProject.scope.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-outline-variant/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>

              <div className="rounded-[2rem] border border-outline-variant/20 bg-stone-900 p-8 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                  Recent Commissions
                </p>
                <div className="mt-6 space-y-6">
                  {projects.slice(1).map((project) => (
                    <Link
                      key={project.slug}
                      href={`/projects/${project.slug}`}
                      className="block border-t border-white/10 pt-6 first:border-t-0 first:pt-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-fixed-dim"
                    >
                      <h3 className="font-headline text-2xl">{project.title}</h3>
                      <p className="mt-2 text-xs uppercase tracking-[0.25em] text-stone-400">
                        {project.location} / {project.category}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-stone-300">{project.summary}</p>
                    </Link>
                  ))}
                </div>

                <Link
                  href="/projects"
                  className="mt-8 inline-flex rounded-full border border-white/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-fixed-dim"
                >
                  Open All Projects
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="section-divider scroll-mt-28 px-6 py-24 md:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Services"
              title="A service menu built around real residential constraints."
              description="Each engagement is designed to solve how the home works, how it feels, and how it will be delivered in the real world."
            />

            <div className="mt-14 divide-y divide-outline-variant/30 rounded-[2rem] border border-outline-variant/20 bg-white/70">
              {services.map((service, index) => (
                <div
                  key={service.slug}
                  className="grid gap-5 px-6 py-8 md:grid-cols-[0.18fr_0.45fr_1fr_1fr] md:px-8"
                >
                  <p className="font-headline text-2xl text-primary">{String(index + 1).padStart(2, '0')}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                    {service.title}
                  </p>
                  <p className="text-lg leading-8 text-on-surface">{service.description}</p>
                  <p className="text-sm leading-7 text-on-surface-variant">{service.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="section-divider scroll-mt-28 px-6 py-24 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <SectionHeading
              eyebrow="Process"
              title="A clear sequence, so the project feels composed long before styling arrives."
              description="We keep the path deliberate: understand the life inside the home, shape the plan, refine the material logic, then deliver with control."
            />

            <div className="space-y-6">
              {processSteps.map((item) => (
                <div
                  key={item.step}
                  className="rounded-[1.75rem] border border-outline-variant/25 bg-white/80 p-6 shadow-lg shadow-stone-900/5"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                    Step {item.step}
                  </p>
                  <h3 className="mt-3 font-headline text-2xl text-on-surface">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="insights" className="section-divider scroll-mt-28 px-6 py-24 md:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Insights"
              title="Practical editorial notes for living better in smaller, more intentional rooms."
              description="The journal focuses on layout clarity, custom storage, material choices, and the subtle decisions that make compact interiors feel generous."
            />

            <div className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-white/80 shadow-xl shadow-stone-900/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <div className="relative min-h-[320px]">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                    {featuredPost.category}
                  </p>
                  <h3 className="mt-3 font-headline text-3xl text-on-surface">{featuredPost.title}</h3>
                  <p className="mt-4 text-base leading-8 text-on-surface-variant">{featuredPost.summary}</p>
                </div>
              </Link>

              {posts.slice(1).map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="rounded-[2rem] border border-outline-variant/20 bg-white/80 p-6 shadow-lg shadow-stone-900/5 transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                    {post.category}
                  </p>
                  <h3 className="mt-4 font-headline text-2xl text-on-surface">{post.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-on-surface-variant">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24 md:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] bg-stone-900 px-8 py-16 text-white md:px-16">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
              Ready to Transform?
            </p>
            <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <h2 className="font-headline text-4xl leading-tight md:text-6xl">
                  Let&apos;s shape a home that works as beautifully as it looks.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300 md:text-lg">
                  Bring the floor plan, the timeline, and the way you want the rooms to feel. We&apos;ll translate them into a calmer spatial system.
                </p>
              </div>

              <div className="space-y-6">
                <blockquote className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-stone-200">
                  &quot;{testimonial.content}&quot;
                  <footer className="mt-4 text-xs uppercase tracking-[0.25em] text-stone-400">
                    {testimonial.name} / {testimonial.title}
                  </footer>
                </blockquote>

                <div className="flex flex-wrap gap-4">
                  <Link href="/contact" className={primaryCtaClass}>
                    Start Consultation
                  </Link>
                  <Link
                    href="/projects"
                    className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-fixed-dim"
                  >
                    Browse Portfolio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
