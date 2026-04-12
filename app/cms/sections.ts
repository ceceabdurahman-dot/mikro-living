export type SectionId =
  | 'dashboard'
  | 'settings'
  | 'projects'
  | 'blog'
  | 'services'
  | 'testimonials'
  | 'team'
  | 'leads'
  | 'users'

export const cmsSectionIds: SectionId[] = [
  'dashboard',
  'settings',
  'projects',
  'blog',
  'services',
  'testimonials',
  'team',
  'leads',
  'users',
]

export const isCmsSection = (value: string): value is SectionId =>
  cmsSectionIds.includes(value as SectionId)

export const buildCmsPath = (section: SectionId) => `/cms/${section}`
