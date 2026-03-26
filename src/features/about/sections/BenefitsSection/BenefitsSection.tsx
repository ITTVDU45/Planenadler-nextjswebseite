import type { ReactNode } from 'react'
import type { Benefit } from '../../types'
import { BENEFITS } from '../../data/benefits'
import { ContentShell } from '@/shared/components/ContentShell.component'

const ICONS: Record<Benefit['icon'], ReactNode> = {
  measure: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12h20M2 12l4-4M2 12l4 4M22 12l-4-4M22 12l-4 4" />
    </svg>
  ),
  shield: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2l7 4v5c0 5-3.5 9-7 10C8.5 20 5 16 5 11V6l7-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  palette: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <circle cx="8" cy="10" r="1.5" fill="currentColor" />
      <circle cx="12" cy="7" r="1.5" fill="currentColor" />
      <circle cx="16" cy="10" r="1.5" fill="currentColor" />
      <path d="M12 22c1.5 0 3-1.5 3-3s-1.5-3-3-3H9" />
    </svg>
  ),
  support: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
}

interface BenefitsSectionProps {
  benefits?: Benefit[]
}

export function BenefitsSection({ benefits = BENEFITS }: BenefitsSectionProps) {
  return (
    <section className="w-full bg-white py-16 lg:py-24">
      <ContentShell>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#3982DC]">
            Ihre Vorteile
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#1F5CAB] sm:text-3xl lg:text-4xl">
            Warum Planenadler?
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="flex flex-col items-start rounded-[2rem] border border-[#DBE9F9] bg-[#F7FAFF] p-6 transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1F5CAB] text-white">
                {ICONS[benefit.icon]}
              </div>
              <h3 className="mt-4 text-base font-bold text-[#1F5CAB]">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#1F5CAB]/70">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </ContentShell>
    </section>
  )
}
