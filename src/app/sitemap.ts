import type { MetadataRoute } from 'next'
import { getBlogPosts } from '@/features/blog'
import { SITE_URL, absoluteUrl } from '@/lib/seo'

interface ProductSitemapNode {
  slug?: string | null
  modified?: string | null
}

async function fetchProductSlugs(): Promise<ProductSitemapNode[]> {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL
  if (!graphqlUrl) return []

  const query = `
    query SitemapProducts {
      products(first: 100) {
        nodes {
          slug
          modified
        }
      }
    }
  `

  try {
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 },
    })
    const json = (await response.json()) as {
      data?: { products?: { nodes?: ProductSitemapNode[] } }
    }
    return json.data?.products?.nodes ?? []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/ueber-uns'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/shop'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/blog'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/faq'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/kontakt'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/impressum'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/datenschutz'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/agb'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/versand'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: absoluteUrl('/widerruf'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  const [posts, products] = await Promise.all([getBlogPosts(), fetchProductSlugs()])

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const productRoutes: MetadataRoute.Sitemap = products
    .filter((product): product is ProductSitemapNode & { slug: string } => Boolean(product.slug))
    .map((product) => ({
      url: absoluteUrl(`/product/${product.slug}`),
      lastModified: product.modified ? new Date(product.modified) : now,
      changeFrequency: 'weekly',
      priority: 0.85,
    }))

  return [...staticRoutes, ...productRoutes, ...blogRoutes]
}
