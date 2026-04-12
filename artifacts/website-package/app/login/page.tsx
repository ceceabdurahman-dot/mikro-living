'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import CmsBrandLogo from '../../components/CmsBrandLogo'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'

const clearAuthCookie = () => {
  document.cookie = 'ml_access_token=; Max-Age=0; path=/; SameSite=Lax'
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/cms'

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token =
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('ml_access_token='))
        ?.split('=')[1] || ''

    if (!token) {
      setCheckingSession(false)
      return
    }

    const verifySession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error('Session invalid')
        router.replace(redirect)
      } catch {
        clearAuthCookie()
        setCheckingSession(false)
      }
    }

    verifySession()
  }, [redirect, router])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const payload = await response.json()

      if (!response.ok) throw new Error(payload.message || 'Login gagal')

      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
      document.cookie = `ml_access_token=${payload.data.accessToken}; expires=${expires}; path=/; SameSite=Lax`

      router.replace(redirect)
    } catch (err: any) {
      clearAuthCookie()
      setError(err.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-10 text-center">
          <div className="flex justify-center">
            <CmsBrandLogo imageClassName="h-auto w-[74px]" priority />
          </div>
          <p className="mt-2 text-sm text-on-surface-variant">CMS Admin Panel</p>
        </div>

        <div className="rounded-2xl border border-outline-variant/10 bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-xl text-on-surface font-headline">Masuk ke Dashboard</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="admin@mikroliving.com"
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Enter your password"
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {error ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg bg-error-container/30 px-4 py-3 text-sm text-error"
              >
                {error}
              </motion.p>
            ) : null}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-bold text-on-primary transition-all duration-300 disabled:opacity-60"
            >
              {loading ? 'Memverifikasi...' : 'Masuk'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-xs text-on-surface-variant">
            Hanya untuk tim internal MikroLiving.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-on-surface-variant/60">
          (c) {new Date().getFullYear()} MikroLiving Interior Studio
        </p>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  )
}
