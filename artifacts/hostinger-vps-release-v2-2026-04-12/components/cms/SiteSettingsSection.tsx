'use client'

import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Save } from 'lucide-react'

import {
  clearLegacyAuthCookies,
  refreshSession,
} from '../../lib/authSession'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1'

const inputClassName =
  'w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-[13px] text-stone-800 outline-none transition focus:border-primary focus:bg-white'

type SettingsField = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'color' | 'checkbox'
  helper?: string
}

type SettingsSection = {
  group: string
  title: string
  superadminOnly?: boolean
  fields: SettingsField[]
}

const settingsBlueprint: SettingsSection[] = [
  {
    group: 'homepage',
    title: 'Hero Section',
    fields: [
      { key: 'hero_badge', label: 'Hero badge', type: 'text' },
      { key: 'hero_title_prefix', label: 'Hero title prefix', type: 'text' },
      { key: 'hero_title_emphasis', label: 'Hero title emphasis', type: 'text' },
      { key: 'hero_title_suffix', label: 'Hero title suffix', type: 'text' },
      { key: 'hero_description', label: 'Hero description', type: 'textarea' },
      { key: 'hero_primary_cta_label', label: 'Primary CTA label', type: 'text' },
      { key: 'hero_primary_cta_href', label: 'Primary CTA link', type: 'text' },
      { key: 'hero_secondary_cta_label', label: 'Secondary CTA label', type: 'text' },
      { key: 'hero_secondary_cta_href', label: 'Secondary CTA link', type: 'text' },
      { key: 'hero_image_url', label: 'Hero image URL', type: 'text' },
      { key: 'hero_image_alt', label: 'Hero image alt text', type: 'text' },
      { key: 'hero_highlight_label', label: 'Highlight label', type: 'text' },
      { key: 'hero_highlight_title', label: 'Highlight title', type: 'text' },
      { key: 'hero_highlight_meta', label: 'Highlight meta', type: 'text' },
      { key: 'hero_stat_projects_label', label: 'Projects stat label', type: 'text' },
      { key: 'hero_stat_satisfaction_label', label: 'Satisfaction stat label', type: 'text' },
      { key: 'hero_stat_experience_label', label: 'Experience stat label', type: 'text' },
    ],
  },
  {
    group: 'stats',
    title: 'Homepage Stats',
    fields: [
      { key: 'stat_projects', label: 'Projects count', type: 'text' },
      { key: 'stat_satisfaction', label: 'Satisfaction stat', type: 'text' },
      { key: 'stat_experience', label: 'Experience stat', type: 'text' },
    ],
  },
  {
    group: 'stats',
    title: 'Studio Stats',
    superadminOnly: true,
    fields: [
      { key: 'studio_founded', label: 'Studio founded', type: 'text' },
      { key: 'stat_cities', label: 'Cities active', type: 'text' },
      { key: 'stat_awards', label: 'Awards stat', type: 'text' },
      {
        key: 'stat_awards_enabled',
        label: 'Aktifkan Design Awards',
        type: 'checkbox',
        helper: 'Nonaktifkan jika angka Design Awards ingin disembunyikan dari section Our Studio di halaman public.',
      },
      {
        key: 'stat_project_experience',
        label: 'Pengalaman Project',
        type: 'text',
        helper:
          'Nilai ini tampil di blok statistik Studio pada halaman public dengan ukuran teks besar (text-3xl).',
      },
    ],
  },
  {
    group: 'homepage',
    title: 'Studio Section',
    fields: [
      { key: 'studio_eyebrow', label: 'Eyebrow', type: 'text' },
      { key: 'studio_title_prefix', label: 'Title prefix', type: 'text' },
      { key: 'studio_title_emphasis', label: 'Title emphasis', type: 'text' },
      { key: 'studio_intro', label: 'Intro paragraph', type: 'textarea' },
      { key: 'studio_body', label: 'Body paragraph', type: 'textarea' },
      { key: 'studio_philosophy_label', label: 'Philosophy label', type: 'text' },
      { key: 'studio_philosophy_quote', label: 'Philosophy quote', type: 'textarea' },
      { key: 'studio_image_url', label: 'Studio image URL', type: 'text' },
      { key: 'studio_cta_label', label: 'Studio CTA label', type: 'text' },
    ],
  },
  {
    group: 'homepage',
    title: 'Marquee Strip',
    fields: [
      {
        key: 'marquee_items',
        label: 'Marquee items',
        type: 'textarea',
        helper: 'Pisahkan item dengan tanda | atau isi dalam format JSON array.',
      },
    ],
  },
  {
    group: 'theme',
    title: 'Public Theme',
    superadminOnly: true,
    fields: [
      {
        key: 'public_headline_font_family',
        label: 'Headline font family',
        type: 'text',
        helper: 'Gunakan format font stack CSS, misalnya "Noto Serif", Georgia, serif.',
      },
      {
        key: 'public_primary_color',
        label: 'Primary accent color',
        type: 'color',
        helper: 'Dipakai untuk elemen public yang memakai utilitas text-primary.',
      },
    ],
  },
  {
    group: 'contact',
    title: 'Contact Channels',
    superadminOnly: true,
    fields: [
      {
        key: 'contact_whatsapp',
        label: 'No WhatsApp',
        type: 'text',
        helper: 'Gunakan format nomor internasional tanpa tanda +, misalnya 6281234567890.',
      },
    ],
  },
]

