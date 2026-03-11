import type { Metadata } from 'next'
import { Playfair_Display } from 'next/font/google'
import Image from 'next/image'
import '@/shared/styles/globals.css'
import { Providers } from './Providers'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Planenadler',
  description: 'Individuell konfigurierte Planen fuer LKW und Transport',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const whatsappHref = 'https://wa.me/491727436428'
  return (
    <html lang="de">
      <body className={playfair.variable}>
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
            alt=""
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

