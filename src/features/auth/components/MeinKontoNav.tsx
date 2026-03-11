'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/utils/auth'

const NAV_ITEMS = [
  { href: '/mein-konto', label: 'Dashboard' },
  { href: '/mein-konto/bestellungen', label: 'Bestellungen' },
  { href: '/mein-konto/downloads', label: 'Downloads' },
  { href: '/mein-konto/adressen', label: 'Adressen' },
  { href: '/mein-konto/zahlungsmethoden', label: 'Zahlungsmethoden' },
  { href: '/mein-konto/kontodetails', label: 'Kontodetails' },
] as const

export function MeinKontoNav() {
  const pathname = usePathname() ?? ''

  return (
    <nav
      className="flex flex-col gap-1"
      aria-label="Konto-Bereiche"
    >
      {NAV_ITEMS.map(({ href, label }) => {
        const isActive =
          href === '/mein-konto'
            ? pathname === '/mein-konto'
            : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-[#1F5CAB] text-white'
                : 'text-[#1F5CAB] hover:bg-[#DBE9F9]'
            }`}
          >
            {label}
          </Link>
        )
      })}
      <button
        type="button"
        onClick={() => logout('/anmelden')}
        className="mt-2 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-[#1F5CAB] hover:bg-[#DBE9F9]"
      >
        Abmelden
      </button>
    </nav>
  )
}
