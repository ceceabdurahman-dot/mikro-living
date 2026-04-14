import { NextResponse } from 'next/server'

import { getPosts, getProjects } from '@/lib/api'
import { siteMeta } from '@/lib/site-data'

export async function GET() {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()])
  const routes = [
    '/',
    '/projects',
    '/blog',
    '/contact',
    '/login',
    ...projects.map((project) => `/projects/${project.slug}`),
    ...posts.map((post) => `/blog/${post.slug}`),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `<url><loc>${siteMeta.url}${route}</loc></url>`).join('')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
