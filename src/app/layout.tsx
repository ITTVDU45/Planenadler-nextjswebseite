import type { Metadata } from 'next'
import { Playfair_Display } from 'next/font/google'
import Image from 'next/image'
import '@/shared/styles/globals.css'
import { Providers } from './Providers'
import { DEFAULT_DESCRIPTION, GOOGLE_SITE_VERIFICATION, SITE_NAME, SITE_URL } from '@/lib/seo'
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
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const whatsappHref = 'https://wa.me/491727436428'
  const organizationJsonLd = getOrganizationJsonLd()
  const websiteJsonLd = getWebSiteJsonLd()
  const localBusinessJsonLd = getLocalBusinessJsonLd()

  return (
    <html lang="de">
      <body className={playfair.variable}>
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
