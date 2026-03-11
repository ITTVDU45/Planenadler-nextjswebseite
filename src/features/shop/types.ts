export interface ShopCategory {
  id: string
  slug: string
  name: string
  description: string
  image: { src: string; alt: string }
  href: string
  hrefConfig?: string
}

export interface ShopHeroContent {
  headline: string
  subline: string
  ctaLabel: string
  ctaHref: string
}

export type { FaqItem } from '@/features/about/types'
