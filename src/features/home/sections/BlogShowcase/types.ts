export interface ArticleImage {
  src: string
  alt: string
}

export interface ArticleAuthor {
  name: string
  avatar: ArticleImage
}

export interface Article {
  id: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  slug?: string
  image: ArticleImage
  author: ArticleAuthor
}

export interface ArticleCategory {
  id?: string
  slug: string
  label: string
}
