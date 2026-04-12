import fetchAPI, { blogApi, projectsApi, servicesApi, testimonialsApi } from './api'

const FALLBACK_PROJECT_IMAGE =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
const FALLBACK_POST_IMAGE =
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'

export interface HomeProject {
  id: number
  slug: string
  title: string
  location: string
  size: string
  category: string
  image: string
}

export interface HomeService {
  id: number
  slug: string
  title: string
  description: string
}

export interface HomePost {
  id: number
  slug: string
  category: string
  title: string
  excerpt: string
  image: string
}

export interface HomeTestimonial {
  id: number
  name: string
  title: string
  content: string
  rating: number
  avatarUrl?: string
}

export interface HomeStats {
  hero: Array<{ value: string; label: string }>
  studio: Array<{ value: string; label: string }>
}

const FALLBACK_STATS: HomeStats = {
  hero: [
    { value: '150+', label: 'Projects' },
    { value: '98%', label: 'Satisfaction' },
    { value: '10+', label: 'Years Exp.' },
  ],
  studio: [
    { value: '2014', label: 'Studio Founded' },
    { value: '3', label: 'Cities Active' },
    { value: '12', label: 'Design Awards' },
  ],
}

const titleCase = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const getSettingValue = async (key: string) => {
  const response = await fetchAPI<{ data?: { value?: string } }>(`/settings/${key}`)
  return response.data?.value || ''
}

export async function getHomepageData() {
  const [
    projectsResult,
    servicesResult,
    testimonialsResult,
    postsResult,
    statProjectsResult,
    statSatisfactionResult,
    statExperienceResult,
    studioFoundedResult,
    statCitiesResult,
    statAwardsResult,
  ] = await Promise.allSettled([
    projectsApi.getAll({ featured: true, limit: 4 }),
    servicesApi.getAll(),
    testimonialsApi.getAll(true),
    blogApi.getAll({ limit: 3 }),
    getSettingValue('stat_projects'),
    getSettingValue('stat_satisfaction'),
    getSettingValue('stat_experience'),
    getSettingValue('studio_founded'),
    getSettingValue('stat_cities'),
    getSettingValue('stat_awards'),
  ])

  const projects =
    projectsResult.status === 'fulfilled'
      ? projectsResult.value.data.map((project: any) => ({
          id: project.id,
          slug: project.slug,
          title: project.title,
          location: project.location || 'Indonesia',
          size: project.area_sqm ? `${project.area_sqm} m2` : 'Custom size',
          category: titleCase(project.category || 'Project'),
          image: project.cover_url || project.images?.[0]?.url || FALLBACK_PROJECT_IMAGE,
        }))
      : []

  const services =
    servicesResult.status === 'fulfilled'
      ? servicesResult.value.data.map((service: any) => ({
          id: service.id,
          slug: service.slug || '',
          title: service.title,
          description: service.description || 'Tailored interior design support for modern living.',
        }))
      : []

  const testimonial =
    testimonialsResult.status === 'fulfilled' && testimonialsResult.value.data.length > 0
      ? {
          id: testimonialsResult.value.data[0].id,
          name: testimonialsResult.value.data[0].client_name,
          title:
            testimonialsResult.value.data[0].client_title ||
            testimonialsResult.value.data[0].project?.title ||
            'MikroLiving Client',
          content: testimonialsResult.value.data[0].content,
          rating: testimonialsResult.value.data[0].rating || 5,
          avatarUrl: testimonialsResult.value.data[0].avatar_url || undefined,
        }
      : null

  const posts =
    postsResult.status === 'fulfilled'
      ? postsResult.value.data.map((post: any) => ({
          id: post.id,
          slug: post.slug,
          category: titleCase(post.category || 'Insights'),
          title: post.title,
          excerpt: post.excerpt || 'Explore practical interior insights from the MikroLiving studio.',
          image: post.cover_url || FALLBACK_POST_IMAGE,
        }))
      : []

  const stats: HomeStats = {
    hero: [
      {
        value:
          statProjectsResult.status === 'fulfilled' && statProjectsResult.value
            ? statProjectsResult.value
            : FALLBACK_STATS.hero[0].value,
        label: 'Projects',
      },
      {
        value:
          statSatisfactionResult.status === 'fulfilled' && statSatisfactionResult.value
            ? statSatisfactionResult.value
            : FALLBACK_STATS.hero[1].value,
        label: 'Satisfaction',
      },
      {
        value:
          statExperienceResult.status === 'fulfilled' && statExperienceResult.value
            ? statExperienceResult.value
            : FALLBACK_STATS.hero[2].value,
        label: 'Years Exp.',
      },
    ],
    studio: [
      {
        value:
          studioFoundedResult.status === 'fulfilled' && studioFoundedResult.value
            ? studioFoundedResult.value
            : FALLBACK_STATS.studio[0].value,
        label: 'Studio Founded',
      },
      {
        value:
          statCitiesResult.status === 'fulfilled' && statCitiesResult.value
            ? statCitiesResult.value
            : FALLBACK_STATS.studio[1].value,
        label: 'Cities Active',
      },
      {
        value:
          statAwardsResult.status === 'fulfilled' && statAwardsResult.value
            ? statAwardsResult.value
            : FALLBACK_STATS.studio[2].value,
        label: 'Design Awards',
      },
    ],
  }

  return { projects, services, testimonial, posts, stats }
}
