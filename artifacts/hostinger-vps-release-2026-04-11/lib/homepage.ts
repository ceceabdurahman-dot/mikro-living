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

export interface HomeHero {
  badge: string
  titlePrefix: string
  titleEmphasis: string
  titleSuffix: string
  description: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  image: string
  imageAlt: string
  latestProjectLabel: string
  latestProjectTitle: string
  latestProjectMeta: string
}

export interface HomeStudio {
  eyebrow: string
  titlePrefix: string
  titleEmphasis: string
  intro: string
  body: string
  philosophyLabel: string
  philosophyQuote: string
  image: string
  ctaLabel: string
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
    { value: '12+', label: 'Pengalaman Project' },
  ],
}

const FALLBACK_HERO: HomeHero = {
  badge: 'Jakarta & Bandung Studio',
  titlePrefix: 'Designing',
  titleEmphasis: 'Smart',
  titleSuffix: 'Living Spaces',
  description:
    'Creating elegant and functional interiors that resonate with your lifestyle and personality.',
  primaryCtaLabel: 'View Portfolio',
  primaryCtaHref: '/projects',
  secondaryCtaLabel: 'Explore Insights',
  secondaryCtaHref: '/blog',
  image: FALLBACK_PROJECT_IMAGE,
  imageAlt: 'Luxurious modern living room with warm wood accents',
  latestProjectLabel: 'Latest Project',
  latestProjectTitle: 'The Botanica Suite',
  latestProjectMeta: 'Jakarta Selatan / 2024',
}

const FALLBACK_STUDIO: HomeStudio = {
  eyebrow: 'Our Studio',
  titlePrefix: 'Where Craft Meets',
  titleEmphasis: 'Intention',
  intro:
    'MikroLiving was born from a belief that small spaces deserve the same thoughtfulness as grand ones. We combine data-driven spatial planning with artisanal craftsmanship to deliver interiors that are deeply personal.',
  body:
    'Our team of designers and builders works across Jakarta, Bandung, and Surabaya, bringing a unified vision to every project regardless of scale.',
  philosophyLabel: 'Design Philosophy',
  philosophyQuote: 'Form follows feeling, not just function.',
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDWrxWwFE7aWl7pAMC0kgHeKkU1ZwRZ4_8IDa49kpU6O9RhU3n1r5CjWvNp7ZHi1Rlsvf7r9H1WRQlvTrIkP8OLL7dKPvygDeCYzC_VkYVcHMtmlazUuVPUlDycBGVzEyeV_ak7KOJaNLZw5pE7q7fOuwI8TdHSWX455h8MmSi0bzw5fU7nNco1s5T3dJgupC1FQoTE1OHtQ_DGPqhDVvxrSydhWTQs3ASeXLBcGuVyucDycxdFYppDERaKz4uAAh4CduBNUdar-PZX',
  ctaLabel: 'Meet the Team',
}

const FALLBACK_MARQUEE_ITEMS = [
  'Interior Design',
  'Apartment Living',
  'Custom Furniture',
  'Design & Build',
  'Smart Spaces',
  'Earth Tones',
  'Micro Living',
]

const titleCase = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const parseMarqueeItems = (value: string) => {
  if (!value) return FALLBACK_MARQUEE_ITEMS

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      const normalized = parsed.map((item) => String(item).trim()).filter(Boolean)
      if (normalized.length) return normalized
    }
  } catch {}

  const normalized = value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)

  return normalized.length ? normalized : FALLBACK_MARQUEE_ITEMS
}

const getSettingValue = async (key: string) => {
  const response = await fetchAPI<{ data?: { value?: string } }>(`/settings/${key}`)
  return response.data?.value || ''
}

