'use client'

import Link from 'next/link'
import type { HeroContent } from '../../types'
import { HERO_CONTENT } from '../../data/aboutContent'
import { ContentShell } from '@/shared/components/ContentShell.component'

interface HeroSectionProps {
  content?: HeroContent
}

export function HeroSection({ content = HERO_CONTENT }: HeroSectionProps) {
  return (
    <section className="w-full bg-gradient-to-b from-[#DBE9F9]/50 to-[#F7FAFF] py-16 sm:py-20 lg:py-28">
      <ContentShell>
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#1F5CAB] sm:text-4xl lg:text-5xl">
            {content.headline}
          </h1>
          <p className="mt-4 text-base text-[#1F5CAB]/80 sm:text-lg lg:text-xl">
            {content.subline}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={content.ctaPrimary.href}
              className="inline-flex items-center justify-center rounded-full bg-[#1F5CAB] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0F2B52] focus:outline-none focus:ring-2 focus:ring-[#1F5CAB] focus:ring-offset-2"
            >
              {content.ctaPrimary.label}
            </Link>
            <Link
              href={content.ctaSecondary.href}
              className="inline-flex items-center justify-center rounded-full border-2 border-[#DBE9F9] bg-transparent px-6 py-3 text-sm font-semibold text-[#1F5CAB] transition hover:border-[#B9D4F3] hover:bg-[#DBE9F9]/50 focus:outline-none focus:ring-2 focus:ring-[#DBE9F9] focus:ring-offset-2"
            >
              {content.ctaSecondary.label}
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            {content.trustBadges.map((badge) => (
              <span
                key={badge.id}
                className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3982DC] sm:text-sm"
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </ContentShell>
    </section>
  )
}
