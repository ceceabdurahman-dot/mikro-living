import type { ReactNode } from 'react'

import Navbar from './Navbar'
import Footer from './Footer'
import FloatingWhatsApp from './FloatingWhatsApp'
import ConsultationModal from './ConsultationModal'
import PublicTheme from './PublicTheme'
import { getPublicWhatsAppNumber } from '../lib/publicContact'

export default async function PublicPageFrame({
  children,
}: {
  children: ReactNode
}) {
  const whatsAppNumber = await getPublicWhatsAppNumber()

  return (
    <PublicTheme>
      <Navbar />
      {children}
      <Footer />
      <FloatingWhatsApp whatsAppNumber={whatsAppNumber} />
      <ConsultationModal />
    </PublicTheme>
  )
}
