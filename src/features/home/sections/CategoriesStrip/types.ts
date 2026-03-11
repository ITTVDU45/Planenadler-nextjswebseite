export interface Category {
  id: string
  name: string
  href: string
  image: {
    src: string
    alt: string
  }
  itemsCount?: number
  bgColor: string
}
