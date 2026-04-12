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
import { getHomepageData } from '../lib/homepage'

export default async function Home() {
  const { projects, services, testimonial, posts, stats } = await getHomepageData()

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="pt-20">
        <HeroSection stats={stats.hero} />
        <MarqueeStrip />
        <StudioSection highlights={stats.studio} />
        <SignatureProjects projects={projects} />
        <OurServices services={services} />
        <DesignProcess />
        <Testimonial testimonial={testimonial} />
        <LatestInsights posts={posts} />
        <FooterCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <ConsultationModal />
    </>
  )
}
