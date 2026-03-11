// Imports
import { ReactNode } from 'react';
import Image from 'next/image';

// Components
import Header from '@/shared/components/Header/Header.component';
import { ContentShell } from '@/shared/components/ContentShell.component';
import { TopBar } from '@/shared/components/TopBar/TopBar.component';
import PageTitle from './PageTitle.component';
import Footer from '@/shared/components/Footer/Footer.component';
import Stickynav from '@/shared/components/Footer/Stickynav.component';

const WHATSAPP_NUMBER = '491727436428'

function WhatsAppFloatButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}`
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp Kontakt"
      className="fixed bottom-32 right-4 z-[400] flex h-14 w-14 items-center justify-center overflow-hidden rounded-full shadow-lg transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 md:bottom-6"
    >
      <Image
        src="/images/whatsapp_4008228.png"
        alt=""
        width={56}
        height={56}
        className="h-full w-full object-cover"
        sizes="56px"
      />
    </a>
  )
}

interface ILayoutProps {
  children?: ReactNode;
  title: string;
}

/**
 * Renders layout for each page. Also passes along the title to the Header component.
 * @function Layout
 * @param {ReactNode} children - Children to be rendered by Layout component
 * @param {TTitle} title - Title for the page. Is set in <title>{title}</title>
 * @returns {JSX.Element} - Rendered component
 */

const Layout = ({ children, title }: ILayoutProps) => {
  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col overflow-x-hidden pt-0 sm:pt-20">
      <Header title={title} />
      <TopBar />
      {title === 'Hjem' ? (
        <main className="flex-1">{children}</main>
      ) : (
        <ContentShell className="flex-1">
          <PageTitle title={title} />
          <main>{children}</main>
        </ContentShell>
      )}
      <div className="mt-auto">
        <Footer />
        <Stickynav />
      </div>
      <WhatsAppFloatButton />
    </div>
  );
};

export default Layout;
