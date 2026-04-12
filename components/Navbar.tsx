'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { openConsultationModal } from '../lib/consultation'
import BrandLogo from './BrandLogo'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Studio', href: '/#studio' },
  { label: 'Services', href: '/#services' },
  { label: 'Portfolio', href: '/projects' },
  { label: 'Process', href: '/#process' },
  { label: 'Insights', href: '/blog' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('Home')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? 'border-b border-outline-variant/10 bg-white/90 shadow-sm backdrop-blur-xl'
            : 'bg-white/70 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
          <motion.div whileHover={{ scale: 1.02 }}>
            <BrandLogo
              className="group"
              imageClassName="w-[148px] md:w-[170px]"
              priority
            />
          </motion.div>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setActiveLink(link.label)}
                className={`group relative text-sm font-medium tracking-wide transition-all duration-300 ${
                  activeLink === link.label
                    ? 'text-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                    activeLink === link.label ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              type="button"
              onClick={openConsultationModal}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="hidden rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary transition-all duration-300 hover:bg-primary-container md:block"
            >
              Book Consultation
            </motion.button>
            <button
              onClick={() => setMobileOpen((current) => !current)}
              className="rounded-lg p-2 transition-colors hover:bg-surface-container md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed left-0 right-0 top-[80px] z-40 border-b border-outline-variant/10 bg-white/95 shadow-lg backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.25 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => {
                      setActiveLink(link.label)
                      setMobileOpen(false)
                    }}
                    className={`block border-b border-outline-variant/10 py-2 text-base font-medium transition-colors ${
                      activeLink === link.label ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  openConsultationModal()
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-on-primary"
              >
                Book Consultation
              </motion.button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
