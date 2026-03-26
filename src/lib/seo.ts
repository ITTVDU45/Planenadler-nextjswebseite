import type { Metadata } from 'next'

const FALLBACK_SITE_URL = 'https://planenadler.de'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_SITE_URL).replace(/\/$/, '')
export const SITE_NAME = 'Planenadler'
export const DEFAULT_DESCRIPTION =
  'Massgeschneiderte PVC-Planen fuer Terrasse, Pool, Anhaenger und individuelle Abdeckungen von Planenadler.'
export const GOOGLE_SITE_VERIFICATION =
  process.env.GOOGLE_SITE_VERIFICATION?.trim() ??
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ??
  ''

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function buildCanonicalMetadata(
  path: string,
  title: string,
  description: string,
  options?: {
    image?: string
    type?: 'website' | 'article'
    noIndex?: boolean
  }
): Metadata {
  const canonical = absoluteUrl(path)
  const image = options?.image ? absoluteUrl(options.image) : absoluteUrl('/Planenadlerlogo.png')

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: options?.noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'de_DE',
      type: options?.type ?? 'website',
      images: [
        {
          url: image,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export const NOINDEX_ROBOTS: Metadata['robots'] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
}

export const INDEX_ROBOTS: Metadata['robots'] = {
  index: true,
  follow: true,
}
