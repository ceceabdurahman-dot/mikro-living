'use client'

import { motion } from 'framer-motion'
import AnimatedSection from './AnimatedSection'
import { getWhatsAppUrl, openConsultationModal } from '../lib/consultation'

const WhatsAppIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.038 3.284l-.569 2.126 2.18-.573c.961.524 1.954.896 3.117.896 3.181 0 5.767-2.587 5.768-5.767 0-3.18-2.587-5.766-5.766-5.766zm3.391 8.21c-.154.433-.746.812-1.032.863-.298.053-.588.093-1.636-.328-1.248-.5-2.052-1.771-2.115-1.855-.064-.083-.512-.68-.512-1.306 0-.625.327-.933.443-1.06.116-.128.254-.16.339-.16.085 0 .17.015.244.015.074 0 .174-.027.272.21s.339.825.37.892c.03.068.05.147.006.234-.045.087-.067.142-.134.22-.067.078-.14.173-.2.247-.074.073-.15.154-.064.301.085.148.378.625.811 1.01.558.496 1.03.65 1.179.725.148.075.234.062.32-.038.086-.098.367-.428.464-.575.097-.147.194-.124.327-.075.133.05.845.397.99.469.145.072.241.108.277.17.036.062.036.357-.118.79z" />
  </svg>
)

export default function FooterCTA() {
  return (
    <section className="py-28 px-6 md:px-8 bg-stone-900 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute -bottom-20 right-0 w-64 h-64 bg-primary-fixed/5 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-0 w-px h-32 bg-white/10 -translate-y-1/2 hidden lg:block" />
        <div className="absolute top-1/2 right-0 w-px h-32 bg-white/10 -translate-y-1/2 hidden lg:block" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <AnimatedSection>
          <span className="inline-block text-xs font-bold text-primary-fixed-dim uppercase tracking-widest mb-6">
            Ready to Transform?
          </span>
          <h2 className="text-4xl md:text-6xl font-headline mb-6 leading-tight">
            Let&apos;s Create Your
            <br />
            <em className="serif-italic text-primary-fixed-dim">Dream Space</em>
          </h2>
          <p className="text-stone-400 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            Whether you&apos;re starting from scratch or renovating a room, our
            team is ready to bring your vision to life.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2} className="flex flex-col sm:flex-row gap-5 justify-center">
          <motion.button
            type="button"
            onClick={openConsultationModal}
            whileHover={{ scale: 1.04, backgroundColor: '#986d00' }}
            whileTap={{ scale: 0.97 }}
            className="bg-primary text-on-primary px-10 py-5 rounded-lg font-bold transition-colors duration-300 text-base shadow-xl shadow-primary/30"
          >
            Book Consultation
          </motion.button>
          <motion.a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.12)' }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-3 border border-white/20 px-10 py-5 rounded-lg font-bold transition-all duration-300 text-base"
          >
            <WhatsAppIcon />
            WhatsApp Us
          </motion.a>
        </AnimatedSection>

        {/* Trust badges */}
        <AnimatedSection delay={0.35} className="mt-16 flex justify-center gap-12 text-stone-600">
          <div className="text-center">
            <p className="text-2xl font-headline text-stone-400">150+</p>
            <p className="text-xs uppercase tracking-widest mt-1">Projects Done</p>
          </div>
          <div className="w-px bg-stone-800 h-12 self-center" />
          <div className="text-center">
            <p className="text-2xl font-headline text-stone-400">98%</p>
            <p className="text-xs uppercase tracking-widest mt-1">Client Satisfaction</p>
          </div>
          <div className="w-px bg-stone-800 h-12 self-center" />
          <div className="text-center">
            <p className="text-2xl font-headline text-stone-400">10+</p>
            <p className="text-xs uppercase tracking-widest mt-1">Years Experience</p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
