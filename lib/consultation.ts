export const CONSULTATION_MODAL_EVENT = 'mikroliving:open-consultation-modal'
export const DEFAULT_WHATSAPP_NUMBER = '6281234567890'
const DEFAULT_WHATSAPP_MESSAGE = 'Halo MikroLiving, saya ingin konsultasi.'

export const normalizeWhatsAppNumber = (value?: string | null) =>
  String(value || '')
    .replace(/[^\d]/g, '')
    .trim()

export const openConsultationModal = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(CONSULTATION_MODAL_EVENT))
}

export const getWhatsAppUrl = (
  message = DEFAULT_WHATSAPP_MESSAGE,
  number = DEFAULT_WHATSAPP_NUMBER
) => {
  const normalizedNumber = normalizeWhatsAppNumber(number) || DEFAULT_WHATSAPP_NUMBER
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`
}