const defaultValues: Record<string, string> = {
  hero_badge: 'Jakarta Selatan Featured Project',
  hero_title_prefix: 'Designing',
  hero_title_emphasis: 'Smart',
  hero_title_suffix: 'Living Spaces',
  hero_description:
    'Creating elegant and functional interiors that resonate with your lifestyle and personality.',
  hero_primary_cta_label: 'View Portfolio',
  hero_primary_cta_href: '/projects',
  hero_secondary_cta_label: 'Explore Insights',
  hero_secondary_cta_href: '/blog',
  hero_image_url:
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  hero_image_alt: 'Luxurious modern living room with warm wood accents',
  hero_highlight_label: 'Apartment Highlight',
  hero_highlight_title: 'The Botanica Suite',
  hero_highlight_meta: 'Jakarta Selatan / 2024',
  hero_stat_projects_label: 'Projects',
  hero_stat_satisfaction_label: 'Satisfaction',
  hero_stat_experience_label: 'Years Exp.',
  stat_projects: '150+',
  stat_satisfaction: '98%',
  stat_experience: '10+',
  studio_founded: '2014',
  stat_cities: '3',
  stat_awards: '12',
  stat_awards_enabled: 'true',
  stat_project_experience: '12+',
  studio_eyebrow: 'Our Studio',
  studio_title_prefix: 'Where Craft Meets',
  studio_title_emphasis: 'Intention',
  studio_intro:
    'MikroLiving was born from a belief that small spaces deserve the same thoughtfulness as grand ones. We combine data-driven spatial planning with artisanal craftsmanship to deliver interiors that are deeply personal.',
  studio_body:
    'Our team of designers and builders works across Jakarta, Bandung, and Surabaya, bringing a unified vision to every project regardless of scale.',
  studio_philosophy_label: 'Design Philosophy',
  studio_philosophy_quote: 'Form follows feeling, not just function.',
  studio_image_url:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDWrxWwFE7aWl7pAMC0kgHeKkU1ZwRZ4_8IDa49kpU6O9RhU3n1r5CjWvNp7ZHi1Rlsvf7r9H1WRQlvTrIkP8OLL7dKPvygDeCYzC_VkYVcHMtmlazUuVPUlDycBGVzEyeV_ak7KOJaNLZw5pE7q7fOuwI8TdHSWX455h8MmSi0bzw5fU7nNco1s5T3dJgupC1FQoTE1OHtQ_DGPqhDVvxrSydhWTQs3ASeXLBcGuVyucDycxdFYppDERaKz4uAAh4CduBNUdar-PZX',
  studio_cta_label: 'Meet the Team',
  marquee_items: JSON.stringify(
    ['Interior Design', 'Apartment Living', 'Custom Furniture', 'Design & Build', 'Smart Spaces', 'Earth Tones', 'Micro Living'],
    null,
    2
  ),
  public_headline_font_family: '"Noto Serif", Georgia, serif',
  public_primary_color: '#785600',
  contact_whatsapp: '6281234567890',
}

async function authRequest<T>(endpoint: string, options: RequestInit = {}, allowRetry = true): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const payload = await response.json().catch(() => ({}))

  if (response.status === 401) {
    if (allowRetry) {
      const restored = await refreshSession()
      if (restored) {
        return authRequest<T>(endpoint, options, false)
      }
    }

    clearLegacyAuthCookies()
    window.location.replace('/login?redirect=%2Fcms')
    throw new Error('Sesi Anda berakhir. Silakan login ulang.')
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Permintaan ke server gagal.')
  }

  return payload
}

