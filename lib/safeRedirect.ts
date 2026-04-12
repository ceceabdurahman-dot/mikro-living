const EXTERNAL_SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i

export function sanitizeInternalRedirect(
  value: string | null | undefined,
  fallback = '/cms'
) {
  if (!value) return fallback

  const trimmed = value.trim()
  if (!trimmed.startsWith('/')) return fallback
  if (trimmed.startsWith('//') || trimmed.includes('\\') || EXTERNAL_SCHEME_PATTERN.test(trimmed)) {
    return fallback
  }

  try {
    const decoded = decodeURIComponent(trimmed)
    if (decoded.startsWith('//') || decoded.startsWith('\\')) return fallback
  } catch {
    return fallback
  }

  try {
    const parsed = new URL(trimmed, 'http://localhost')
    if (parsed.origin !== 'http://localhost') return fallback

    return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback
  } catch {
    return fallback
  }
}
