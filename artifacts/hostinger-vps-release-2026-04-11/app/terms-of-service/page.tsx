import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import PublicTheme from '../../components/PublicTheme'

const sections = [
  {
    title: '1. Ruang Lingkup Layanan',
    body:
      'Website ini menyediakan informasi studio, portofolio, insight, dan formulir konsultasi untuk kebutuhan layanan desain interior MikroLiving.',
  },
  {
    title: '2. Penggunaan yang Diperbolehkan',
    body:
      'Pengguna setuju menggunakan website secara wajar, tidak menyalahgunakan formulir, tidak mencoba mengakses area admin tanpa izin, dan tidak melakukan tindakan yang mengganggu sistem.',
  },
  {
    title: '3. Akurasi Konten',
    body:
      'Kami berusaha menjaga informasi tetap akurat dan terbaru, namun detail layanan, timeline, dan penawaran proyek dapat berubah sesuai kebutuhan operasional dan kesepakatan kerja.',
  },
  {
    title: '4. Hak Kekayaan Intelektual',
    body:
      'Seluruh konten visual, teks, identitas merek, dan materi presentasi pada website ini tetap menjadi milik MikroLiving atau pihak yang memberikan lisensi resmi.',
  },
  {
    title: '5. Batasan Tanggung Jawab',
    body:
      'MikroLiving tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan website ini, termasuk gangguan layanan sementara, perubahan konten, atau tautan eksternal.',
  },
]

export default function TermsOfServicePage() {
  return (
    <PublicTheme>
      <Navbar />
      <main className="bg-background px-6 pb-24 pt-32 md:px-8">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-outline-variant/15 bg-white p-8 shadow-sm md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-primary">Legal</p>
          <h1 className="mt-4 text-4xl font-headline text-on-surface md:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant md:text-base">
            Dengan mengakses website ini, Anda menyetujui syarat penggunaan dasar yang berlaku
            untuk konten, layanan, dan interaksi melalui platform MikroLiving.
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
