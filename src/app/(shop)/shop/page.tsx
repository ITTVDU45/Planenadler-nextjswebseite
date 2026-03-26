import type { Metadata } from 'next'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import {
  ShopHeroSection,
  ShopCategoryGridSection,
  buildFaqSchema,
  SHOP_FAQ_ITEMS,
} from '@/features/shop'
import { BlogShowcase } from '@/features/home'
import { mapBlogPostToArticle, getCategoriesFromBlogPosts } from '@/features/home/sections/BlogShowcase/mapBlogPostToArticle'
import { FAQSection } from '@/features/about'
import { getRecentBlogPosts } from '@/features/blog'
import { buildCanonicalMetadata } from '@/lib/seo'
import { getBreadcrumbJsonLd } from '@/lib/seo-schema'

export const metadata: Metadata = buildCanonicalMetadata(
  '/shop',
  'Shop',
  'Unsere Produkte und Planenloesungen: Terrassenplanen, Anhaengerplanen, Abdeckhauben, Abdeckplanen, Poolplanen und weitere Massanfertigungen.'
)

export default async function ShopPage() {
  const faqSchema = buildFaqSchema(SHOP_FAQ_ITEMS)
  const breadcrumbSchema = getBreadcrumbJsonLd([
    { name: 'Startseite', path: '/' },
    { name: 'Shop', path: '/shop' },
  ])
  const recentPosts = await getRecentBlogPosts(4)
  const blogArticles = recentPosts.map(mapBlogPostToArticle)
  const blogCategories = getCategoriesFromBlogPosts(recentPosts)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="min-h-screen bg-white pb-16 sm:pt-20">
        <TopBar />
        <ShopHeroSection />
        <ShopCategoryGridSection />
        <BlogShowcase articles={blogArticles} categories={blogCategories} />
        <FAQSection items={SHOP_FAQ_ITEMS} />
        <Footer />
      </main>
      <Stickynav />
    </>
  )
}
