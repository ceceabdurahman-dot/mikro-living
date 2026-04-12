'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import type { HomeProject } from '../lib/homepage'

const fallbackProjects: HomeProject[] = [
  {
    id: 1,
    slug: 'the-botanica-suite',
    title: 'The Botanica Suite',
    location: 'Jakarta',
    size: '45 m2',
    category: 'Apartment',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  },
]

interface SignatureProjectsProps {
  projects?: HomeProject[]
}

export default function SignatureProjects({
  projects = fallbackProjects,
}: SignatureProjectsProps) {
  const [activeFilter, setActiveFilter] = useState('All')

  const filters = useMemo(() => {
    const uniqueCategories = Array.from(new Set(projects.map((project) => project.category)))
    return ['All', ...uniqueCategories]
  }, [projects])

  const filteredProjects =
    activeFilter === 'All'
      ? projects
      : projects.filter((project) => project.category === activeFilter)

  return (
    <section id="portfolio" className="bg-surface px-6 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
          <AnimatedSection>
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Our Work
              </span>
              <h2 className="mb-4 mt-3 text-4xl font-headline md:text-5xl">
                Signature Projects
              </h2>
              <p className="leading-relaxed text-on-surface-variant">
                A curated selection of our published work across residential and
                compact-living projects.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2} direction="right">
            <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 text-sm font-medium no-scrollbar md:flex-nowrap">
              {filters.map((filter) => (
                <motion.button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  whileTap={{ scale: 0.95 }}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    activeFilter === filter
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                  }`}
                >
                  {filter}
                </motion.button>
              ))}
            </div>
          </AnimatedSection>
        </div>

        <motion.div layout className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.article
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className="group block cursor-pointer overflow-hidden rounded-2xl bg-surface-container-low transition-all duration-500 hover:shadow-xl"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>

                  <div className="p-8">
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <h3 className="text-xl font-headline transition-colors duration-300 group-hover:text-primary">
                        {project.title}
                      </h3>
                      <span className="text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <ArrowRight size={20} />
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm text-on-surface-variant">
                      <span>{project.location}</span>
                      <span>/</span>
                      <span>{project.size}</span>
                      <span>/</span>
                      <span className="font-medium text-primary/80">{project.category}</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatedSection delay={0.3} className="mt-12 text-center">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/projects"
              className="mx-auto inline-flex items-center gap-2 rounded-lg border border-outline-variant/40 px-10 py-4 font-bold text-primary transition-all duration-300 hover:border-primary"
            >
              View All Projects
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  )
}
