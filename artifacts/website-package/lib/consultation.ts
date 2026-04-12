export const CONSULTATION_MODAL_EVENT = 'mikroliving:open-consultation-modal'
export const DEFAULT_WHATSAPP_NUMBER = '6281234567890'

export const openConsultationModal = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(CONSULTATION_MODAL_EVENT))
}

export const getWhatsAppUrl = (message = 'Halo MikroLiving, saya ingin konsultasi.') =>
  `https://wa.me/${DEFAULT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
