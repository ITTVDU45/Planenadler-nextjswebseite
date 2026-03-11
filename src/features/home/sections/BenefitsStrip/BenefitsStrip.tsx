import Link from 'next/link'
import { ContentShell } from '@/shared/components/ContentShell.component'

const benefits = [
  {
    id: 'secure-payment',
    title: 'Sichere Zahlung',
    bgColor: '#DBE9F9',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1F5CAB"
        strokeWidth="1.6"
        aria-hidden
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    id: 'custom-order',
    title: 'Bestellung nach Maß',
    bgColor: '#B9D4F3',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1F5CAB"
        strokeWidth="1.6"
        aria-hidden
      >
        <path d="M4 6h16" />
        <path d="M4 12h10" />
        <path d="M4 18h7" />
      </svg>
    ),
  },
  {
    id: 'delivery-time',
    title: 'Lieferzeit 14–30 Tage',
    bgColor: '#75AAE7',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1F5CAB"
        strokeWidth="1.6"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6l4 2" />
      </svg>
    ),
  },
  {
    id: 'whatsapp-support',
    title: 'WhatsApp Support',
    bgColor: '#DBE9F9',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1F5CAB"
        strokeWidth="1.6"
        aria-hidden
      >
        <path d="M7 20l1-3a7 7 0 1 1 3 2" />
        <path d="M9.5 10.5c.5 1 1.5 2 2.5 2.5l1-1 1.5 1.5-1 1c-2 .5-4.5-2-5-4.5l1-1 1.5 1.5-1 1z" />
      </svg>
    ),
    cta: {
      label: 'Jetzt Kontakt aufnehmen',
      href: '/kontakt',
    },
  },
]

export function BenefitsStrip() {
  return (
    <section className="w-full py-14 lg:py-20" style={{ backgroundColor: 'rgb(247, 250, 255)' }}>
      <ContentShell>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="flex flex-col items-start gap-4 rounded-[24px] px-5 py-5 sm:px-6 sm:py-6"
              style={{ backgroundColor: benefit.bgColor }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                {benefit.icon}
              </div>
              <div className="text-sm font-semibold text-[#1F5CAB]">
                {benefit.title}
              </div>
              {'cta' in benefit && benefit.cta ? (
                <Link
                  href={benefit.cta.href}
                  className="mt-2 inline-flex items-center rounded-full bg-[#1F5CAB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0F2B52]"
                  aria-label={benefit.cta.label}
                >
                  {benefit.cta.label}
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </ContentShell>
    </section>
  )
}
