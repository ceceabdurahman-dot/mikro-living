import Image from 'next/image'
import Link from 'next/link'

import {
  getFeaturedTestimonial,
  getPosts,
  getProjects,
  getPublicSiteSettings,
  getServices,
  getTeamMembers,
  orderProjectsForShowcase,
} from '@/lib/api'
import { SectionHeading } from '@/components/site/section-heading'
import { SiteShell } from '@/components/site/site-shell'
import {
  heroStats,
  keywords,
  processSteps,
  studioHighlights,
} from '@/lib/site-data'

const heroImage =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80'

const primaryCtaClass =
  'inline-flex w-full items-center justify-center rounded-full bg-primary px-7 py-4 text-sm font-bold uppercase tracking-[0.2em] text-on-primary shadow-lg shadow-primary/20 transition-[background-color,transform] duration-200 hover:bg-primary-container motion-safe:hover:-translate-y-1 motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:w-auto'

const secondaryCtaClass =
  'inline-flex w-full items-center justify-center rounded-full border border-white/25 px-7 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition-[background-color,transform,border-color] duration-200 hover:border-white/40 hover:bg-white/10 motion-safe:hover:-translate-y-1 motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-fixed-dim sm:w-auto'

const lightSecondaryCtaClass =
  'inline-flex w-full items-center justify-center rounded-full border border-outline-variant/40 px-7 py-4 text-sm font-bold uppercase tracking-[0.2em] text-on-surface transition-[background-color,transform,border-color] duration-200 hover:border-outline-variant/70 hover:bg-white motion-safe:hover:-translate-y-1 motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:w-auto'

