'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  BriefcaseBusiness,
  Building2,
  Hammer,
  PencilRuler,
  Sofa,
} from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import type { HomeService } from '../lib/homepage'

const fallbackServices: HomeService[] = [
  {
    id: 1,
    slug: 'interior-design',
    title: 'Interior Design',
    description: 'Comprehensive conceptual and technical planning for any space.',
  },
  {
    id: 2,
    slug: 'design-and-build',
    title: 'Design & Build',
    description: 'Integrated project management from concept to completion.',
  },
]

const iconBySlug: Record<string, typeof PencilRuler> = {
  'interior-design': PencilRuler,
  'apartment-design': Building2,
  'custom-furniture': Sofa,
  'design-and-build': Hammer,
}

interface OurServicesProps {
  services?: HomeService[]
}

export default function OurServices({
  services = fallbackServices,
}: OurServicesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: '-60px' })

  return (
    <section id="services" className="bg-surface-container-low px-6 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <AnimatedSection className="mb-16 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            What We Do
          </span>
          <h2 className="mb-4 mt-3 text-4xl font-headline md:text-5xl">Our Services</h2>
          <p className="mx-auto max-w-2xl leading-relaxed text-on-surface-variant">
            From spatial planning to bespoke furniture, we provide end-to-end
            interior solutions tailored to modern living.
          </p>
        </AnimatedSection>

        <div
          ref={containerRef}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {services.map((service, index) => {
            const Icon = iconBySlug[service.slug] || BriefcaseBusiness

            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group cursor-default rounded-2xl border border-transparent bg-surface-container-lowest p-10 transition-shadow duration-300 hover:border-outline-variant/20 hover:shadow-xl"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-fixed/30 transition-colors duration-300 group-hover:bg-primary-fixed/60">
                  <Icon className="h-7 w-7 text-primary" strokeWidth={1.8} />
                </div>
                <h3 className="mb-3 text-lg font-headline transition-colors duration-300 group-hover:text-primary">
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {service.description}
                </p>
                <div className="mt-6 h-0.5 origin-left scale-x-0 bg-outline-variant/20 transition-colors duration-500 group-hover:scale-x-100 group-hover:bg-primary/30" />
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
