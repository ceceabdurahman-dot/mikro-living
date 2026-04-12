'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import type { HomeTestimonial } from '../lib/homepage'

const fallbackTestimonial: HomeTestimonial = {
  id: 1,
  name: 'Sarah & Dimas',
  title: 'The Botanica Apartments',
  content:
    'MikroLiving transformed our apartment into a sanctuary. Their attention to storage solutions and aesthetic flow is truly unmatched.',
  rating: 5,
}

interface TestimonialProps {
  testimonial?: HomeTestimonial | null
}

export default function Testimonial({
  testimonial = fallbackTestimonial,
}: TestimonialProps) {
  const activeTestimonial = testimonial || fallbackTestimonial
  const initials = activeTestimonial.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')

  return (
    <section className="bg-surface-container px-6 py-24 md:px-8">
      <div className="mx-auto max-w-5xl">
        <AnimatedSection>
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-12 shadow-sm md:p-20"
          >
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary-fixed/20 blur-2xl" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-8 flex gap-1">
                {Array.from({ length: activeTestimonial.rating }).map((_, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.08, duration: 0.3 }}
                  >
                    <Star
                      className="h-5 w-5 fill-primary-fixed-dim text-primary-fixed-dim"
                      strokeWidth={1.5}
                    />
                  </motion.span>
                ))}
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mb-10 max-w-3xl text-2xl italic leading-relaxed text-on-surface font-headline md:text-3xl"
              >
                "{activeTestimonial.content}"
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="mb-4 relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full ring-4 ring-primary-fixed/60 shadow-lg">
                  {activeTestimonial.avatarUrl ? (
                    <Image
                      src={activeTestimonial.avatarUrl}
                      alt={activeTestimonial.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary-fixed text-lg font-bold text-primary">
                      {initials}
                    </div>
                  )}
                </div>
                <h5 className="text-lg font-headline">{activeTestimonial.name}</h5>
                <p className="mt-1 text-sm text-on-surface-variant">{activeTestimonial.title}</p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  )
}
