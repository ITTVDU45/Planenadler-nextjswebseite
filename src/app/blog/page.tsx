import type { Metadata } from 'next'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import {
  BlogHeroSection,
  BlogSearchAndFilterSection,
  getBlogPosts,
  getUniqueCategoriesFromPosts,
} from '@/features/blog'
import { buildCanonicalMetadata, absoluteUrl } from '@/lib/seo'
import { getBreadcrumbJsonLd } from '@/lib/seo-schema'

export const metadata: Metadata = buildCanonicalMetadata(
  '/blog',
  'News & Ratgeber',
  'Tipps, Anleitungen und Wissen rund um PVC-Planen, Abdeckungen und Massanfertigung.',
  {
    image: '/Planenadlerlogo.png',
  }
)

export default async function BlogPage() {
  const posts = await getBlogPosts()
  const categories = getUniqueCategoriesFromPosts(posts)
  const breadcrumbSchema = getBreadcrumbJsonLd([
    { name: 'Startseite', path: '/' },
    { name: 'News & Ratgeber', path: '/blog' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="min-h-screen bg-white pb-16 sm:pt-20">
        <TopBar />
        <BlogHeroSection />
        <BlogSearchAndFilterSection posts={posts} categories={categories} />
        <Footer />
        <Stickynav />
        <span className="sr-only">Kanonische URL: {absoluteUrl('/blog')}</span>
      </main>
    </>
  )
}
