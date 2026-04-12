require('dotenv').config()
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
  { key: 'studio_founded', value: '2014', type: 'text', label: 'Tahun Berdiri', group: 'general' },
  { key: 'stat_projects', value: '150+', type: 'text', label: 'Jumlah Proyek', group: 'stats' },
  { key: 'stat_satisfaction', value: '98%', type: 'text', label: 'Kepuasan Klien', group: 'stats' },
  { key: 'stat_experience', value: '10+', type: 'text', label: 'Tahun Pengalaman', group: 'stats' },
  { key: 'stat_cities', value: '3', type: 'text', label: 'Kota Aktif', group: 'stats' },
  { key: 'stat_awards', value: '12', type: 'number', label: 'Design Awards', group: 'stats' },
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
