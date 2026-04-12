require('./loadEnv').loadEnv()
const bcrypt = require('bcryptjs')
const { sequelize } = require('./database')
const { User, Service, SiteSetting, Project, Testimonial, BlogPost } = require('../models')

const services = [
  {
    title: 'Interior Design',
    slug: 'interior-design',
    description:
      'Comprehensive conceptual and technical planning for any space. From studio apartments to grand residences.',
    icon: 'ID',
    features: ['Konsultasi awal', 'Moodboard dan konsep', 'Gambar kerja 2D/3D', 'Desain furniture', 'RAB detail'],
    sort_order: 1,
  },
  {
    title: 'Apartment Design',
    slug: 'apartment-design',
    description:
      'Specialized solutions for compact living and high-rise dwellings, maximizing every square meter.',
    icon: 'AD',
    features: ['Space planning', 'Storage optimization', 'Built-in furniture', 'Lighting design', 'Material selection'],
    sort_order: 2,
  },
  {
    title: 'Custom Furniture',
    slug: 'custom-furniture',
    description:
      "Bespoke pieces crafted specifically for your home's exact dimensions and aesthetic vision.",
    icon: 'CF',
    features: ['Desain custom', 'Material premium', 'Produksi lokal', 'Quality control', 'Garansi 2 tahun'],
    sort_order: 3,
  },
  {
    title: 'Design & Build',
    slug: 'design-and-build',
    description:
      'Integrated project management from concept to completion, with one studio and full accountability.',
    icon: 'DB',
    features: ['Full project management', 'Koordinasi kontraktor', 'Pengadaan material', 'Quality inspection', 'Handover report'],
    sort_order: 4,
  },
]

