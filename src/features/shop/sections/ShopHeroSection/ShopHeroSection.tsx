'use client'

import type { ShopHeroContent } from '../../types'
import { SHOP_HERO_CONTENT } from '../../data/heroContent'
import { ContentShell } from '@/shared/components/ContentShell.component'

interface ShopHeroSectionProps {
  content?: ShopHeroContent
}

export function ShopHeroSection({ content = SHOP_HERO_CONTENT }: ShopHeroSectionProps) {
  return (
    <section className="w-full bg-gradient-to-b from-[#DBE9F9]/50 to-[#F7FAFF] py-16 sm:py-20 lg:py-24">
      <ContentShell>
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#1F5CAB] sm:text-4xl lg:text-5xl">
            {content.headline}
          </h1>
          <p className="mt-4 text-base text-[#1F5CAB]/80 sm:text-lg lg:text-xl">
            {content.subline}
          </p>
        </div>
      </ContentShell>
    </section>
  )
}
