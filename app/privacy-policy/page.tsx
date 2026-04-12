import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import PublicTheme from '../../components/PublicTheme'

const sections = [
  {
    title: '1. Informasi yang Kami Kumpulkan',
    body:
      'Kami dapat mengumpulkan informasi yang Anda kirimkan secara langsung melalui formulir konsultasi, termasuk nama, email, nomor telepon, lokasi proyek, dan kebutuhan layanan interior.',
  },
  {
    title: '2. Penggunaan Informasi',
    body:
      'Informasi tersebut digunakan untuk menindaklanjuti permintaan konsultasi, menyusun penawaran, berkomunikasi terkait proyek, serta meningkatkan kualitas layanan MikroLiving.',
  },
  {
    title: '3. Penyimpanan dan Keamanan',
    body:
      'Kami berupaya melindungi data pribadi dengan kontrol akses internal, pembatasan hak admin, dan penyimpanan data pada sistem yang dikelola secara terbatas untuk kebutuhan operasional.',
  },
  {
    title: '4. Pembagian ke Pihak Ketiga',
    body:
      'Kami tidak menjual data pribadi. Data hanya dapat dibagikan kepada vendor atau partner operasional yang relevan untuk pelaksanaan proyek, sepanjang diperlukan dan proporsional.',
  },
  {
    title: '5. Hak Pengguna',
    body:
      'Anda dapat meminta pembaruan, koreksi, atau penghapusan data yang pernah dikirimkan melalui website ini dengan menghubungi tim MikroLiving.',
  },
]

export default function PrivacyPolicyPage() {
  return (
    <PublicTheme>
      <Navbar />
      <main className="bg-background px-6 pb-24 pt-32 md:px-8">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-outline-variant/15 bg-white p-8 shadow-sm md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-primary">Legal</p>
          <h1 className="mt-4 text-4xl font-headline text-on-surface md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant md:text-base">
            Halaman ini menjelaskan bagaimana MikroLiving mengumpulkan, menggunakan, dan
            melindungi informasi yang dikirimkan melalui website.
          </p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-xl font-semibold text-on-surface">{section.title}</h2>
                <p className="text-sm leading-7 text-on-surface-variant md:text-base">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </PublicTheme>
  )
}
