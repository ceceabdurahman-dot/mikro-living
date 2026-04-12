'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const [isHoveringLink, setIsHoveringLink] = useState(false)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - 16}px, ${e.clientY - 16}px)`
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`
      }
    }

    const handleLinkEnter = () => setIsHoveringLink(true)
    const handleLinkLeave = () => setIsHoveringLink(false)

    window.addEventListener('mousemove', moveCursor)

    const links = document.querySelectorAll('a, button')
    links.forEach((el) => {
      el.addEventListener('mouseenter', handleLinkEnter)
      el.addEventListener('mouseleave', handleLinkLeave)
    })

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      links.forEach((el) => {
        el.removeEventListener('mouseenter', handleLinkEnter)
        el.removeEventListener('mouseleave', handleLinkLeave)
      })
    }
  }, [])

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[9999] origin-left"
      />

      {/* Custom cursor — hidden on touch devices */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9998] transition-all duration-150 hidden md:block ${
          isHoveringLink
            ? 'border-2 border-primary bg-primary/10 scale-150'
            : 'border border-primary/40 bg-transparent'
        }`}
        style={{ willChange: 'transform' }}
      />
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-primary pointer-events-none z-[9997] hidden md:block"
        style={{ willChange: 'transform' }}
      />
    </>
  )
}