const settings = [
  { key: 'site_name', value: 'MikroLiving', type: 'text', label: 'Nama Situs', group: 'general' },
  { key: 'site_tagline', value: 'Designing Smart Living Spaces', type: 'text', label: 'Tagline', group: 'general' },
  { key: 'site_description', value: 'Creating Elegant & Functional Interiors that resonate with your lifestyle and personality.', type: 'text', label: 'Deskripsi', group: 'general' },
  { key: 'hero_badge', value: 'Jakarta Selatan Featured Project', type: 'text', label: 'Hero Badge', group: 'homepage' },
  { key: 'hero_title_prefix', value: 'Designing', type: 'text', label: 'Hero Title Prefix', group: 'homepage' },
  { key: 'hero_title_emphasis', value: 'Smart', type: 'text', label: 'Hero Title Emphasis', group: 'homepage' },
  { key: 'hero_title_suffix', value: 'Living Spaces', type: 'text', label: 'Hero Title Suffix', group: 'homepage' },
  { key: 'hero_description', value: 'Creating elegant and functional interiors that resonate with your lifestyle and personality.', type: 'text', label: 'Hero Description', group: 'homepage' },
  { key: 'hero_primary_cta_label', value: 'View Portfolio', type: 'text', label: 'Hero Primary CTA Label', group: 'homepage' },
  { key: 'hero_primary_cta_href', value: '/projects', type: 'text', label: 'Hero Primary CTA Href', group: 'homepage' },
  { key: 'hero_secondary_cta_label', value: 'Explore Insights', type: 'text', label: 'Hero Secondary CTA Label', group: 'homepage' },
  { key: 'hero_secondary_cta_href', value: '/blog', type: 'text', label: 'Hero Secondary CTA Href', group: 'homepage' },
  { key: 'hero_image_url', value: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', type: 'text', label: 'Hero Image URL', group: 'homepage' },
  { key: 'hero_image_alt', value: 'Luxurious modern living room with warm wood accents', type: 'text', label: 'Hero Image Alt', group: 'homepage' },
  { key: 'hero_highlight_label', value: 'Apartment Highlight', type: 'text', label: 'Hero Highlight Label', group: 'homepage' },
  { key: 'hero_highlight_title', value: 'The Botanica Suite', type: 'text', label: 'Hero Highlight Title', group: 'homepage' },
  { key: 'hero_highlight_meta', value: 'Jakarta Selatan / 2024', type: 'text', label: 'Hero Highlight Meta', group: 'homepage' },
  { key: 'hero_stat_projects_label', value: 'Projects', type: 'text', label: 'Hero Projects Label', group: 'homepage' },
  { key: 'hero_stat_satisfaction_label', value: 'Satisfaction', type: 'text', label: 'Hero Satisfaction Label', group: 'homepage' },
  { key: 'hero_stat_experience_label', value: 'Years Exp.', type: 'text', label: 'Hero Experience Label', group: 'homepage' },
  { key: 'studio_founded', value: '2014', type: 'text', label: 'Tahun Berdiri', group: 'general' },
  { key: 'stat_projects', value: '150+', type: 'text', label: 'Jumlah Proyek', group: 'stats' },
  { key: 'stat_satisfaction', value: '98%', type: 'text', label: 'Kepuasan Klien', group: 'stats' },
  { key: 'stat_experience', value: '10+', type: 'text', label: 'Tahun Pengalaman', group: 'stats' },
  { key: 'stat_cities', value: '3', type: 'text', label: 'Kota Aktif', group: 'stats' },
  { key: 'stat_awards', value: '12', type: 'number', label: 'Design Awards', group: 'stats' },
  { key: 'stat_awards_enabled', value: 'true', type: 'text', label: 'Aktifkan Design Awards', group: 'stats' },
  { key: 'stat_project_experience', value: '12+', type: 'text', label: 'Pengalaman Project', group: 'stats' },
  { key: 'studio_eyebrow', value: 'Our Studio', type: 'text', label: 'Studio Eyebrow', group: 'homepage' },
  { key: 'studio_title_prefix', value: 'Where Craft Meets', type: 'text', label: 'Studio Title Prefix', group: 'homepage' },
  { key: 'studio_title_emphasis', value: 'Intention', type: 'text', label: 'Studio Title Emphasis', group: 'homepage' },
  { key: 'studio_intro', value: 'MikroLiving was born from a belief that small spaces deserve the same thoughtfulness as grand ones. We combine data-driven spatial planning with artisanal craftsmanship to deliver interiors that are deeply personal.', type: 'text', label: 'Studio Intro', group: 'homepage' },
  { key: 'studio_body', value: 'Our team of designers and builders works across Jakarta, Bandung, and Surabaya, bringing a unified vision to every project regardless of scale.', type: 'text', label: 'Studio Body', group: 'homepage' },
  { key: 'studio_philosophy_label', value: 'Design Philosophy', type: 'text', label: 'Studio Philosophy Label', group: 'homepage' },
  { key: 'studio_philosophy_quote', value: 'Form follows feeling, not just function.', type: 'text', label: 'Studio Philosophy Quote', group: 'homepage' },
  { key: 'studio_image_url', value: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWrxWwFE7aWl7pAMC0kgHeKkU1ZwRZ4_8IDa49kpU6O9RhU3n1r5CjWvNp7ZHi1Rlsvf7r9H1WRQlvTrIkP8OLL7dKPvygDeCYzC_VkYVcHMtmlazUuVPUlDycBGVzEyeV_ak7KOJaNLZw5pE7q7fOuwI8TdHSWX455h8MmSi0bzw5fU7nNco1s5T3dJgupC1FQoTE1OHtQ_DGPqhDVvxrSydhWTQs3ASeXLBcGuVyucDycxdFYppDERaKz4uAAh4CduBNUdar-PZX', type: 'text', label: 'Studio Image URL', group: 'homepage' },
  { key: 'studio_cta_label', value: 'Meet the Team', type: 'text', label: 'Studio CTA Label', group: 'homepage' },
  { key: 'marquee_items', value: '[\"Interior Design\",\"Apartment Living\",\"Custom Furniture\",\"Design & Build\",\"Smart Spaces\",\"Earth Tones\",\"Micro Living\"]', type: 'json', label: 'Marquee Items', group: 'homepage' },
  { key: 'public_headline_font_family', value: '"Noto Serif", Georgia, serif', type: 'text', label: 'Public Headline Font Family', group: 'theme' },
  { key: 'public_primary_color', value: '#785600', type: 'text', label: 'Public Primary Color', group: 'theme' },
  { key: 'contact_phone', value: '+62 812-3456-7890', type: 'text', label: 'No. Telepon', group: 'contact' },
  { key: 'contact_email', value: 'hello@mikroliving.com', type: 'text', label: 'Email', group: 'contact' },
  { key: 'contact_address', value: 'Jl. Kemang Raya No. 45, Jakarta Selatan 12730', type: 'text', label: 'Alamat', group: 'contact' },
  { key: 'contact_whatsapp', value: '6281234567890', type: 'text', label: 'Nomor WhatsApp', group: 'contact' },
  { key: 'social_instagram', value: 'https://instagram.com/mikroliving', type: 'text', label: 'Instagram', group: 'social' },
  { key: 'social_linkedin', value: 'https://linkedin.com/company/mikroliving', type: 'text', label: 'LinkedIn', group: 'social' },
  { key: 'social_pinterest', value: 'https://pinterest.com/mikroliving', type: 'text', label: 'Pinterest', group: 'social' },
  { key: 'seo_title', value: 'MikroLiving | Designing Smart Living Spaces', type: 'text', label: 'SEO Title', group: 'seo' },
  { key: 'seo_description', value: 'Studio desain interior terpercaya di Jakarta dan Bandung. Spesialis apartemen kecil dan hunian modern.', type: 'text', label: 'SEO Description', group: 'seo' },
  { key: 'seo_keywords', value: 'desain interior jakarta, interior apartemen, mikroliving', type: 'text', label: 'SEO Keywords', group: 'seo' },
]

const seed = async () => {
  try {
    console.log('Seeding database...')
    await sequelize.authenticate()

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'Admin@Mikro2024!',
      12
    )

    const [admin] = await User.findOrCreate({
      where: { email: process.env.ADMIN_EMAIL || 'admin@mikroliving.com' },
      defaults: {
        name: process.env.ADMIN_NAME || 'MikroLiving Admin',
        password: hashedPassword,
        role: 'superadmin',
        is_active: true,
      },
    })
    console.log('Admin user seeded')

    for (const service of services) {
      await Service.findOrCreate({ where: { slug: service.slug }, defaults: service })
    }
    console.log('Services seeded')

    for (const setting of settings) {
      await SiteSetting.findOrCreate({ where: { key: setting.key }, defaults: setting })
    }
    console.log('Site settings seeded')

    const [project] = await Project.findOrCreate({
      where: { slug: 'the-botanica-suite' },
      defaults: {
        title: 'The Botanica Suite',
        description:
          'Transformasi apartment 45m2 menjadi sanctuary modern dengan solusi storage cerdas dan estetika earth tone yang menenangkan.',
        location: 'Jakarta Selatan',
        area_sqm: 45,
        category: 'apartment',
        status: 'published',
        is_featured: true,
        year_completed: 2024,
        client_name: 'Sarah & Dimas',
        sort_order: 1,
      },
    })
    console.log('Sample project seeded')

    await Testimonial.findOrCreate({
      where: { client_name: 'Sarah & Dimas' },
      defaults: {
        client_title: 'The Botanica Apartments',
        content:
          'MikroLiving transformed our 45sqm apartment into a sanctuary. Their attention to storage solutions and aesthetic flow is truly unmatched in the industry.',
        rating: 5,
        project_id: project.id,
        is_featured: true,
        is_active: true,
        sort_order: 1,
      },
    })
    console.log('Sample testimonial seeded')

    await BlogPost.findOrCreate({
      where: { slug: 'maximizing-space-compact-apartments' },
      defaults: {
        title: 'Maximizing Space in Compact Apartments',
        excerpt:
          'Discover clever furniture hacks and architectural tricks to make small spaces feel twice their size.',
        content: '<p>Artikel lengkap tentang tips memaksimalkan ruang apartment kecil...</p>',
        category: 'trends',
        status: 'published',
        author_id: admin.id,
        tags: ['apartment', 'space-saving', 'tips'],
        read_time: 5,
        published_at: new Date(),
      },
    })
    console.log('Sample blog post seeded')

    console.log('Database seeding complete')
    console.log(`Admin login: ${process.env.ADMIN_EMAIL || 'admin@mikroliving.com'}`)
    console.log(`Password: ${process.env.ADMIN_PASSWORD || 'Admin@Mikro2024!'}`)
    process.exit(0)
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

seed()
