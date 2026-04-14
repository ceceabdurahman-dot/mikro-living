'use client'

import { useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'

type LoginFormProps = {
  redirectTarget: string
}

type LoginState = {
  email: string
  password: string
}

export function LoginForm({ redirectTarget }: LoginFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [formState, setFormState] = useState<LoginState>({
    email: '',
    password: '',
  })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formState.email,
          password: formState.password,
          redirect: redirectTarget,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; redirect?: string }
        | null

      if (!response.ok) {
        setErrorMessage(payload?.message || 'The sign-in request could not be completed.')
        return
      }

      const nextTarget = payload?.redirect || redirectTarget
      setSuccessMessage('Access granted. Redirecting to the workspace...')

      startTransition(() => {
        router.replace(nextTarget)
        router.refresh()
      })
    } catch {
      setErrorMessage('The sign-in request could not reach the authentication service.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const disabled = isSubmitting || isPending

  return (
    <form className="mt-6" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-on-surface">
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={formState.email}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            placeholder="admin@mikroliving.id"
            className="rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-on-surface">
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={formState.password}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder="Password"
            className="rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary"
          />
        </label>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-outline-variant/25 bg-stone-50 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
          Session policy
        </p>
        <p className="mt-3 text-sm leading-7 text-on-surface-variant">
          This login stores the access token in a secure HTTP-only cookie and revalidates CMS access
          against the backend on every protected entry.
        </p>
      </div>

      {errorMessage ? (
        <p className="mt-5 rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-7 text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mt-5 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-7 text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      <div className="mt-6 rounded-[1.5rem] bg-stone-950 p-5 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-xl text-sm leading-7 text-stone-300">
            The protected redirect target is preserved, so signing in returns you directly to the
            workspace route you came from.
          </p>
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-on-primary transition-opacity hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {disabled ? 'Signing in...' : 'Enter CMS'}
          </button>
        </div>
      </div>
    </form>
  )
}
