'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { gsap } from 'gsap'

const defaultStats = [
  { value: '150+', label: 'Projects' },
  { value: '98%', label: 'Satisfaction' },
  { value: '10+', label: 'Years Exp.' },
]

const defaultHero = {
  badge: 'Jakarta & Bandung Studio',
  titlePrefix: 'Designing',
  titleEmphasis: 'Smart',
  titleSuffix: 'Living Spaces',
  description:
    'Creating elegant and functional interiors that resonate with your lifestyle and personality.',
  primaryCtaLabel: 'View Portfolio',
  primaryCtaHref: '/projects',
  secondaryCtaLabel: 'Explore Insights',
  secondaryCtaHref: '/blog',
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAmVyqYTtjjawbI_GLPMB5OZqVhXe40pCXhXXRmaXrNsovFN5MhUfuuf3xVRb6I7DCRVOSOyMQDfA-x_0i_vdwekDPg6dw6b-ZPq7OITgyaXGlIpBDKcD1bqreh-GQeLtbNGcOnYYWcGIr-AWkRDqToJToi2fO37-_xKR19pGKR6PlBGgdpN3TuezzOeTdSHw3Gp3tIjBdRSZj_nariYqZlmvm9_1MTPZ1lXA4PwkOeKp6assP-Wy2i2TWvMIoKWzhLjHQuSlebkm5K',
  imageAlt: 'Luxurious modern living room with warm wood accents',
  latestProjectLabel: 'Latest Project',
  latestProjectTitle: 'The Botanica Suite',
  latestProjectMeta: 'Jakarta Selatan / 2024',
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

interface HeroSectionProps {
  stats?: Array<{ value: string; label: string }>
  hero?: {
    badge: string
    titlePrefix: string
    titleEmphasis: string
    titleSuffix: string
    description: string
    primaryCtaLabel: string
    primaryCtaHref: string
    secondaryCtaLabel: string
    secondaryCtaHref: string
    image: string
    imageAlt: string
    latestProjectLabel: string
    latestProjectTitle: string
    latestProjectMeta: string
  }
}

export default function HeroSection({ stats = defaultStats, hero = defaultHero }: HeroSectionProps) {
  const imageRef = useRef<HTMLDivElement>(null)
  const floatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (floatRef.current) {
      gsap.to(floatRef.current, {
        y: -18,
        duration: 3.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    }

    const handleScroll = () => {
      if (imageRef.current) {
        const scrollY = window.scrollY
        imageRef.current.style.transform = `translateY(${scrollY * 0.08}px)`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-background px-6 md:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-20 h-[600px] w-[600px] -translate-y-1/4 translate-x-1/3 rounded-full bg-primary-fixed/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/3 translate-y-1/3 rounded-full bg-surface-container/60 blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 py-24 lg:grid-cols-12 lg:py-0">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="z-10 space-y-8 lg:col-span-6"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-fixed bg-primary-fixed/40 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-on-primary-fixed-variant">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              {hero.badge}
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl leading-[1.05] text-on-surface font-headline md:text-6xl xl:text-7xl"
          >
            {hero.titlePrefix}{' '}
            <em className="serif-italic text-primary not-italic">{hero.titleEmphasis}</em>
            <br />
            {hero.titleSuffix}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-lg text-lg font-light leading-relaxed text-on-surface-variant md:text-xl"
          >
            {hero.description}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap items-stretch gap-4">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="flex">
              <Link
                href={hero.primaryCtaHref}
                className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-center font-bold leading-none text-on-primary shadow-lg shadow-primary/20 transition-colors duration-300 hover:bg-primary-container"
              >
                {hero.primaryCtaLabel}
                <ArrowUpRight size={18} strokeWidth={2.5} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="flex">
              <Link
                href={hero.secondaryCtaHref}
                className="inline-flex min-h-[56px] items-center justify-center rounded-lg border border-outline-variant/40 px-8 py-4 text-center font-bold leading-none text-primary transition-all duration-300 hover:bg-surface-container-low"
              >
                {hero.secondaryCtaLabel}
              </Link>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-8 border-t border-outline-variant/20 pt-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              >
                <p className="text-3xl font-headline text-primary">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-on-surface-variant">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[480px] lg:col-span-6 md:h-[600px]"
        >
          <div ref={imageRef} className="absolute inset-0 overflow-hidden rounded-2xl shadow-2xl">
            <Image
              src={hero.image}
              alt={hero.imageAlt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>

          <div ref={floatRef} className="absolute -bottom-6 -left-6 z-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="flex items-center gap-4 rounded-xl border border-outline-variant/10 bg-white p-5 shadow-2xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed">
                <span className="text-lg font-bold text-primary font-headline">+</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                  {hero.latestProjectLabel}
                </p>
                <p className="text-sm font-semibold text-on-surface font-headline">
                  {hero.latestProjectTitle}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {hero.latestProjectMeta}
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute -right-4 -top-4 h-24 w-24 rounded-full border-2 border-primary-fixed/40"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="absolute right-8 top-8 h-8 w-8 rounded-full bg-primary-fixed/60"
          />
        </motion.div>
      </div>
    </section>
  )
}
