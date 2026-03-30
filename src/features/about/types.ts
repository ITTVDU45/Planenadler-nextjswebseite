export interface HeroContent {
  headline: string
  subline: string
  ctaPrimary: { label: string; href: string }
  ctaSecondary: { label: string; href: string }
  trustBadges: { id: string; label: string }[]
}

export interface AboutStoryContent {
  title: string
  paragraphs: string[]
  storyTitle?: string
  storyParagraph?: string
  highlights?: { label: string; value: string }[]
}

export interface MissionContent {
  title: string
  text: string
  points?: string[]
}

export interface ConfiguratorStep {
  step: number
  title: string
  description: string
}

export interface ConfiguratorContent {
  title: string
  steps: ConfiguratorStep[]
  ctaLabel: string
  ctaHref: string
  image?: { src: string; alt: string }
}

export interface Benefit {
  id: string
  icon: 'measure' | 'shield' | 'palette' | 'support'
  title: string
  description: string
}

export interface ProductGroupCard {
  id: string
  name: string
  description: string
  image: { src: string; alt: string }
  hrefMore: string
  hrefConfig: string
}

export interface BlogPreviewItem {
  id: string
  title: string
  excerpt: string
  href: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface FaqSection {
  id: string
  title: string
  items: FaqItem[]
}
