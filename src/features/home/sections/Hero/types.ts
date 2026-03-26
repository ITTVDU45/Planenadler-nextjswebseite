export interface HeroImage {
  src: string
  alt: string
}

export interface HeroCTAData {
  label: string
  href: string
  bgColor?: string
}

export interface HeroSlide {
  id: string
  navLabel: string
  title: string
  subtitle?: string
  description: string
  cta: HeroCTAData
  background: HeroImage
  thumbMain: HeroImage
}
