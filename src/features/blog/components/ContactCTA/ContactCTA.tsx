import Link from 'next/link'

interface ContactCTAProps {
  title?: string
  description?: string
  ctaHref?: string
  ctaLabel?: string
}

export function ContactCTA({
  title = 'Plane direkt konfigurieren',
  description = 'Konfigurieren Sie Ihre massgefertigte Plane direkt online und erhalten Sie sofort einen Preis.',
  ctaHref = '/shop',
  ctaLabel = 'Jetzt konfigurieren',
}: ContactCTAProps) {
  return (
    <div className="rounded-[28px] border border-[#CFE0F7] bg-gradient-to-br from-[#1F5CAB] to-[#3982DC] p-6 text-white shadow-[0_18px_45px_rgba(31,92,171,0.18)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
        Planenadler
      </p>
      <h3 className="mt-3 text-2xl font-semibold leading-tight">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-white/85">
        {description}
      </p>
      <Link
        href={ctaHref}
        className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1F5CAB] transition hover:bg-[#E9F2FD]"
      >
        {ctaLabel}
      </Link>
    </div>
  )
}
