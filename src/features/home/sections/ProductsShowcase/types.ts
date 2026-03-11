export interface ProductCategory {
  id: string
  label: string
  /** Slug für Tab-Anzeige und aktiven Zustand */
  slug: string
  /** Slug für die GraphQL-Abfrage (WooCommerce-Kategorie). Wenn gesetzt, wird dieser an die API gesendet. */
  querySlug?: string
}

export interface ProductCardItem {
  id: string
  slug?: string
  name: string
  price: string
  averageRating?: string
  description?: string
  shortDescription?: string
  image: {
    src: string
    alt: string
  }
  gallery: Array<{
    src: string
    alt: string
  }>
  attributes: Array<{
    name: string
    value: string
  }>
}
