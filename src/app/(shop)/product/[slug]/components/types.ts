export interface ProductImage {
  src: string
  alt: string
}

export interface ProductFeature {
  title: string
  description: string
  icon?: string
}

export interface ProductTab {
  id: string
  label: string
  content: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface BlogTeaser {
  title: string
  slug: string
  excerpt?: string
}

export interface ConfiguratorHints {
  sizes?: string[]
  colors?: string[]
  notes?: string[]
}

export interface ConfiguratorOptionsFromBackend {
  [key: string]: unknown
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
  image: ProductImage
  gallery: ProductImage[]
  features: ProductFeature[]
  tabs: ProductTab[]
  recommendations: ProductRecommendation[]
  configuratorHints?: ConfiguratorHints
  configuratorOptions?: ConfiguratorOptionsFromBackend
  priceEndpoint?: string
}
