'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Globe, Instagram, Mail } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import BrandLogo from './BrandLogo'

const navLinks = [
  { label: 'Studio', href: '/#studio' },
  { label: 'Portfolio', href: '/projects' },
  { label: 'Services', href: '/#services' },
]

const connectLinks = [
  { label: 'Instagram', href: 'https://instagram.com/mikroliving', icon: Instagram, external: true },
  { label: 'Web', href: 'https://www.mikroliving.store', icon: Globe, external: true },
  { label: 'Mail', href: 'mailto:marketing@mikroliving.id', icon: Mail, external: false },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
]

export default function Footer() {
  return (
    <footer className="w-full bg-stone-100 px-6 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col items-start justify-between gap-12 md:flex-row">
          <AnimatedSection className="max-w-xs space-y-5">
            <BrandLogo imageClassName="w-[220px]" />
            <p className="text-sm leading-relaxed text-stone-500">
              Crafting intelligent, elegant spaces that elevate the standard of compact and
              residential living.
            </p>
            <div className="flex gap-3 pt-2">
              {connectLinks.map((link) => {
                const Icon = link.icon
                return (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    whileHover={{ scale: 1.08, backgroundColor: '#785600', color: '#fff' }}
                    transition={{ duration: 0.2 }}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-300 text-stone-500 transition-colors duration-200"
                    aria-label={link.label}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.a>
                )
              })}
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
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="text-sm text-stone-500 transition-colors hover:text-primary"
                >
                  {link.label}
                </a>
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
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Image
              src="/brand-logo-cms.ico"
              alt="Company icon"
              width={18}
              height={18}
              className="h-[18px] w-[18px]"
            />
            <span>Support by CV KBK</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
