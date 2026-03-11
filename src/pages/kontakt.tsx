import Head from 'next/head'
import Layout from '@/shared/components/Layout.component'
import { ContactHeroSection, ContactMainSection } from '@/features/contact'
import type { NextPage } from 'next'

const PAGE_TITLE = 'Kontakt | Planenadler'
const META_DESCRIPTION =
  'Kontaktieren Sie Planenadler für Fragen, Anfragen oder Beratung. Telefon, E-Mail oder Kontaktformular – wir helfen gern.'

const Kontakt: NextPage = () => {
  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={META_DESCRIPTION} />
      </Head>
      <Layout title={PAGE_TITLE}>
        <ContactHeroSection />
        <ContactMainSection />
      </Layout>
    </>
  )
}

export default Kontakt