export default async function HomePage() {
  const [projects, posts, services, featuredTestimonial, publicSiteSettings, teamMembers] = await Promise.all([
    getProjects(),
    getPosts(),
    getServices(),
    getFeaturedTestimonial(),
    getPublicSiteSettings(),
    getTeamMembers(),
  ])

  const showcaseProjects = orderProjectsForShowcase(projects)
  const featuredProject = showcaseProjects[0]
  const secondaryProject = showcaseProjects[1] || featuredProject
  const supportingProjects = showcaseProjects
  const featuredPost = posts[0]
  const supportingPosts = posts.slice(1)
  const featuredTeamMembers = teamMembers.slice(0, 3)
  const marqueeKeywords = [...keywords, ...keywords]
  const displayHeroStats = [
    { ...heroStats[0], value: publicSiteSettings.statProjects || heroStats[0].value },
    ...heroStats.slice(1),
  ]

  return (
    <SiteShell>
      <main id="main-content">
        <section className="relative isolate overflow-hidden border-b border-white/10 bg-stone-950 text-white">
          <div className="absolute inset-0">
            <Image
              src={heroImage}
              alt="Warm contemporary interior with soft lighting and layered natural textures"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(108deg,rgba(20,18,14,0.88)_0%,rgba(20,18,14,0.72)_34%,rgba(20,18,14,0.18)_66%,rgba(20,18,14,0.32)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(247,189,72,0.22),transparent_28%),radial-gradient(circle_at_80%_24%,rgba(255,255,255,0.12),transparent_22%),radial-gradient(circle_at_60%_82%,rgba(247,189,72,0.14),transparent_22%)]" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-stone-950/65 to-transparent" />
          </div>

          <div className="relative z-10 flex min-h-[100svh] items-end px-6 pb-10 pt-28 md:px-8 md:pb-16">
            <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.82fr_0.18fr] lg:items-end">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim sm:text-xs">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary-fixed-dim" />
                  MikroLiving Interior Studio
                </p>

                <h1 className="mt-8 max-w-4xl text-balance font-headline text-5xl leading-[0.92] text-white sm:text-6xl md:text-7xl xl:text-[7.5rem]">
                  Dynamic homes,
                  <br />
                  calm interiors,
                  <br />
                  smarter living.
                </h1>

                <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8 md:text-xl">
                  Interior architecture for apartments and residences that need stronger flow, warmer material contrast, and every square meter working beautifully.
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  <Link href="/contact" className={primaryCtaClass}>
                    Book Consultation
                  </Link>
                  <Link href="/projects" className={secondaryCtaClass}>
                    View Portfolio
                  </Link>
                </div>
              </div>

              <div className="hidden lg:flex lg:flex-col lg:items-end lg:gap-8">
                <p className="text-right text-[10px] font-bold uppercase tracking-[0.35em] text-white/45">
                  {featuredProject.location} / {featuredProject.size} / {featuredProject.year}
                </p>

                <div className="max-w-[15rem] border-t border-white/15 pt-5 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                    Signature Residence
                  </p>
                  <p className="mt-3 font-headline text-3xl leading-none text-white">
                    {featuredProject.title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    Warm, highly organized rooms shaped around movement, light, and quieter daily rituals.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 bg-stone-950/35 backdrop-blur-sm">
            <div className="mx-auto grid max-w-7xl gap-4 px-6 py-5 sm:grid-cols-3 md:px-8">
              {displayHeroStats.map((item) => (
                <div key={item.label} className="flex items-end justify-between gap-4 border-b border-white/10 pb-4 sm:block sm:border-b-0 sm:pb-0">
                  <p className="font-headline text-4xl text-primary-fixed-dim">{item.value}</p>
                  <p className="text-right text-[10px] uppercase tracking-[0.3em] text-white/55 sm:mt-2 sm:text-left">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-b border-outline-variant/20 bg-stone-950 text-white">
          <div className="marquee-track py-4">
            {marqueeKeywords.map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="px-5 text-[11px] font-bold uppercase tracking-[0.38em] text-white/70"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section id="studio" className="scroll-mt-28 px-6 py-24 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr]">
              <div className="space-y-8">
                <SectionHeading
                  eyebrow="Studio"
                  title="An editorial interior language built for movement, warmth, and visual quiet."
                  description="MikroLiving treats compact living like spatial choreography. The work is not about filling rooms. It is about editing them until the home feels sharper, lighter, and easier to inhabit."
                />

                <div className="space-y-4 border-t border-outline-variant/20 pt-6">
                  {studioHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-end justify-between gap-5 border-b border-outline-variant/20 pb-4"
                    >
                      <p className="font-headline text-5xl text-primary">{item.value}</p>
                      <p className="text-right text-[10px] font-bold uppercase tracking-[0.35em] text-on-surface-variant">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="editorial-frame relative min-h-[460px] overflow-hidden">
                  <Image
                    src={secondaryProject.image}
                    alt={secondaryProject.title}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-[1.04]"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                      Recent Residence
                    </p>
                    <p className="mt-3 max-w-sm font-headline text-4xl leading-none">
                      {secondaryProject.title}
                    </p>
                    <p className="mt-3 text-sm uppercase tracking-[0.25em] text-white/60">
                      {secondaryProject.location} / {secondaryProject.size}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                      Spatial Approach
                    </p>
                    <p className="mt-4 text-lg leading-8 text-on-surface">
                      Every project begins with circulation, not decoration. Storage, light, and proportion are set first so the mood feels effortless once material and styling arrive.
                    </p>
                  </div>

                  <div className="space-y-5 border-l border-outline-variant/30 pl-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                        01 / Integrated utility
                      </p>
                      <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                        Storage behaves like architecture, not clutter that gets added after the fact.
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                        02 / Warm restraint
                      </p>
                      <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                        Natural materials, lower contrast palettes, and clear edges keep the room settled.
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                        03 / Lived-in precision
                      </p>
                      <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                        The visual result stays calm because the planning work happens below the surface.
                      </p>
                    </div>
                  </div>

                  <Link href="/contact" className={lightSecondaryCtaClass}>
                    Discuss a Project
                  </Link>
                </div>
              </div>
            </div>

            {featuredTeamMembers.length > 0 ? (
              <div className="mt-16 grid gap-6 border-t border-outline-variant/20 pt-10 lg:grid-cols-[0.3fr_0.7fr]">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                    Team
                  </p>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-on-surface-variant">
                    This section now reads from the team endpoint when those records are available,
                    so the studio story can stay aligned with the people behind the work.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {featuredTeamMembers.map((member, index) => (
                    <article
                      key={member.id}
                      className={`overflow-hidden rounded-[1.75rem] border border-outline-variant/20 bg-white shadow-lg shadow-stone-900/5 ${
                        index === 1 ? 'md:-translate-y-4' : ''
                      }`}
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 22vw"
                        />
                      </div>
                      <div className="space-y-3 p-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                          {member.role}
                        </p>
                        <h3 className="font-headline text-3xl text-on-surface">{member.name}</h3>
                        {member.bio ? (
                          <p className="text-sm leading-7 text-on-surface-variant">{member.bio}</p>
                        ) : (
                          <p className="text-sm leading-7 text-on-surface-variant">
                            Studio profile synced from the team roster.
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section id="portfolio" className="section-divider scroll-mt-28 px-6 py-24 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-10">
                <SectionHeading
                  eyebrow="Portfolio"
                  title="Projects arranged like a sequence, not a catalog."
                  description="The portfolio balances one strong visual anchor with a sharper reading rhythm, so each commission feels distinct while still belonging to the same studio language."
                />

                <Link
                  href={`/projects/${featuredProject.slug}`}
                  className="editorial-frame group relative block min-h-[560px] overflow-hidden"
                >
                  <Image
                    src={featuredProject.image}
                    alt={featuredProject.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/12 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white sm:p-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                      Featured Residence
                    </p>
                    <h2 className="mt-3 max-w-lg text-balance font-headline text-4xl leading-none sm:text-5xl">
                      {featuredProject.title}
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                      {featuredProject.description}
                    </p>
                  </div>
                </Link>
              </div>

              <div className="pt-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                  Selected Commissions
                </p>
                <div className="mt-6 divide-y divide-outline-variant/20">
                  {supportingProjects.map((project, index) => (
                    <Link
                      key={project.slug}
                      href={`/projects/${project.slug}`}
                      className="group grid gap-4 py-6 sm:grid-cols-[0.18fr_1fr]"
                    >
                      <p className="font-headline text-4xl leading-none text-primary/75">
                        {String(index + 1).padStart(2, '0')}
                      </p>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-on-surface-variant">
                          {project.location} / {project.category}
                        </p>
                        <h3 className="mt-3 text-balance font-headline text-3xl text-on-surface transition-colors group-hover:text-primary">
                          {project.title}
                        </h3>
                        <p className="mt-3 max-w-lg text-sm leading-7 text-on-surface-variant">
                          {project.summary}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                <Link href="/projects" className="mt-8 inline-flex text-xs font-bold uppercase tracking-[0.35em] text-primary">
                  Open Full Portfolio
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="relative isolate overflow-hidden bg-stone-950 px-6 py-24 text-white md:px-8">
          <div className="absolute inset-0">
            <div className="absolute left-[-6rem] top-12 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute right-[-10rem] bottom-0 h-96 w-96 rounded-full bg-primary-fixed/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
              Services
            </p>
            <h2 className="mt-4 max-w-4xl text-balance font-headline text-4xl leading-[1.02] text-white sm:text-5xl md:text-6xl">
              A modern residential service model, shaped around planning, atmosphere, and delivery.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-stone-400 md:text-lg">
              Instead of generic packages, the studio works through a sequence of decisions that make the home feel resolved at both the architectural and lived-in level.
            </p>

            <div className="mt-14 divide-y divide-white/10">
              {services.map((service, index) => (
                <div
                  key={service.slug}
                  className={`grid gap-6 py-8 lg:grid-cols-[0.15fr_0.38fr_0.47fr] ${
                    index % 2 === 1 ? 'lg:translate-x-14' : ''
                  }`}
                >
                  <p className="font-headline text-4xl leading-none text-primary-fixed-dim">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/65">
                    {service.title}
                  </p>
                  <div>
                    <p className="text-xl leading-8 text-white">{service.description}</p>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-stone-400">
                      {service.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="scroll-mt-28 px-6 py-24 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr]">
              <SectionHeading
                eyebrow="Process"
                title="A project rhythm that feels controlled from first brief to final styling."
                description="The sequence is designed to keep the work deliberate. Each step sharpens the next one, so the built result feels calm because the process behind it was clear."
              />

              <div className="relative pl-4 sm:pl-6">
                <div className="absolute left-0 top-2 bottom-2 w-px bg-outline-variant/30" />
                <div className="space-y-8">
                  {processSteps.map((item, index) => (
                    <div
                      key={item.step}
                      className={`relative pl-10 ${index % 2 === 1 ? 'md:translate-x-12' : ''}`}
                    >
                      <span className="absolute left-[-1rem] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[10px] font-bold uppercase tracking-[0.25em] text-on-primary">
                        {item.step}
                      </span>
                      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                        Stage {item.step}
                      </p>
                      <h3 className="mt-3 text-balance font-headline text-3xl text-on-surface">
                        {item.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-sm leading-7 text-on-surface-variant">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="insights" className="section-divider scroll-mt-28 px-6 py-24 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-10">
                <SectionHeading
                  eyebrow="Insights"
                  title="Editorial notes that keep compact interiors from feeling obvious."
                  description="The journal reads like an extension of the design process: short observations on room hierarchy, material warmth, and the choices that make homes feel more generous."
                />

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="editorial-frame group relative block min-h-[460px] overflow-hidden"
                >
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    sizes="(max-width: 1024px) 100vw, 45vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/18 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white sm:p-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                      {featuredPost.category}
                    </p>
                    <h3 className="mt-3 max-w-lg text-balance font-headline text-4xl leading-none">
                      {featuredPost.title}
                    </h3>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">
                      {featuredPost.summary}
                    </p>
                  </div>
                </Link>
              </div>

              <div className="space-y-8 lg:pt-20">
                {supportingPosts.map((post, index) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className={`group grid gap-5 border-t border-outline-variant/20 pt-8 ${
                      index === 0 ? 'lg:translate-x-10' : ''
                    } sm:grid-cols-[0.88fr_1.12fr]`}
                  >
                    <div className="relative min-h-[220px] overflow-hidden rounded-[1.75rem]">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                        sizes="(max-width: 640px) 100vw, 28vw"
                      />
                    </div>
                    <div className="self-center">
                      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                        {post.category}
                      </p>
                      <h3 className="mt-3 text-balance font-headline text-3xl text-on-surface transition-colors group-hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}

                <Link href="/blog" className="inline-flex text-xs font-bold uppercase tracking-[0.35em] text-primary">
                  Open the Journal
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-[2.75rem] bg-stone-950 px-6 py-10 text-white sm:px-8 md:px-12 md:py-14">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(247,189,72,0.18),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.08),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.02),transparent_55%)]" />
              <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                    Final CTA
                  </p>
                  <h2 className="mt-4 max-w-3xl text-balance font-headline text-4xl leading-[1.02] text-white sm:text-5xl md:text-6xl">
                    Let&apos;s build a home with better flow, calmer energy, and details that age well.
                  </h2>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-stone-400 md:text-lg">
                    Bring the floor plan, the timeline, and the rooms that do not feel quite right yet. We&apos;ll turn them into a more precise living system.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link href="/contact" className={primaryCtaClass}>
                      Start Consultation
                    </Link>
                    <Link href="/projects" className={secondaryCtaClass}>
                      Browse Portfolio
                    </Link>
                  </div>
                </div>

                <div className="grid gap-6">
                  <blockquote className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-stone-200 sm:p-7">
                    &quot;{featuredTestimonial.content}&quot;
                    <footer className="mt-4 text-[10px] font-bold uppercase tracking-[0.35em] text-stone-500">
                      {featuredTestimonial.name} / {featuredTestimonial.title}
                    </footer>
                  </blockquote>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                        Apartments
                      </p>
                      <p className="mt-2 text-sm leading-7 text-stone-400">
                        Compact homes with stronger spatial logic.
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                        Residences
                      </p>
                      <p className="mt-2 text-sm leading-7 text-stone-400">
                        Family spaces that stay calm as daily life expands.
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary-fixed-dim">
                        Build Ready
                      </p>
                      <p className="mt-2 text-sm leading-7 text-stone-400">
                        Designed for concept clarity and delivery control.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
