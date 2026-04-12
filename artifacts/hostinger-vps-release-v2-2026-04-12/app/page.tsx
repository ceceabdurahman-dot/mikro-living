import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import MarqueeStrip from '../components/MarqueeStrip'
import StudioSection from '../components/StudioSection'
import SignatureProjects from '../components/SignatureProjects'
import OurServices from '../components/OurServices'
import DesignProcess from '../components/DesignProcess'
import Testimonial from '../components/Testimonial'
import LatestInsights from '../components/LatestInsights'
import FooterCTA from '../components/FooterCTA'
import Footer from '../components/Footer'
import ScrollProgress from '../components/ScrollProgress'
import FloatingWhatsApp from '../components/FloatingWhatsApp'
import ConsultationModal from '../components/ConsultationModal'
import PublicTheme from '../components/PublicTheme'
import { getHomepageData } from '../lib/homepage'
import { getPublicWhatsAppNumber } from '../lib/publicContact'

export default async function Home() {
  const { projects, services, testimonial, posts, stats, hero, studio, marqueeItems } = await getHomepageData()
  const whatsAppNumber = await getPublicWhatsAppNumber()

  return (
    <PublicTheme>
      <ScrollProgress />
      <Navbar />
      <main className="pt-20">
        <HeroSection stats={stats.hero} hero={hero} />
        <MarqueeStrip items={marqueeItems} />
        <StudioSection highlights={stats.studio} studio={studio} />
        <SignatureProjects projects={projects} />
        <OurServices services={services} />
        <DesignProcess />
        <Testimonial testimonial={testimonial} />
        <LatestInsights posts={posts} />
        <FooterCTA stats={stats.hero} whatsAppNumber={whatsAppNumber} />
      </main>
      <Footer />
      <FloatingWhatsApp whatsAppNumber={whatsAppNumber} />
      <ConsultationModal />
    </PublicTheme>
  )
}
