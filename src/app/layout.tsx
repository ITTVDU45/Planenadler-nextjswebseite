import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Playfair_Display } from 'next/font/google'
import Image from 'next/image'
import Script from 'next/script'
import { GoogleAnalyticsAppTracker } from '@/components/analytics/google-analytics-app-tracker'
import { GoogleAnalyticsScripts } from '@/components/analytics/google-analytics-scripts'
import '@/shared/styles/globals.css'
import { Providers } from './Providers'
import { DEFAULT_DESCRIPTION, GOOGLE_SITE_VERIFICATION, SITE_NAME, SITE_URL } from '@/lib/seo'
import { getGtmBootstrapScript, getGtmId } from '@/lib/gtm'
import { getLocalBusinessJsonLd, getOrganizationJsonLd, getWebSiteJsonLd } from '@/lib/seo-schema'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: '/Planenadlerlogo.png',
        alt: 'Planenadler Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: ['/Planenadlerlogo.png'],
  },
  verification: GOOGLE_SITE_VERIFICATION
    ? {
        google: GOOGLE_SITE_VERIFICATION,
      }
    : undefined,
  icons: {
    icon: [{ url: '/Planenadlerlogo.png', type: 'image/png' }],
    shortcut: '/Planenadlerlogo.png',
    apple: '/Planenadlerlogo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtmId = getGtmId()
  const whatsappHref = 'https://wa.me/491727436428'
  const organizationJsonLd = getOrganizationJsonLd()
  const websiteJsonLd = getWebSiteJsonLd()
  const localBusinessJsonLd = getLocalBusinessJsonLd()

  return (
    <html lang="de">
      <head>
        {gtmId ? (
          <Script
            id="google-tag-manager"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: getGtmBootstrapScript(gtmId),
            }}
          />
        ) : null}
        <GoogleAnalyticsScripts />
      </head>
      <body className={playfair.variable}>
        {gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height={0}
              width={0}
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <Suspense fallback={null}>
          <GoogleAnalyticsAppTracker />
        </Suspense>
        <Providers>{children}</Providers>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp Kontakt"
          className="fixed bottom-32 right-4 z-[520] flex h-14 w-14 items-center justify-center overflow-hidden rounded-full shadow-lg transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 md:bottom-6"
        >
          <Image
            src="/images/whatsapp_4008228.png"
            alt="WhatsApp Kontakt zu Planenadler"
            width={56}
            height={56}
            className="h-full w-full object-cover"
            sizes="56px"
          />
        </a>
      </body>
    </html>
  )
}
