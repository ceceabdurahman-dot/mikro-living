'use client'

import { useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'

type LogoutButtonProps = {
  className?: string
  label?: string
}

export function LogoutButton({
  className = '',
  label = 'Sign out',
}: LogoutButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleLogout() {
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      const payload = (await response.json().catch(() => null)) as { message?: string } | null

      if (!response.ok) {
        setErrorMessage(payload?.message || 'The workspace session could not be closed.')
        return
      }

      startTransition(() => {
        router.replace('/login')
        router.refresh()
      })
    } catch {
      setErrorMessage('The workspace session could not be closed right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const disabled = isSubmitting || isPending

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleLogout}
        disabled={disabled}
        className={className}
      >
        {disabled ? 'Signing out...' : label}
      </button>

      {errorMessage ? (
        <p className="text-sm leading-7 text-red-200">{errorMessage}</p>
      ) : null}
    </div>
  )
}