export async function getHomepageData() {
  const [
    projectsResult,
    projectCountResult,
    servicesResult,
    testimonialsResult,
    postsResult,
    statProjectsResult,
    statSatisfactionResult,
    statExperienceResult,
    studioFoundedResult,
    statCitiesResult,
    statAwardsResult,
    statAwardsEnabledResult,
    statProjectExperienceResult,
    studioEyebrowResult,
    studioTitlePrefixResult,
    studioTitleEmphasisResult,
    studioIntroResult,
    studioBodyResult,
    studioPhilosophyLabelResult,
    studioPhilosophyQuoteResult,
    studioImageUrlResult,
    studioCtaLabelResult,
    marqueeItemsResult,
    heroBadgeResult,
    heroTitlePrefixResult,
    heroTitleEmphasisResult,
    heroTitleSuffixResult,
    heroDescriptionResult,
    heroPrimaryCtaLabelResult,
    heroPrimaryCtaHrefResult,
    heroSecondaryCtaLabelResult,
    heroSecondaryCtaHrefResult,
    heroImageUrlResult,
    heroImageAltResult,
    heroHighlightLabelResult,
    heroHighlightTitleResult,
    heroHighlightMetaResult,
    heroProjectsLabelResult,
    heroSatisfactionLabelResult,
    heroExperienceLabelResult,
  ] = await Promise.allSettled([
    projectsApi.getAll({ featured: true, limit: 4 }),
    projectsApi.getAll({ limit: 1 }),
    servicesApi.getAll(),
    testimonialsApi.getAll(true),
    blogApi.getAll({ limit: 3 }),
    getSettingValue('stat_projects'),
    getSettingValue('stat_satisfaction'),
    getSettingValue('stat_experience'),
    getSettingValue('studio_founded'),
    getSettingValue('stat_cities'),
    getSettingValue('stat_awards'),
    getSettingValue('stat_awards_enabled'),
    getSettingValue('stat_project_experience'),
    getSettingValue('studio_eyebrow'),
    getSettingValue('studio_title_prefix'),
    getSettingValue('studio_title_emphasis'),
    getSettingValue('studio_intro'),
    getSettingValue('studio_body'),
    getSettingValue('studio_philosophy_label'),
    getSettingValue('studio_philosophy_quote'),
    getSettingValue('studio_image_url'),
    getSettingValue('studio_cta_label'),
    getSettingValue('marquee_items'),
    getSettingValue('hero_badge'),
    getSettingValue('hero_title_prefix'),
    getSettingValue('hero_title_emphasis'),
    getSettingValue('hero_title_suffix'),
    getSettingValue('hero_description'),
    getSettingValue('hero_primary_cta_label'),
    getSettingValue('hero_primary_cta_href'),
    getSettingValue('hero_secondary_cta_label'),
    getSettingValue('hero_secondary_cta_href'),
    getSettingValue('hero_image_url'),
    getSettingValue('hero_image_alt'),
    getSettingValue('hero_highlight_label'),
    getSettingValue('hero_highlight_title'),
    getSettingValue('hero_highlight_meta'),
    getSettingValue('hero_stat_projects_label'),
    getSettingValue('hero_stat_satisfaction_label'),
    getSettingValue('hero_stat_experience_label'),
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

  const featuredProject =
    projectsResult.status === 'fulfilled' && projectsResult.value.data.length > 0
      ? projectsResult.value.data[0]
      : projectCountResult.status === 'fulfilled' && projectCountResult.value.data.length > 0
        ? projectCountResult.value.data[0]
        : null

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

  const totalProjects =
    projectCountResult.status === 'fulfilled' && typeof projectCountResult.value.meta?.total === 'number'
      ? projectCountResult.value.meta.total
      : null

  const studioFoundedValue =
    studioFoundedResult.status === 'fulfilled' && studioFoundedResult.value
      ? studioFoundedResult.value
      : FALLBACK_STATS.studio[0].value

  const parsedStudioFounded = Number.parseInt(String(studioFoundedValue), 10)
  const computedExperienceYears =
    Number.isFinite(parsedStudioFounded) && parsedStudioFounded > 1900
      ? `${Math.max(new Date().getFullYear() - parsedStudioFounded, 1)}+`
      : ''
  const awardsEnabled = !(
    statAwardsEnabledResult.status === 'fulfilled' &&
    String(statAwardsEnabledResult.value || '')
      .trim()
      .toLowerCase() === 'false'
  )

  const stats: HomeStats = {
    hero: [
      {
        value:
          statProjectsResult.status === 'fulfilled' && statProjectsResult.value
            ? statProjectsResult.value
            : totalProjects && totalProjects > 0
              ? `${totalProjects}`
              : FALLBACK_STATS.hero[0].value,
        label:
          heroProjectsLabelResult.status === 'fulfilled' && heroProjectsLabelResult.value
            ? heroProjectsLabelResult.value
            : FALLBACK_STATS.hero[0].label,
      },
      {
        value:
          statSatisfactionResult.status === 'fulfilled' && statSatisfactionResult.value
            ? statSatisfactionResult.value
            : FALLBACK_STATS.hero[1].value,
        label:
          heroSatisfactionLabelResult.status === 'fulfilled' && heroSatisfactionLabelResult.value
            ? heroSatisfactionLabelResult.value
            : FALLBACK_STATS.hero[1].label,
      },
      {
        value:
          statExperienceResult.status === 'fulfilled' && statExperienceResult.value
            ? statExperienceResult.value
            : computedExperienceYears || FALLBACK_STATS.hero[2].value,
        label:
          heroExperienceLabelResult.status === 'fulfilled' && heroExperienceLabelResult.value
            ? heroExperienceLabelResult.value
            : FALLBACK_STATS.hero[2].label,
      },
    ],
    studio: [
      {
        value: studioFoundedValue,
        label: 'Studio Founded',
      },
      {
        value:
          statCitiesResult.status === 'fulfilled' && statCitiesResult.value
            ? statCitiesResult.value
            : FALLBACK_STATS.studio[1].value,
        label: 'Cities Active',
      },
      ...(awardsEnabled
        ? [
            {
              value:
                statAwardsResult.status === 'fulfilled' && statAwardsResult.value
                  ? statAwardsResult.value
                  : FALLBACK_STATS.studio[2].value,
              label: 'Design Awards',
            },
          ]
        : []),
      {
        value:
          statProjectExperienceResult.status === 'fulfilled' && statProjectExperienceResult.value
            ? statProjectExperienceResult.value
            : FALLBACK_STATS.studio[3].value,
        label: 'Pengalaman Project',
      },
    ],
  }

  const hero: HomeHero = {
    badge:
      heroBadgeResult.status === 'fulfilled' && heroBadgeResult.value
        ? heroBadgeResult.value
        : featuredProject?.location
          ? `${featuredProject.location} Featured Project`
          : FALLBACK_HERO.badge,
    titlePrefix:
      heroTitlePrefixResult.status === 'fulfilled' && heroTitlePrefixResult.value
        ? heroTitlePrefixResult.value
        : FALLBACK_HERO.titlePrefix,
    titleEmphasis:
      heroTitleEmphasisResult.status === 'fulfilled' && heroTitleEmphasisResult.value
        ? heroTitleEmphasisResult.value
        : FALLBACK_HERO.titleEmphasis,
    titleSuffix:
      heroTitleSuffixResult.status === 'fulfilled' && heroTitleSuffixResult.value
        ? heroTitleSuffixResult.value
        : FALLBACK_HERO.titleSuffix,
    description:
      heroDescriptionResult.status === 'fulfilled' && heroDescriptionResult.value
        ? heroDescriptionResult.value
        : FALLBACK_HERO.description,
    primaryCtaLabel:
      heroPrimaryCtaLabelResult.status === 'fulfilled' && heroPrimaryCtaLabelResult.value
        ? heroPrimaryCtaLabelResult.value
        : FALLBACK_HERO.primaryCtaLabel,
    primaryCtaHref:
      heroPrimaryCtaHrefResult.status === 'fulfilled' && heroPrimaryCtaHrefResult.value
        ? heroPrimaryCtaHrefResult.value
        : FALLBACK_HERO.primaryCtaHref,
    secondaryCtaLabel:
      heroSecondaryCtaLabelResult.status === 'fulfilled' && heroSecondaryCtaLabelResult.value
        ? heroSecondaryCtaLabelResult.value
        : FALLBACK_HERO.secondaryCtaLabel,
    secondaryCtaHref:
      heroSecondaryCtaHrefResult.status === 'fulfilled' && heroSecondaryCtaHrefResult.value
        ? heroSecondaryCtaHrefResult.value
        : FALLBACK_HERO.secondaryCtaHref,
    image:
      heroImageUrlResult.status === 'fulfilled' && heroImageUrlResult.value
        ? heroImageUrlResult.value
        : featuredProject?.cover_url || featuredProject?.images?.[0]?.url || FALLBACK_HERO.image,
    imageAlt:
      heroImageAltResult.status === 'fulfilled' && heroImageAltResult.value
        ? heroImageAltResult.value
        : featuredProject?.title
          ? `${featuredProject.title} by MikroLiving`
          : FALLBACK_HERO.imageAlt,
    latestProjectLabel:
      heroHighlightLabelResult.status === 'fulfilled' && heroHighlightLabelResult.value
        ? heroHighlightLabelResult.value
        : featuredProject?.category
          ? `${titleCase(featuredProject.category)} Highlight`
          : FALLBACK_HERO.latestProjectLabel,
    latestProjectTitle:
      heroHighlightTitleResult.status === 'fulfilled' && heroHighlightTitleResult.value
        ? heroHighlightTitleResult.value
        : featuredProject?.title || FALLBACK_HERO.latestProjectTitle,
    latestProjectMeta:
      heroHighlightMetaResult.status === 'fulfilled' && heroHighlightMetaResult.value
        ? heroHighlightMetaResult.value
        : [featuredProject?.location, featuredProject?.year_completed]
            .filter(Boolean)
            .join(' / ') || FALLBACK_HERO.latestProjectMeta,
  }

  const studio: HomeStudio = {
    eyebrow:
      studioEyebrowResult.status === 'fulfilled' && studioEyebrowResult.value
        ? studioEyebrowResult.value
        : FALLBACK_STUDIO.eyebrow,
    titlePrefix:
      studioTitlePrefixResult.status === 'fulfilled' && studioTitlePrefixResult.value
        ? studioTitlePrefixResult.value
        : FALLBACK_STUDIO.titlePrefix,
    titleEmphasis:
      studioTitleEmphasisResult.status === 'fulfilled' && studioTitleEmphasisResult.value
        ? studioTitleEmphasisResult.value
        : FALLBACK_STUDIO.titleEmphasis,
    intro:
      studioIntroResult.status === 'fulfilled' && studioIntroResult.value
        ? studioIntroResult.value
        : FALLBACK_STUDIO.intro,
    body:
      studioBodyResult.status === 'fulfilled' && studioBodyResult.value
        ? studioBodyResult.value
        : FALLBACK_STUDIO.body,
    philosophyLabel:
      studioPhilosophyLabelResult.status === 'fulfilled' && studioPhilosophyLabelResult.value
        ? studioPhilosophyLabelResult.value
        : FALLBACK_STUDIO.philosophyLabel,
    philosophyQuote:
      studioPhilosophyQuoteResult.status === 'fulfilled' && studioPhilosophyQuoteResult.value
        ? studioPhilosophyQuoteResult.value
        : FALLBACK_STUDIO.philosophyQuote,
    image:
      studioImageUrlResult.status === 'fulfilled' && studioImageUrlResult.value
        ? studioImageUrlResult.value
        : FALLBACK_STUDIO.image,
    ctaLabel:
      studioCtaLabelResult.status === 'fulfilled' && studioCtaLabelResult.value
        ? studioCtaLabelResult.value
        : FALLBACK_STUDIO.ctaLabel,
  }

  const marqueeItems = parseMarqueeItems(
    marqueeItemsResult.status === 'fulfilled' ? marqueeItemsResult.value : ''
  )

  return { projects, services, testimonial, posts, stats, hero, studio, marqueeItems }
}
