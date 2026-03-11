import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { BlogHeroSection, BlogGridSection, getPaginatedBlogPosts } from '@/features/blog'

interface BlogPagePageProps {
  params: Promise<{ page: string }>
}

export async function generateMetadata({
  params,
}: BlogPagePageProps): Promise<Metadata> {
  const { page } = await params
  const pageNum = Number(page)
  if (Number.isNaN(pageNum) || pageNum < 1) {
    return { title: 'Blog | Planenadler' }
  }
  return {
    title: `Blog – Seite ${pageNum} | Planenadler`,
    description:
      'Tipps, Anleitungen & Wissen rund um PVC-Planen, Abdeckungen und Maßanfertigung.',
  }
}

export default async function BlogPageByNumber({ params }: BlogPagePageProps) {
  const { page } = await params
  const pageNum = Number(page)

  if (Number.isNaN(pageNum) || pageNum < 1) {
    notFound()
  }

  const result = await getPaginatedBlogPosts(pageNum, 9)

  if (result.page !== pageNum || result.items.length === 0) {
    notFound()
  }

  const { items, totalPages, total } = result

  return (
    <main className="min-h-screen bg-white pb-16 sm:pt-20">
      <TopBar />
      <BlogHeroSection />
      <BlogGridSection
        posts={items}
        currentPage={pageNum}
        totalPages={totalPages}
        total={total}
      />
      <Footer />
      <Stickynav />
    </main>
  )
}
