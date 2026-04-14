'use client'

import type { FormEvent } from 'react'
import { useState, useTransition } from 'react'

type SubmissionState =
  | { tone: 'idle'; message: string }
  | { tone: 'success'; message: string }
  | { tone: 'error'; message: string }

const initialState: SubmissionState = {
  tone: 'idle',
  message: 'Your consultation brief will be routed through the studio intake endpoint when it is available.',
}

export function ContactIntakeForm() {
  const [submissionState, setSubmissionState] = useState<SubmissionState>(initialState)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      projectType: String(formData.get('projectType') || '').trim(),
      timeline: String(formData.get('timeline') || '').trim(),
      brief: String(formData.get('brief') || '').trim(),
      company: String(formData.get('company') || '').trim(),
    }

    startTransition(async () => {
      setSubmissionState(initialState)

      try {
        const response = await fetch('/api/consultations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        const result = (await response.json().catch(() => null)) as
          | { message?: string }
          | null

        if (!response.ok) {
          setSubmissionState({
            tone: 'error',
            message: result?.message || 'The consultation request could not be sent right now.',
          })
          return
        }

        form.reset()
        setSubmissionState({
          tone: 'success',
          message: result?.message || 'Consultation request sent successfully.',
        })
      } catch {
        setSubmissionState({
          tone: 'error',
          message: 'The consultation service is unreachable right now. Please try again shortly.',
        })
      }
    })
  }

  return (
    <form className="px-6 py-7 sm:px-8 sm:py-9" onSubmit={handleSubmit}>
      <input
        aria-hidden="true"
        autoComplete="off"
        className="hidden"
        name="company"
        tabIndex={-1}
        type="text"
      />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-on-surface">
          Name
          <input
            required
            autoComplete="name"
            name="name"
            type="text"
            placeholder="Your name"
            className="rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-on-surface">
          Email
          <input
            required
            autoComplete="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className="rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-on-surface">
          Project type
          <input
            required
            name="projectType"
            type="text"
            placeholder="Apartment, residence, or studio"
            className="rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-on-surface">
          Timing
          <input
            required
            name="timeline"
            type="text"
            placeholder="Preferred start month or handover target"
            className="rounded-2xl border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary"
          />
        </label>
      </div>

      <label className="mt-5 grid gap-2 text-sm font-medium text-on-surface">
        Project brief
        <textarea
          required
          name="brief"
          rows={6}
          placeholder="Tell us about the room, the mood you want, what feels unresolved, and how the space should support daily life more clearly."
          className="rounded-[1.5rem] border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary"
        />
      </label>

      <div className="mt-6 rounded-[1.5rem] bg-stone-950 p-5 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-sm leading-7 text-stone-300">
              The form now attempts to send directly to the studio intake API. If the backend is
              unavailable, you&apos;ll see a clear status here instead of a silent failure.
            </p>
            <p
              aria-live="polite"
              className={`mt-3 text-xs font-bold uppercase tracking-[0.22em] ${
                submissionState.tone === 'success'
                  ? 'text-primary-fixed-dim'
                  : submissionState.tone === 'error'
                    ? 'text-rose-300'
                    : 'text-stone-500'
              }`}
            >
              {submissionState.message}
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isPending ? 'Sending brief...' : 'Send consultation brief'}
          </button>
        </div>
      </div>
    </form>
  )
}
