import Head from 'next/head'
import type { NextPage } from 'next'
import Layout from '@/shared/components/Layout.component'
import { ContactHeroSection, ContactMainSection } from '@/features/contact'
import { absoluteUrl } from '@/lib/seo'
import {
  getBreadcrumbJsonLd,
  getContactPageJsonLd,
  getLocalBusinessJsonLd,
} from '@/lib/seo-schema'

const PAGE_TITLE = 'Kontakt | Planenadler'
const META_DESCRIPTION =
  'Kontaktieren Sie Planenadler fuer Fragen, Anfragen oder Beratung per Telefon, E-Mail oder Kontaktformular.'
const CANONICAL_URL = absoluteUrl('/kontakt')
const OG_IMAGE_URL = absoluteUrl('/Planenadlerlogo.png')

const Kontakt: NextPage = () => {
  const contactPageJsonLd = getContactPageJsonLd(PAGE_TITLE, '/kontakt', META_DESCRIPTION)
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Kontakt', path: '/kontakt' },
  ])
  const localBusinessJsonLd = getLocalBusinessJsonLd()

  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link rel="canonical" href={CANONICAL_URL} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={META_DESCRIPTION} />
        <meta property="og:url" content={CANONICAL_URL} />
        <meta property="og:image" content={OG_IMAGE_URL} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={META_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </Head>
      <Layout title={PAGE_TITLE}>
        <ContactHeroSection />
        <ContactMainSection />
      </Layout>
    </>
  )
}

export default Kontakt
