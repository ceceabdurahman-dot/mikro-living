'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const WhatsAppIcon = () => (
  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.038 3.284l-.569 2.126 2.18-.573c.961.524 1.954.896 3.117.896 3.181 0 5.767-2.587 5.768-5.767 0-3.18-2.587-5.766-5.766-5.766zm3.391 8.21c-.154.433-.746.812-1.032.863-.298.053-.588.093-1.636-.328-1.248-.5-2.052-1.771-2.115-1.855-.064-.083-.512-.68-.512-1.306 0-.625.327-.933.443-1.06.116-.128.254-.16.339-.16.085 0 .17.015.244.015.074 0 .174-.027.272.21s.339.825.37.892c.03.068.05.147.006.234-.045.087-.067.142-.134.22-.067.078-.14.173-.2.247-.074.073-.15.154-.064.301.085.148.378.625.811 1.01.558.496 1.03.65 1.179.725.148.075.234.062.32-.038.086-.098.367-.428.464-.575.097-.147.194-.124.327-.075.133.05.845.397.99.469.145.072.241.108.277.17.036.062.036.357-.118.79zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.932-1.428A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
  </svg>
)

export default function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-3"
        >
          <AnimatePresence>
            {showTooltip ? (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="whitespace-nowrap rounded-lg border border-outline-variant/10 bg-white px-4 py-2 text-sm font-medium text-on-surface shadow-xl"
              >
                Chat with us
              </motion.div>
            ) : null}
          </AnimatePresence>

          <motion.a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onHoverStart={() => setShowTooltip(true)}
            onHoverEnd={() => setShowTooltip(false)}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-green-500/30"
          >
            <WhatsAppIcon />
            <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-20 animate-ping" />
          </motion.a>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
