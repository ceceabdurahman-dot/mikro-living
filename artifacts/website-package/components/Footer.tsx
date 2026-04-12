'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import AnimatedSection from './AnimatedSection'
import BrandLogo from './BrandLogo'

const navLinks = [
  { label: 'Studio', href: '#studio' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Services', href: '#services' },
]

const connectLinks = [
  { label: 'Instagram', href: '#' },
  { label: 'LinkedIn', href: '#' },
  { label: 'Pinterest', href: '#' },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
]

export default function Footer() {
  return (
    <footer className="w-full bg-stone-100 px-6 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col items-start justify-between gap-12 md:flex-row">
          <AnimatedSection className="max-w-xs space-y-5">
            <BrandLogo imageClassName="h-auto w-[190px]" />
            <p className="text-sm leading-relaxed text-stone-500">
              Crafting intelligent, elegant spaces that elevate the standard of
              compact and residential living.
            </p>
            <div className="flex gap-3 pt-2">
              {['IG', 'LI', 'PIN'].map((label) => (
                <motion.a
                  key={label}
                  href="#"
                  whileHover={{ scale: 1.1, backgroundColor: '#785600', color: '#fff' }}
                  transition={{ duration: 0.2 }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 text-[10px] font-bold text-stone-400 transition-colors duration-200"
                >
                  {label}
                </motion.a>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15} className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <span className="mb-1 text-xs font-bold uppercase tracking-widest text-stone-900">
                Navigation
              </span>
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-stone-500 transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <span className="mb-1 text-xs font-bold uppercase tracking-widest text-stone-900">
                Connect
              </span>
              {connectLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-stone-500 transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <span className="mb-1 text-xs font-bold uppercase tracking-widest text-stone-900">
                Legal
              </span>
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-stone-500 transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-8 md:flex-row">
          <p className="text-xs uppercase tracking-widest text-stone-400">
            (c) {new Date().getFullYear()} MikroLiving Interior Studio. All rights reserved.
          </p>
          <p className="text-xs text-stone-400">Crafted in Jakarta</p>
        </div>
      </div>
    </footer>
  )
}
