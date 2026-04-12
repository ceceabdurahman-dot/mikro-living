'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import type { HomePost } from '../lib/homepage'

const fallbackPosts: HomePost[] = [
  {
    id: 1,
    slug: 'maximizing-space-compact-apartments',
    category: 'Insights',
    title: 'Maximizing Space in Compact Apartments',
    excerpt:
      'Discover practical furniture hacks and layout moves that make small spaces feel larger.',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  },
]

interface LatestInsightsProps {
  posts?: HomePost[]
}

export default function LatestInsights({ posts = fallbackPosts }: LatestInsightsProps) {
  return (
    <section id="insights" className="bg-surface px-6 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex items-end justify-between">
          <AnimatedSection>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Journal
              </span>
              <h2 className="mt-3 text-4xl font-headline md:text-5xl">Latest Insights</h2>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2} direction="right">
            <Link href="/blog" className="group flex items-center gap-2 text-sm font-bold text-primary">
              Explore Blog
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.6,
                delay: index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group cursor-pointer"
            >
              <div className="relative mb-6 aspect-video overflow-hidden rounded-2xl">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                {post.category}
              </span>
              <h4 className="mt-2 mb-3 text-xl leading-snug font-headline transition-colors duration-300 group-hover:text-primary">
                {post.title}
              </h4>
              <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="group/link inline-flex items-center gap-1 border-b-2 border-primary-fixed-dim pb-0.5 text-sm font-bold transition-colors duration-300 hover:border-primary"
              >
                Read More
                <ArrowRight
                  size={14}
                  className="-translate-x-2 opacity-0 transition-all duration-300 group-hover/link:translate-x-0 group-hover/link:opacity-100"
                />
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
