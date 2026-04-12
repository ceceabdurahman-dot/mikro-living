import fetchAPI from './api'

export type PublicThemeSettings = {
  headlineFontFamily: string
  primaryColor: string
}

const FALLBACK_PUBLIC_THEME: PublicThemeSettings = {
  headlineFontFamily: '"Noto Serif", Georgia, serif',
  primaryColor: '#785600',
}

const getSettingValue = async (key: string) => {
  const response = await fetchAPI<{ data?: { value?: string } }>(`/settings/${key}`)
  return response.data?.value || ''
}

const normalizeColor = (value: string) => {
  const trimmed = value.trim()
  return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(trimmed)
    ? trimmed
    : FALLBACK_PUBLIC_THEME.primaryColor
}

export async function getPublicThemeSettings(): Promise<PublicThemeSettings> {
  const [headlineResult, primaryColorResult] = await Promise.allSettled([
    getSettingValue('public_headline_font_family'),
    getSettingValue('public_primary_color'),
  ])

  return {
    headlineFontFamily:
      headlineResult.status === 'fulfilled' && headlineResult.value.trim()
        ? headlineResult.value.trim()
        : FALLBACK_PUBLIC_THEME.headlineFontFamily,
    primaryColor:
      primaryColorResult.status === 'fulfilled' && primaryColorResult.value.trim()
        ? normalizeColor(primaryColorResult.value)
        : FALLBACK_PUBLIC_THEME.primaryColor,
  }
}
