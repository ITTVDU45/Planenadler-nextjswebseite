import Head from 'next/head';
import { GOOGLE_SITE_VERIFICATION } from '@/lib/seo';
import { getLocalBusinessJsonLd, getOrganizationJsonLd, getWebSiteJsonLd } from '@/lib/seo-schema';

interface IHeaderProps {
  title: string;
}

/**
 * Renders header for each page.
 * @function Header
 * @param {string} title - Title for the page. Is set in <title>{title}</title>
 * @returns {JSX.Element} - Rendered component
 */

const Header = ({ title }: IHeaderProps) => {
  const organizationJsonLd = getOrganizationJsonLd();
  const websiteJsonLd = getWebSiteJsonLd();
  const localBusinessJsonLd = getLocalBusinessJsonLd();

  return (
    <>
      <Head>
        <title>{title}</title>
        {GOOGLE_SITE_VERIFICATION ? (
          <meta name="google-site-verification" content={GOOGLE_SITE_VERIFICATION} />
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
      </Head>
    </>
  );
};

export default Header;
