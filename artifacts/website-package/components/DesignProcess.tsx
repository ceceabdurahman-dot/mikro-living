'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AnimatedSection from './AnimatedSection'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const steps = [
  { number: '01', title: 'Consultation', subtitle: 'Initial Discovery' },
  { number: '02', title: 'Concept', subtitle: 'Mood & Style' },
  { number: '03', title: '3D Design', subtitle: 'Visualization' },
  { number: '04', title: 'Production', subtitle: 'Fabrication' },
  { number: '05', title: 'Installation', subtitle: 'Final Setup' },
]

export default function DesignProcess() {
  const lineRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              once: true,
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="process" ref={sectionRef} className="py-24 px-6 md:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-20">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">How We Work</span>
          <h2 className="text-4xl md:text-5xl font-headline mt-3">Design Process</h2>
        </AnimatedSection>

        <div className="relative">
          {/* Animated connector line */}
          <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-outline-variant/10">
            <div
              ref={lineRef}
              className="absolute inset-0 bg-gradient-to-r from-primary-fixed via-primary to-primary-fixed scale-x-0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.12, boxShadow: '0 12px 32px rgba(120,86,0,0.3)' }}
                  transition={{ duration: 0.25 }}
                  className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20 cursor-default"
                >
                  <span className="text-base font-bold font-headline">{step.number}</span>
                </motion.div>
                <h4 className="font-headline text-base mb-1 group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h4>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest">
                  {step.subtitle}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
