export const LEAD_SUBMITTED_EVENT = 'mikroliving:lead-submitted'
export const LEAD_SUBMITTED_STORAGE_KEY = 'mikroliving:last-lead-submission'

export type LeadSubmittedDetail = {
  id?: number
  name?: string
  email?: string
  timestamp: number
}

export const notifyLeadSubmitted = (detail: Omit<LeadSubmittedDetail, 'timestamp'> = {}) => {
  if (typeof window === 'undefined') return

  const payload: LeadSubmittedDetail = {
    ...detail,
    timestamp: Date.now(),
  }

  try {
    window.localStorage.setItem(LEAD_SUBMITTED_STORAGE_KEY, JSON.stringify(payload))
  } catch {}

  window.dispatchEvent(new CustomEvent(LEAD_SUBMITTED_EVENT, { detail: payload }))
}
