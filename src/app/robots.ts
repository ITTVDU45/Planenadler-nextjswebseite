import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/cart',
          '/checkout/',
          '/kasse',
          '/anmelden',
          '/mein-konto',
          '/mein-konto/',
          '/logg-inn',
          '/min-konto',
          '/handlekurv',
          '/~offline',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}

