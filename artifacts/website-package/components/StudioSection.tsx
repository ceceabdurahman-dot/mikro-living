'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import AnimatedSection from './AnimatedSection'

const defaultHighlights = [
  { label: 'Studio Founded', value: '2014' },
  { label: 'Cities Active', value: '3' },
  { label: 'Design Awards', value: '12' },
]

interface StudioSectionProps {
  highlights?: Array<{ label: string; value: string }>
}

export default function StudioSection({
  highlights = defaultHighlights,
}: StudioSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])

  return (
    <section
      id="studio"
      ref={sectionRef}
      className="overflow-hidden bg-surface-container-low px-6 py-24 md:px-8"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <AnimatedSection
          direction="left"
          className="relative order-2 h-[520px] lg:order-1 lg:h-[640px]"
        >
          <motion.div
            style={{ y: imageY }}
            className="absolute inset-0 overflow-hidden rounded-2xl"
          >
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWrxWwFE7aWl7pAMC0kgHeKkU1ZwRZ4_8IDa49kpU6O9RhU3n1r5CjWvNp7ZHi1Rlsvf7r9H1WRQlvTrIkP8OLL7dKPvygDeCYzC_VkYVcHMtmlazUuVPUlDycBGVzEyeV_ak7KOJaNLZw5pE7q7fOuwI8TdHSWX455h8MmSi0bzw5fU7nNco1s5T3dJgupC1FQoTE1OHtQ_DGPqhDVvxrSydhWTQs3ASeXLBcGuVyucDycxdFYppDERaKz4uAAh4CduBNUdar-PZX"
              alt="MikroLiving Studio"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="absolute -bottom-6 -right-6 z-10 max-w-[220px] rounded-2xl border border-outline-variant/10 bg-white p-6 shadow-2xl"
          >
            <p className="mb-2 text-xs uppercase tracking-widest text-on-surface-variant">
              Design Philosophy
            </p>
            <p className="text-sm italic leading-snug text-on-surface font-headline">
              "Form follows feeling, not just function."
            </p>
          </motion.div>

          <div className="pointer-events-none absolute -left-6 -top-6 h-32 w-32 rounded-full bg-primary-fixed/30 blur-2xl" />
        </AnimatedSection>

        <div className="order-1 space-y-8 lg:order-2">
          <AnimatedSection>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Our Studio
            </span>
            <h2 className="mb-6 mt-3 text-4xl leading-tight font-headline md:text-5xl">
              Where Craft Meets{' '}
              <em className="serif-italic not-italic text-primary">Intention</em>
            </h2>
            <p className="mb-4 leading-relaxed text-on-surface-variant">
              MikroLiving was born from a belief that small spaces deserve the same
              thoughtfulness as grand ones. We combine data-driven spatial planning
              with artisanal craftsmanship to deliver interiors that are deeply
              personal.
            </p>
            <p className="leading-relaxed text-on-surface-variant">
              Our team of 12 designers and builders works across Jakarta, Bandung,
              and Surabaya, bringing a unified vision to every project regardless
              of scale.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.15} className="grid grid-cols-3 gap-6 pt-4">
            {highlights.map((highlight) => (
              <div key={highlight.label} className="border-l-2 border-primary-fixed pl-4">
                <p className="text-3xl font-headline text-primary">{highlight.value}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-on-surface-variant">
                  {highlight.label}
                </p>
              </div>
            ))}
          </AnimatedSection>

          <AnimatedSection delay={0.25}>
            <motion.div
              whileHover={{ scale: 1.04, backgroundColor: '#986d00' }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex"
            >
              <Link
                href="/team"
                className="rounded-lg bg-primary px-8 py-4 font-bold text-on-primary transition-colors duration-300"
              >
                Meet the Team
              </Link>
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
