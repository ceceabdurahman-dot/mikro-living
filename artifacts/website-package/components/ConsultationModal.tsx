'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, X } from 'lucide-react'
import { CONSULTATION_MODAL_EVENT } from '../lib/consultation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  service_type: 'interior-design',
  message: '',
}

export default function ConsultationModal() {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    const handleOpen = () => {
      setOpen(true)
      setError('')
      setSuccess('')
    }

    window.addEventListener(CONSULTATION_MODAL_EVENT, handleOpen)
    return () => window.removeEventListener(CONSULTATION_MODAL_EVENT, handleOpen)
  }, [])

  const close = () => {
    if (!submitting) setOpen(false)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE_URL}/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'website' }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok || payload.success === false) {
        throw new Error(payload.message || 'Gagal mengirim permintaan konsultasi.')
      }

      setSuccess('Permintaan konsultasi berhasil dikirim. Tim kami akan segera menghubungi Anda.')
      setForm(emptyForm)
    } catch (submitError: any) {
      setError(submitError.message || 'Gagal mengirim permintaan konsultasi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-stone-950/50 px-4 py-8 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Book Consultation
                </p>
                <h2 className="mt-3 text-3xl text-stone-900 font-headline">
                  Tell us about your space
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-stone-500">
                  Isi detail dasar proyek Anda. Tim MikroLiving akan menindaklanjuti permintaan ini
                  melalui email atau WhatsApp.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-2xl border border-stone-200 p-2 text-stone-500 transition hover:bg-stone-50"
                aria-label="Close consultation modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-stone-700">Name</span>
                  <input
                    required
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-primary focus:bg-white"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-stone-700">Email</span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-primary focus:bg-white"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-stone-700">Phone / WhatsApp</span>
                  <input
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-primary focus:bg-white"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-stone-700">Service</span>
                  <select
                    value={form.service_type}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, service_type: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-primary focus:bg-white"
                  >
                    <option value="interior-design">Interior Design</option>
                    <option value="apartment-design">Apartment Design</option>
                    <option value="custom-furniture">Custom Furniture</option>
                    <option value="design-and-build">Design & Build</option>
                  </select>
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-stone-700">Project brief</span>
                <textarea
                  required
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  className="min-h-32 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-primary focus:bg-white"
                  placeholder="Ceritakan jenis ruang, ukuran, target gaya, dan kebutuhan utama Anda."
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-2xl border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {submitting ? 'Sending...' : 'Send consultation request'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
