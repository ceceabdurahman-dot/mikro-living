export type Project = {
  slug: string
  title: string
  location: string
  size: string
  category: string
  year: string
  summary: string
  description: string
  image: string
  scope: string[]
}

export type Post = {
  slug: string
  category: string
  title: string
  excerpt: string
  summary: string
  image: string
  sections: string[]
}

export type Service = {
  slug: string
  title: string
  description: string
  detail: string
}

export const siteMeta = {
  name: 'MikroLiving',
  title: 'MikroLiving | Designing Smart Living Spaces',
  description:
    'Creating elegant and functional interiors that resonate with your lifestyle and personality. Studio interior design Jakarta & Bandung.',
  url: 'https://mikroliving.id',
  locale: 'id_ID',
  keywords: [
    'interior design',
    'smart living',
    'apartment design',
    'Jakarta',
    'Bandung',
    'desain interior',
    'mikroliving',
  ],
}

export const navigation = [
  { label: 'Studio', href: '/#studio' },
  { label: 'Services', href: '/#services' },
  { label: 'Portfolio', href: '/#portfolio' },
  { label: 'Process', href: '/#process' },
  { label: 'Insights', href: '/#insights' },
]

export const heroStats = [
  { value: '150+', label: 'Projects' },
  { value: '98%', label: 'Satisfaction' },
  { value: '10+', label: 'Years Exp.' },
]

export const studioHighlights = [
  { value: '2014', label: 'Studio Founded' },
  { value: '3', label: 'Cities Active' },
  { value: '12', label: 'Design Awards' },
]

export const keywords = [
  'Interior Design',
  'Apartment Living',
  'Custom Furniture',
  'Design & Build',
  'Smart Spaces',
  'Earth Tones',
  'Micro Living',
]

export const services: Service[] = [
  {
    slug: 'interior-design',
    title: 'Interior Design',
    description:
      'Comprehensive conceptual and technical planning for homes, apartments, and hospitality-ready spaces.',
    detail:
      'We shape layout, lighting, materials, and storage systems into one calm spatial story.',
  },
  {
    slug: 'apartment-design',
    title: 'Apartment Design',
    description:
      'Compact-living solutions tuned for vertical cities, small footprints, and a polished everyday rhythm.',
    detail:
      'Every square meter is treated as working space, not leftover space.',
  },
  {
    slug: 'custom-furniture',
    title: 'Custom Furniture',
    description:
      'Built-in joinery and bespoke pieces sized precisely to the home, the resident, and the storage brief.',
    detail:
      'We combine visual warmth with utility so the room feels lighter, not busier.',
  },
  {
    slug: 'design-build',
    title: 'Design & Build',
    description:
      'Integrated coordination from concept to site handover for clients who want one design voice end to end.',
    detail:
      'The result is smoother execution, cleaner detailing, and fewer translation gaps during delivery.',
  },
]

export const processSteps = [
  {
    step: '01',
    title: 'Listen to the life inside the space',
    description:
      'We start with routines, constraints, and the emotional tone you want the home to carry every day.',
  },
  {
    step: '02',
    title: 'Shape the layout before styling it',
    description:
      'Circulation, zoning, and storage logic come first so the final design feels effortless and durable.',
  },
  {
    step: '03',
    title: 'Refine materials with a compact-luxury lens',
    description:
      'Warm finishes, tactile contrasts, and restrained color decisions keep the rooms elegant and legible.',
  },
  {
    step: '04',
    title: 'Deliver with controlled detailing',
    description:
      'We document, coordinate, and sequence the implementation so the built result matches the narrative.',
  },
]

export const projects: Project[] = [
  {
    slug: 'the-botanica-suite',
    title: 'The Botanica Suite',
    location: 'Jakarta Selatan',
    size: '45 sqm',
    category: 'Apartment',
    year: '2025',
    summary:
      'A warm apartment renewal focused on hidden storage, layered lighting, and a calmer hospitality feel.',
    description:
      'This compact apartment was reshaped into a quieter daily environment with full-height cabinetry, softer transitions between living and dining, and a palette that leans earthy without turning flat.',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
    scope: ['Interior design', 'Custom millwork', 'Styling direction'],
  },
  {
    slug: 'kemang-courtyard-home',
    title: 'Kemang Courtyard Home',
    location: 'Jakarta Selatan',
    size: '185 sqm',
    category: 'Residence',
    year: '2024',
    summary:
      'A family residence organized around daylight, textured oak surfaces, and a strong indoor-outdoor rhythm.',
    description:
      'The home pairs grounded materials with measured geometry to keep the open plan connected while still giving each zone a clear mood.',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    scope: ['Interior architecture', 'Furniture curation', 'Styling'],
  },
  {
    slug: 'bdg-studio-loft',
    title: 'Bandung Studio Loft',
    location: 'Bandung',
    size: '36 sqm',
    category: 'Studio Apartment',
    year: '2026',
    summary:
      'A compact loft concept designed around hidden utility, oak detailing, and visual quietness.',
    description:
      'This studio layout prioritizes integrated storage and a lighter floor plane so the footprint feels generous without losing function.',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    scope: ['Space planning', 'Built-in design', 'Material palette'],
  },
]

export const posts: Post[] = [
  {
    slug: 'maximizing-space-compact-apartments',
    category: 'Trends',
    title: 'Maximizing Space in Compact Apartments',
    excerpt:
      'Discover clever furniture hacks and architectural tricks to make small spaces feel twice their size.',
    summary:
      'A tighter home does not need more objects. It needs clearer hierarchy, fewer visual interruptions, and storage that disappears into the architecture.',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80',
    sections: [
      'Start with sightlines. Keep the first view calm and long so the room reads larger before details enter the frame.',
      'Give every bulky function one integrated home. The more storage behaves like architecture, the more breathable the room becomes.',
      'Use one grounded material family across multiple zones to reduce fragmentation and visual noise.',
    ],
  },
  {
    slug: 'warm-materials-smart-storage',
    category: 'Materials',
    title: 'Warm Materials, Smart Storage',
    excerpt:
      'Why the best compact interiors feel emotional and efficient at the same time.',
    summary:
      'The strongest small-space projects make utility feel tactile. Warm timbers, stone look surfaces, and muted fabrics soften the discipline that compact planning requires.',
    image:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80',
    sections: [
      'Storage should not be an afterthought. It is one of the main visual decisions in a compact room.',
      'Warm material choices keep integrated joinery from feeling overly technical or severe.',
      'A limited palette does not reduce character. It lets craftsmanship and proportion do the talking.',
    ],
  },
  {
    slug: 'designing-for-rental-upgrades',
    category: 'Guides',
    title: 'Designing for Rental Upgrades',
    excerpt:
      'A practical framework for improving rented homes without fighting the building shell.',
    summary:
      'Rental upgrades work best when they focus on removable layers, flexible furniture, and strategic lighting rather than expensive permanence.',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
    sections: [
      'Upgrade the atmosphere before the envelope. Lighting, textiles, and furniture scale change the room quickly.',
      'Use freestanding pieces with architectural proportions so the space feels designed, not temporary.',
      'Build around what you can control and let the existing shell become quiet background, not the headline.',
    ],
  },
]

export const testimonial = {
  name: 'Sarah & Dimas',
  title: 'The Botanica Apartments',
  content:
    'MikroLiving transformed our 45 sqm apartment into a sanctuary. Their attention to storage solutions and aesthetic flow is unmatched.',
}
