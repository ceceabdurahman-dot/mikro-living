'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { openConsultationModal } from '../lib/consultation'
import BrandLogo from './BrandLogo'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Studio', href: '#studio' },
  { label: 'Services', href: '#services' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Process', href: '#process' },
  { label: 'Insights', href: '#insights' },
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
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-outline-variant/10'
            : 'bg-white/60 backdrop-blur-md'
        }`}
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-8 py-4">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.02 }}>
            <BrandLogo
              className="group"
              imageClassName="h-auto w-[118px] md:w-[132px]"
              priority
            />
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setActiveLink(link.label)}
                className={`relative text-sm font-medium tracking-wide transition-all duration-300 group ${
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

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <motion.button
              type="button"
              onClick={openConsultationModal}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="hidden md:block bg-primary hover:bg-primary-container text-on-primary px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300"
            >
              Book Consultation
            </motion.button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-surface-container transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-[72px] left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-outline-variant/10 shadow-lg"
          >
            <div className="flex flex-col px-6 py-6 gap-4 max-w-7xl mx-auto">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => {
                      setActiveLink(link.label)
                      setMobileOpen(false)
                    }}
                    className={`block text-base font-medium py-2 border-b border-outline-variant/10 transition-colors ${
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
                className="mt-2 bg-primary text-on-primary px-6 py-3 rounded-lg text-sm font-semibold w-full"
              >
                Book Consultation
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

