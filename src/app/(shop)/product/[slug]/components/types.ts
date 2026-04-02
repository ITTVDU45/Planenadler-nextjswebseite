export interface ProductImage {
  src: string
  alt: string
}

export interface ProductFeature {
  title: string
  detail: string
  icon?: string
}

export interface ProductTabSpec {
  label: string
  value: string
}

export interface ProductTabContent {
  intro: string
  html?: string
  bullets?: string[]
  specs?: ProductTabSpec[]
}

export interface ProductTab {
  value: string
  label: string
  content: ProductTabContent
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface BlogTeaser {
  id: string
  title: string
  slug: string
  href: string
  publishedAt: string
  excerpt?: string
}

export interface ConfiguratorHints {
  color?: string
  size?: string
  topSide?: string
  leftSide?: string
  rightSide?: string
  bottomSide?: string
  window?: string
  door?: string
  eyelets?: string
  closureType?: string
  frontClosure?: string
  backClosure?: string
  extras?: string
  sketch?: string
}

export interface ConfiguratorOptionsFromBackend {
  rawCustomizerConfig?: import('@/lib/customizer-types').CustomizerConfig | null
  resolvedConfig?: import('@/lib/customizer-runtime').ResolvedCustomizerConfig | null
  state?: import('@/lib/customizer-runtime').ConfiguratorState
}

export interface ProductRecommendation {
  id: number
  name: string
  slug: string
  price: string
  image?: ProductImage
}

export interface TruckTarpProduct {
  databaseId: number
  title: string
  subtitle: string
  price: string
  ctaLabel: string
  image: ProductImage
  gallery: ProductImage[]
  features: ProductFeature[]
  tabs: ProductTab[]
  recommendations: ProductRecommendation[]
  configuratorHints?: ConfiguratorHints
  configuratorOptions?: ConfiguratorOptionsFromBackend
  priceEndpoint?: string
}
