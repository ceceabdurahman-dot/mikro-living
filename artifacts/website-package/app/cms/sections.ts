export type SectionId =
  | 'dashboard'
  | 'projects'
  | 'blog'
  | 'services'
  | 'testimonials'
  | 'team'
  | 'leads'

export const cmsSectionIds: SectionId[] = [
  'dashboard',
  'projects',
  'blog',
  'services',
  'testimonials',
  'team',
  'leads',
]

export const isCmsSection = (value: string): value is SectionId =>
  cmsSectionIds.includes(value as SectionId)

export const buildCmsPath = (section: SectionId) => `/cms/${section}`
