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

export const metadata: Metadata = {
  title: 'Blog | Planenadler',
  description:
    'Tipps, Anleitungen & Wissen rund um PVC-Planen, Abdeckungen und Maßanfertigung.',
  openGraph: {
    title: 'Blog | Planenadler',
    description:
      'Tipps, Anleitungen & Wissen rund um PVC-Planen, Abdeckungen und Maßanfertigung.',
  },
}

export default async function BlogPage() {
  const posts = await getBlogPosts()
  const categories = getUniqueCategoriesFromPosts(posts)

  return (
    <main className="min-h-screen bg-white pb-16 sm:pt-20">
      <TopBar />
      <BlogHeroSection />
      <BlogSearchAndFilterSection posts={posts} categories={categories} />
      <Footer />
      <Stickynav />
    </main>
  )
}
