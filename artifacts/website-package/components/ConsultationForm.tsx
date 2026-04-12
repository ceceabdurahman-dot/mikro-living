'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { consultationApi } from '@/lib/api'

const services = ['Interior Design', 'Apartment Design', 'Custom Furniture', 'Design & Build']
const budgets  = ['< Rp 50 juta', 'Rp 50–150 juta', 'Rp 150–300 juta', '> Rp 300 juta']

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function ConsultationForm() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', message: '',
    service_type: '', budget_range: '', location: '', area_sqm: '',
  })
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) return

    setState('loading')
    try {
      await consultationApi.submit({
        ...form,
        area_sqm: form.area_sqm ? parseFloat(form.area_sqm) : undefined,
      })
      setState('success')
      setForm({ name: '', email: '', phone: '', message: '', service_type: '', budget_range: '', location: '', area_sqm: '' })
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan. Silakan coba lagi.')
      setState('error')
    }
  }

  const inputClass = 'w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 text-sm'
  const labelClass = 'block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2'

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl border border-outline-variant/10 max-w-2xl mx-auto">
      <h3 className="text-2xl font-headline mb-2">Book Konsultasi Gratis</h3>
      <p className="text-on-surface-variant text-sm mb-8">Ceritakan kebutuhan Anda, tim kami siap membantu dalam 1×24 jam.</p>

      <AnimatePresence mode="wait">
        {state === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center mb-6">
              <span className="text-3xl">✓</span>
            </div>
            <h4 className="text-xl font-headline mb-3">Permintaan Terkirim!</h4>
            <p className="text-on-surface-variant text-sm max-w-sm">
              Terima kasih telah menghubungi MikroLiving. Tim kami akan menghubungi Anda dalam 1×24 jam kerja.
            </p>
            <button
              onClick={() => setState('idle')}
              className="mt-6 text-primary text-sm font-bold hover:underline"
            >
              Kirim permintaan lain
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Nama Lengkap *</label>
                <input type="text" placeholder="Sarah Wijaya" required value={form.name} onChange={set('name')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" placeholder="sarah@email.com" required value={form.email} onChange={set('email')} className={inputClass} />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>No. WhatsApp</label>
                <input type="tel" placeholder="+62 812 3456 7890" value={form.phone} onChange={set('phone')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Kota / Lokasi</label>
                <input type="text" placeholder="Jakarta Selatan" value={form.location} onChange={set('location')} className={inputClass} />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Jenis Layanan</label>
                <select value={form.service_type} onChange={set('service_type')} className={inputClass}>
                  <option value="">Pilih layanan...</option>
                  {services.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Estimasi Budget</label>
                <select value={form.budget_range} onChange={set('budget_range')} className={inputClass}>
                  <option value="">Pilih budget...</option>
                  {budgets.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            {/* Area */}
            <div>
              <label className={labelClass}>Luas Ruang (m²)</label>
              <input type="number" placeholder="45" min="1" value={form.area_sqm} onChange={set('area_sqm')} className={inputClass} />
            </div>

            {/* Message */}
            <div>
              <label className={labelClass}>Ceritakan Kebutuhan Anda</label>
              <textarea
                rows={4}
                placeholder="Saya ingin merenovasi kamar tidur utama dengan konsep minimalis dan storage yang optimal..."
                value={form.message}
                onChange={set('message')}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Error */}
            {state === 'error' && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-error text-sm bg-error-container/30 px-4 py-3 rounded-lg">
                {errorMsg}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={state === 'loading'}
              whileHover={{ scale: state === 'loading' ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-on-primary py-4 rounded-lg font-bold text-base transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {state === 'loading' ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Mengirim...
                </>
              ) : 'Kirim Permintaan Konsultasi'}
            </motion.button>

            <p className="text-xs text-on-surface-variant text-center">
              Dengan mengirim form ini, Anda menyetujui{' '}
              <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a> kami.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
