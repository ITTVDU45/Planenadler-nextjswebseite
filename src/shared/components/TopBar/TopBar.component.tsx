'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ContentShell } from '@/shared/components/ContentShell.component'
import { MiniCartDropdown } from '@/features/cart/components/MiniCartDropdown'

const leftMenu = [
  { label: 'Home', href: '/' },
  { label: 'Ueber Uns', href: '/ueber-uns' },
  { label: 'Shop', href: '/shop' },
  { label: 'News & Ratgeber', href: '/blog' },
]

const rightMenu = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Kontakt', href: '/kontakt' },
  { label: 'Mein Konto', href: '/mein-konto' },
]

const configuratorLink = { label: 'ZUM KONFIGURATOR', href: '/shop' }

function getIsActive(asPath: string, href: string) {
  if (!href) return false
  if (href.startsWith('#')) return asPath.includes(href)
  if (href === '/') return asPath === '/'
  return asPath.startsWith(href)
}

export function TopBar() {
  const pathname = usePathname()
  const asPath = pathname ?? ''

  return (
    <div className="fixed left-0 right-0 top-0 z-50 w-full bg-transparent">
      <ContentShell className="py-3 sm:py-4">
        <div className="rounded-full border border-[#DBE9F9] bg-white/95 px-3 py-2.5 shadow-[0_16px_40px_rgba(15,43,82,0.12)] backdrop-blur sm:px-4 sm:py-3">
          <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-[1fr_auto_1fr]">
            <div className="hidden items-center justify-start gap-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#1F5CAB] lg:flex">
              {leftMenu.map((item) => {
                const isActive = getIsActive(asPath, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-full px-3 py-2 text-[#1F5CAB]/70 transition hover:-translate-y-0.5 hover:bg-[#DBE9F9] hover:text-[#1F5CAB]',
                      isActive && 'bg-[#DBE9F9] text-[#1F5CAB]'
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center justify-center">
              <Link
                href="/"
                aria-label="Planenadler Home"
                className="flex items-center"
              >
                <Image
                  src="/Planenadlerlogo.png"
                  alt="Planenadler Logo"
                  width={180}
                  height={48}
                  className="h-10 w-auto object-contain sm:h-12"
                  priority
                />
              </Link>
            </div>

            <div className="hidden items-center justify-end gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#1F5CAB] lg:flex">
              {rightMenu.map((item) => {
                const isActive = getIsActive(asPath, item.href)
                if (item.href === '/mein-konto') {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-label={item.label}
                      className={cn(
                        'inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#DBE9F9] text-[#1F5CAB]/70 transition hover:-translate-y-0.5 hover:bg-[#DBE9F9] hover:text-[#1F5CAB]',
                        isActive && 'bg-[#DBE9F9] text-[#1F5CAB]'
                      )}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                        <circle
                          cx="12"
                          cy="8"
                          r="3.2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M5 19c1.1-3 3.6-4.6 7-4.6s5.9 1.6 7 4.6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </Link>
                  )
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-full px-3 py-2 text-[#1F5CAB]/70 transition hover:-translate-y-0.5 hover:bg-[#DBE9F9] hover:text-[#1F5CAB]',
                      isActive && 'bg-[#DBE9F9] text-[#1F5CAB]'
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
              <MiniCartDropdown />
              <Link
                href={configuratorLink.href}
                className="inline-flex items-center whitespace-nowrap rounded-full bg-[#1F5CAB] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#0F2B52] xl:px-4 xl:text-xs xl:tracking-[0.2em]"
              >
                {configuratorLink.label}
              </Link>
            </div>
          </div>
        </div>
      </ContentShell>
    </div>
  )
}
