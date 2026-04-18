'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

import CmsBrandLogo from '../../components/CmsBrandLogo'
import { sanitizeInternalRedirect } from '../../lib/safeRedirect'
import { clearLegacyAuthCookies, loginWithSession, markSessionActive } from '../../lib/authSession'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'

type ForgotPasswordResult = {
  message?: string
  data?: {
    preview_url?: string
    email_skipped?: boolean
  } | null
}

function AuthDialog({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean
  title: string
  description: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/55 px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            className="w-full max-w-lg rounded-[28px] border border-stone-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Security</p>
                <h3 className="mt-3 text-2xl font-headline text-stone-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-600"
              >
                Close
              </button>
            </div>
            <div className="mt-6">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = sanitizeInternalRedirect(searchParams.get('redirect'), '/cms')
  const resetTokenFromUrl = searchParams.get('resetToken') || ''
  const resetEmailFromUrl = searchParams.get('email') || ''

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState('')

  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotNotice, setForgotNotice] = useState('')
  const [forgotPreviewUrl, setForgotPreviewUrl] = useState('')

  const [resetOpen, setResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetConfirmPassword, setResetConfirmPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetNotice, setResetNotice] = useState('')
  const [resetError, setResetError] = useState('')

  const hasResetLink = useMemo(
    () => Boolean(resetTokenFromUrl && resetEmailFromUrl),
    [resetEmailFromUrl, resetTokenFromUrl]
  )

  useEffect(() => {
    if (!hasResetLink) return

    setResetEmail(resetEmailFromUrl)
    setResetToken(resetTokenFromUrl)
    setResetOpen(true)
    setCheckingSession(false)

    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, '/login')
    }
  }, [hasResetLink, resetEmailFromUrl, resetTokenFromUrl])

  useEffect(() => {
    if (hasResetLink) return

    const verifySession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: 'include',
        })

        if (!response.ok) throw new Error('Session invalid')
        markSessionActive()
        router.replace(redirect)
      } catch {
        clearLegacyAuthCookies()
        setCheckingSession(false)
      }
    }

    verifySession()
  }, [hasResetLink, redirect, router])

  const closeResetDialog = () => {
    setResetOpen(false)
    setResetError('')
    setResetNotice('')
    setResetPassword('')
    setResetConfirmPassword('')
    if (hasResetLink) {
      router.replace('/login')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await loginWithSession(form.email, form.password)
      router.replace(redirect)
    } catch (err: any) {
      clearLegacyAuthCookies()
      setError(err.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setForgotLoading(true)
    setForgotNotice('')
    setForgotPreviewUrl('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: forgotEmail }),
      })
      const payload: ForgotPasswordResult = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.message || 'Gagal mengirim email reset password.')
      }

      setForgotNotice(
        payload.message || 'Jika email terdaftar, tautan reset password akan dikirim ke inbox Anda.'
      )
      setForgotPreviewUrl(payload.data?.preview_url || '')
    } catch (err: any) {
      setForgotNotice(err.message || 'Gagal mengirim email reset password.')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setResetLoading(true)
    setResetError('')
    setResetNotice('')

    try {
      if (resetPassword !== resetConfirmPassword) {
        throw new Error('Konfirmasi password baru tidak sesuai.')
      }

      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: resetEmail,
          token: resetToken,
          newPassword: resetPassword,
          confirmPassword: resetConfirmPassword,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.message || 'Gagal menyimpan password baru.')
      }

      setResetNotice(payload.message || 'Password baru berhasil disimpan.')
      setError('Password berhasil direset. Silakan login dengan password baru.')
      setResetPassword('')
      setResetConfirmPassword('')
      window.setTimeout(() => {
        closeResetDialog()
      }, 900)
    } catch (err: any) {
      setResetError(err.message || 'Gagal menyimpan password baru.')
    } finally {
      setResetLoading(false)
    }
  }

  if (checkingSession) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <>
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
            <h2 className="mb-6 text-xl font-headline text-on-surface">Masuk ke Dashboard</h2>

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
                  placeholder="put your e-mail here"
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotOpen(true)
                      setForgotNotice('')
                      setForgotPreviewUrl('')
                      setForgotEmail(form.email)
                    }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Lupa password?
                  </button>
                </div>
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

      <AuthDialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Lupa password"
        description="Masukkan email user CMS. Jika akun aktif ditemukan, tautan reset password akan dikirim ke email tersebut."
      >
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-stone-700">Email user</span>
            <input
              type="email"
              required
              value={forgotEmail}
              onChange={(event) => setForgotEmail(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-primary focus:bg-white"
              placeholder="nama@email.com"
            />
          </label>
          {forgotNotice ? (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-600">
              <p>{forgotNotice}</p>
              {forgotPreviewUrl ? (
                <Link href={forgotPreviewUrl} className="mt-2 inline-block font-semibold text-primary hover:underline">
                  Buka link reset lokal
                </Link>
              ) : null}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={forgotLoading}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary disabled:opacity-60"
          >
            {forgotLoading ? 'Mengirim email reset...' : 'Kirim reset password'}
          </button>
        </form>
      </AuthDialog>

      <AuthDialog
        open={resetOpen}
        onClose={closeResetDialog}
        title="Buat password baru"
        description="Masukkan password baru dan konfirmasi password untuk mengaktifkan ulang akses ke CMS."
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-stone-700">Email</span>
            <input
              type="email"
              value={resetEmail}
              readOnly
              className="w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-600 outline-none"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-stone-700">Password baru</span>
            <input
              type="password"
              required
              value={resetPassword}
              onChange={(event) => setResetPassword(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-primary focus:bg-white"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-stone-700">Konfirmasi password baru</span>
            <input
              type="password"
              required
              value={resetConfirmPassword}
              onChange={(event) => setResetConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-primary focus:bg-white"
            />
          </label>
          {resetError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {resetError}
            </div>
          ) : null}
          {resetNotice ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {resetNotice}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={resetLoading}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary disabled:opacity-60"
          >
            {resetLoading ? 'Menyimpan password baru...' : 'Simpan password baru'}
          </button>
        </form>
      </AuthDialog>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  )
}
