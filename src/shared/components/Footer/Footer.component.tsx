import Link from 'next/link'
import Image from 'next/image'
import { ContentShell } from '@/shared/components/ContentShell.component'

const FOOTER_DESCRIPTION =
  'Maßgeschneiderte PVC-Planen für Anhänger, Terrassen, Pools und mehr – Made in Germany, in höchster Qualität und nach Ihren Wünschen.'

const FOOTER_PHONE = '0203 7385985'
const FOOTER_PHONE_MOBILE = '0172 7436428'
const FOOTER_EMAIL = 'post@planenadler.de'
const FOOTER_ADDRESS = 'Düsseldorfer Str. 387, 47055 Duisburg'
const FOOTER_MAPS_HREF =
  'https://www.google.com/maps/search/?api=1&query=D%C3%BCsseldorfer+Str.+387,+47055+Duisburg'
const FOOTER_WHATSAPP_HREF = 'https://wa.me/491727436428'
const FOOTER_FACEBOOK_HREF = 'https://www.facebook.com/Planenadler.de/?locale=de_DE'

const footerLinks = [
  {
    title: 'Produkt',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Ueber uns', href: '/ueber-uns' },
      { label: 'Shop', href: '/shop' },
      { label: 'News & Ratgeber', href: '/blog' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Kontakt', href: '/kontakt' },
    ],
  },
  {
    title: 'Rechtliches',
    links: [
      { label: 'Impressum', href: '/impressum' },
      { label: 'Datenschutz', href: '/datenschutz' },
      { label: 'AGB', href: '/agb' },
      { label: 'Widerrufsbelehrung', href: '/widerruf' },
      { label: 'Versandbedingungen', href: '/versand' },
    ],
  },
]

/**
 * Renders Footer of the application.
 * @function Footer
 * @returns {JSX.Element} - Rendered component
 */
function Footer() {
  return (
    <footer className="w-full border-t border-white/60 bg-[#F7FAFF]">
      <ContentShell className="py-12 sm:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" aria-label="Planenadler Home" className="inline-block">
              <Image
                src="/Planenadlerlogo.png"
                alt="Planenadler Logo"
                width={160}
                height={43}
                style={{ width: 'auto', height: 'auto' }}
                className="h-10 w-auto object-contain sm:h-11"
              />
            </Link>
            <p className="mt-3 text-sm text-[#1F5CAB]/70">{FOOTER_DESCRIPTION}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={FOOTER_WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp: 0172 7436428"
                className="inline-flex items-center gap-2 rounded-full border border-[#DBE9F9] px-4 py-2 text-xs font-semibold text-[#1F5CAB] transition hover:bg-[#1F5CAB] hover:text-white"
              >
                <svg
                  className="h-5 w-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
              <a
                href={FOOTER_FACEBOOK_HREF}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Planenadler"
                className="inline-flex items-center gap-2 rounded-full border border-[#DBE9F9] px-4 py-2 text-xs font-semibold text-[#1F5CAB] transition hover:bg-[#1F5CAB] hover:text-white"
              >
                <svg
                  className="h-5 w-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3982DC]">
                  {group.title}
                </div>
                <ul className="mt-4 space-y-3 text-sm text-[#1F5CAB]/80">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="transition hover:text-[#1F5CAB]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3982DC]">
                Kontakt
              </div>
              <ul className="mt-4 space-y-3 text-sm text-[#1F5CAB]/80">
                <li>
                  <Link href="/kontakt" className="transition hover:text-[#1F5CAB]">
                    Kontaktformular
                  </Link>
                </li>
                <li>
                  <span className="font-medium text-[#1F5CAB]">Telefon</span>
                  <br />
                  <a
                    href="tel:+492037385985"
                    className="transition hover:text-[#1F5CAB]"
                  >
                    {FOOTER_PHONE}
                  </a>
                  {' · '}
                  <a
                    href="tel:+491727436428"
                    className="transition hover:text-[#1F5CAB]"
                  >
                    {FOOTER_PHONE_MOBILE}
                  </a>
                </li>
                <li>
                  <span className="font-medium text-[#1F5CAB]">E-Mail</span>
                  <br />
                  <a
                    href={`mailto:${FOOTER_EMAIL}`}
                    className="transition hover:text-[#1F5CAB]"
                  >
                    {FOOTER_EMAIL}
                  </a>
                </li>
                <li>
                  <span className="font-medium text-[#1F5CAB]">Adresse</span>
                  <br />
                  <a
                    href={FOOTER_MAPS_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-[#1F5CAB]"
                  >
                    {FOOTER_ADDRESS}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#DBE9F9] pt-6 text-xs text-[#1F5CAB]/70 sm:flex-row">
          <div suppressHydrationWarning>&copy; {new Date().getFullYear()} Planenadler</div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/datenschutz" className="transition hover:text-[#1F5CAB]">
              Datenschutz
            </Link>
            <Link href="/impressum" className="transition hover:text-[#1F5CAB]">
              Impressum
            </Link>
            <Link href="/agb" className="transition hover:text-[#1F5CAB]">
              AGB
            </Link>
            <Link href="/widerruf" className="transition hover:text-[#1F5CAB]">
              Widerrufsbelehrung
            </Link>
            <Link href="/versand" className="transition hover:text-[#1F5CAB]">
              Versandbedingungen
            </Link>
          </div>
        </div>
      </ContentShell>
    </footer>
  )
}

export default Footer