export default function SiteSettingsSection({
  currentUserRole,
}: {
  currentUserRole: string
}) {
  const canManageSettings = currentUserRole === 'admin' || currentUserRole === 'superadmin'
  const visibleSections = useMemo(
    () =>
      settingsBlueprint.filter(
        (section) => !section.superadminOnly || currentUserRole === 'superadmin'
      ),
    [currentUserRole]
  )
  const [values, setValues] = useState<Record<string, string>>(defaultValues)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')

  const orderedKeys = useMemo(
    () => visibleSections.flatMap((section) => section.fields.map((field) => field.key)),
    [visibleSections]
  )

  const loadSettings = async () => {
    if (!canManageSettings) return

    try {
      setLoading(true)
      setError('')
      const payload = await authRequest<{ data: Record<string, Record<string, any>> }>('/settings')
      const nextValues = { ...defaultValues }

      Object.values(payload.data || {}).forEach((group) => {
        Object.entries(group || {}).forEach(([key, value]) => {
          nextValues[key] = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
        })
      })

      setValues(nextValues)
    } catch (err: any) {
      setError(err.message || 'Gagal memuat settings website.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSettings()
  }, [currentUserRole])

  const saveSettings = async () => {
    try {
      setSaving(true)
      setError('')
      setFlash('')

      for (const section of visibleSections) {
        for (const field of section.fields) {
          await authRequest(`/settings/${field.key}`, {
            method: 'PUT',
            body: JSON.stringify({
              value: values[field.key] ?? '',
              type: field.key === 'marquee_items' ? 'json' : 'text',
              label: field.label,
              group: section.group,
            }),
          })
        }
      }

      setFlash('Settings homepage berhasil diperbarui.')
      await loadSettings()
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan settings website.')
    } finally {
      setSaving(false)
    }
  }

  if (!canManageSettings) {
    return (
      <div className="rounded-[22px] border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-stone-500">Settings website hanya tersedia untuk admin dan superadmin.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-headline text-lg text-stone-900">Homepage settings</h3>
            <p className="mt-1 text-sm text-stone-500">
              Kelola konten homepage, stat utama, dan tampilan publik tanpa ubah kode.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void loadSettings()}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-3.5 py-2 text-[13px] font-semibold text-stone-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => void saveSettings()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Menyimpan...' : 'Save settings'}
            </button>
          </div>
        </div>
        {flash ? <p className="mt-3 text-sm text-emerald-700">{flash}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>

      {visibleSections.map((section) => (
        <div key={section.title} className="rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm">
          <h4 className="font-headline text-xl text-stone-900">{section.title}</h4>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {section.fields.map((field) => (
              <label
                key={field.key}
                className={`block space-y-1.5 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}
              >
                <span className="text-[13px] font-semibold text-stone-700">{field.label}</span>
                {field.type === 'textarea' ? (
                  <textarea
                    className={`${inputClassName} min-h-28`}
                    value={values[field.key] ?? ''}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                  />
                ) : field.type === 'color' ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      className="h-11 w-16 cursor-pointer rounded-xl border border-stone-200 bg-white p-1"
                      value={values[field.key] ?? defaultValues[field.key] ?? '#000000'}
                      onChange={(event) =>
                        setValues((current) => ({ ...current, [field.key]: event.target.value }))
                      }
                    />
                    <input
                      className={inputClassName}
                      value={values[field.key] ?? ''}
                      onChange={(event) =>
                        setValues((current) => ({ ...current, [field.key]: event.target.value }))
                      }
                    />
                  </div>
                ) : field.type === 'checkbox' ? (
                  <label className="inline-flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary"
                      checked={(values[field.key] ?? defaultValues[field.key] ?? 'false') === 'true'}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [field.key]: event.target.checked ? 'true' : 'false',
                        }))
                      }
                    />
                    <span className="text-sm font-medium text-stone-700">
                      {(values[field.key] ?? defaultValues[field.key] ?? 'false') === 'true'
                        ? 'Tampilkan di halaman public'
                        : 'Sembunyikan dari halaman public'}
                    </span>
                  </label>
                ) : (
                  <input
                    className={inputClassName}
                    value={values[field.key] ?? ''}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                  />
                )}
                {field.helper ? <p className="text-xs text-stone-500">{field.helper}</p> : null}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-[22px] border border-stone-200 bg-stone-50 p-4 text-xs leading-6 text-stone-500">
        <p className="font-semibold text-stone-700">Key yang dikelola panel ini:</p>
        <p className="mt-2">{orderedKeys.join(', ')}</p>
      </div>
    </div>
  )
}
