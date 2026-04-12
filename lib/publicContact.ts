import { settingsApi } from './api'
import { DEFAULT_WHATSAPP_NUMBER, normalizeWhatsAppNumber } from './consultation'

export async function getPublicWhatsAppNumber() {
  try {
    const response = await settingsApi.get('contact_whatsapp')
    const value = response.data?.value
    return normalizeWhatsAppNumber(value) || DEFAULT_WHATSAPP_NUMBER
  } catch {
    return DEFAULT_WHATSAPP_NUMBER
  }
}
