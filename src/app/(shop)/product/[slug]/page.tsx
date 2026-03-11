import type { Metadata } from 'next'
import ProductHero from './components/ProductHero'
import ProductFeatures from './components/ProductFeatures'
import ProductGallery from './components/ProductGallery'
import ProductConfigurator from './components/ProductConfigurator'
import ProductTabs from './components/ProductTabs'
import ProductRecommendations from './components/ProductRecommendations'
import { getProductPageData } from './product-data'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { BlogShowcase, FAQ } from '@/features/home'
import { mapBlogPostToArticle, getCategoriesFromBlogPosts } from '@/features/home/sections/BlogShowcase/mapBlogPostToArticle'
import { getRecentBlogPosts } from '@/features/blog'

interface ProductPageProps {
  params: { slug?: string } | Promise<{ slug?: string }>
}

async function resolveSlug(params: ProductPageProps['params']): Promise<string> {
  const resolved = await params
  return typeof resolved?.slug === 'string' && resolved.slug.length > 0
    ? resolved.slug
    : 'lkw-plane-individuell'
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const slug = await resolveSlug(params)
  const product = await getProductPageData(slug)

  return {
    title: `${product.title} | Planenadler`,
    description: product.subtitle,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const slug = await resolveSlug(params)
  const [product, recentPosts] = await Promise.all([
    getProductPageData(slug),
    getRecentBlogPosts(4),
  ])
  const blogArticles = recentPosts.map(mapBlogPostToArticle)
  const blogCategories = getCategoriesFromBlogPosts(recentPosts)

  return (
    <>
      <main className="bg-white pb-16 sm:pt-20">
        <TopBar />
        <ProductHero product={product} />
        <ProductFeatures items={product.features} />

        <section id="konfigurator" className="py-12 md:py-16" aria-labelledby="configurator-title">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <h2 id="configurator-title" className="mb-4 text-2xl font-bold text-[#0F2B52]">
                Individuelle Konfiguration
              </h2>
              <ProductGallery mainImage={product.image} images={product.gallery} />
            </div>
            <ProductConfigurator
              productId={product.databaseId}
              productName={product.title}
              price={product.price}
              hints={product.configuratorHints}
              configuratorOptions={product.configuratorOptions}
              priceEndpoint={product.priceEndpoint}
            />
          </div>
        </section>

        <ProductTabs tabs={product.tabs} />
        <ProductRecommendations items={product.recommendations} />
        <BlogShowcase articles={blogArticles} categories={blogCategories} />
        <FAQ />
        <Footer />
        <span className="sr-only">Produkt-Slug: {slug}</span>
      </main>
      <Stickynav />
    </>
  )
}
