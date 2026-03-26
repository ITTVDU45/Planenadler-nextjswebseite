import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { BlogHeroSection, BlogGridSection, getPaginatedBlogPosts } from '@/features/blog'
import { buildCanonicalMetadata } from '@/lib/seo'
import { getBreadcrumbJsonLd } from '@/lib/seo-schema'

interface BlogPagePageProps {
  params: Promise<{ page: string }>
}

export async function generateMetadata({
  params,
}: BlogPagePageProps): Promise<Metadata> {
  const { page } = await params
  const pageNum = Number(page)
  if (Number.isNaN(pageNum) || pageNum < 1) {
    return { title: 'News & Ratgeber | Planenadler' }
  }

  return buildCanonicalMetadata(
    `/blog/page/${pageNum}`,
    `News & Ratgeber - Seite ${pageNum}`,
    'Weitere Blogartikel, Tipps und Ratgeber zu PVC-Planen, Massanfertigung und Abdeckungen.'
  )
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
  const breadcrumbSchema = getBreadcrumbJsonLd([
    { name: 'Startseite', path: '/' },
    { name: 'News & Ratgeber', path: '/blog' },
    { name: `Seite ${pageNum}`, path: `/blog/page/${pageNum}` },
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
        <BlogGridSection
          posts={items}
          heading={`Seite ${pageNum} von ${totalPages} - ${total} Artikel`}
        />
        <Footer />
        <Stickynav />
      </main>
    </>
  )
}
