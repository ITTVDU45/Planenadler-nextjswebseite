import { SITE_NAME, SITE_URL, absoluteUrl } from './seo'

export interface BreadcrumbListItem {
  name: string
  path: string
}

function getSameAsUrls(): string[] {
  return [
    process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_PROFILE_URL?.trim(),
    process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim(),
    process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim(),
    process.env.NEXT_PUBLIC_LINKEDIN_URL?.trim(),
    process.env.NEXT_PUBLIC_YOUTUBE_URL?.trim(),
  ].filter((value): value is string => Boolean(value))
}

export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/Planenadlerlogo.png'),
    email: 'post@planenadler.de',
    telephone: '+49 203 7385985',
    sameAs: getSameAsUrls(),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: '+49 203 7385985',
        email: 'post@planenadler.de',
        areaServed: 'DE',
        availableLanguage: ['de'],
      },
    ],
  }
}

export function getWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'de-DE',
  }
}

export function getLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_NAME,
    url: SITE_URL,
    image: absoluteUrl('/Planenadlerlogo.png'),
    sameAs: getSameAsUrls(),
    telephone: '+49 203 7385985',
    email: 'post@planenadler.de',
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Duesseldorfer Str. 387',
      postalCode: '47055',
      addressLocality: 'Duisburg',
      addressCountry: 'DE',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '14:00',
      },
    ],
  }
}

export function getWebPageJsonLd(name: string, path: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    url: absoluteUrl(path),
    description,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}

export function getContactPageJsonLd(name: string, path: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name,
    url: absoluteUrl(path),
    description,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      '@type': 'LocalBusiness',
      name: SITE_NAME,
      url: SITE_URL,
      telephone: '+49 203 7385985',
      email: 'post@planenadler.de',
    },
  }
}

export function getBreadcrumbJsonLd(items: BreadcrumbListItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
