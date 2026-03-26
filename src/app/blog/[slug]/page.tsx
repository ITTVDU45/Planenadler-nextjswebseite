import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { getBreadcrumbJsonLd } from '@/lib/seo-schema'
import { ContentShell } from '@/shared/components/ContentShell.component'
import {
  getPostBySlug,
  getRelatedPosts,
  BlogHeader,
  BlogMeta,
  BlogContent,
  BlogSidebar,
} from '@/features/blog'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planenadler.de'

interface BlogSlugPageProps {
  params: Promise<{ slug: string }>
}

function buildCanonical(slug: string): string {
  const base = SITE_URL.replace(/\/$/, '')
  return `${base}/blog/${slug}`
}

export async function generateMetadata({ params }: BlogSlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Artikel nicht gefunden | Planenadler' }

  const title = `${post.title} | Planenadler`
  const description = post.excerpt.slice(0, 160).trim()
  const canonical = buildCanonical(slug)
  const image = post.coverImage?.src ? (post.coverImage.src.startsWith('http') ? post.coverImage.src : `${SITE_URL}${post.coverImage.src}`) : undefined

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author] : undefined,
      images: image ? [{ url: image, alt: post.coverImage?.alt ?? post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function BlogSlugPage({ params }: BlogSlugPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const categorySlug = post.categories?.[0]?.slug ?? (post.category ? post.category.toLowerCase().replace(/\s+/g, '-') : undefined)
  const relatedPosts = await getRelatedPosts(slug, categorySlug, 4)
  const shareUrl = buildCanonical(slug)
  const breadcrumbSchema = getBreadcrumbJsonLd([
    { name: 'Startseite', path: '/' },
    { name: 'News & Ratgeber', path: '/blog' },
    { name: post.title, path: `/blog/${slug}` },
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage?.src ? (post.coverImage.src.startsWith('http') ? post.coverImage.src : `${SITE_URL}${post.coverImage.src}`) : undefined,
    datePublished: post.publishedAt,
    mainEntityOfPage: shareUrl,
    author: post.author
      ? { '@type': 'Person', name: post.author }
      : { '@type': 'Organization', name: 'Planenadler' },
    publisher: {
      '@type': 'Organization',
      name: 'Planenadler',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/Planenadlerlogo.png`,
      },
    },
  }

  return (
    <main className="min-h-screen bg-white pb-16 sm:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <TopBar />
      <section className="w-full bg-gradient-to-b from-[#DBE9F9]/30 to-[#F7FAFF] py-10 lg:py-14">
        <ContentShell>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              <BlogHeader post={post} />
              <BlogMeta
                date={post.publishedAt}
                category={post.categories?.[0]?.name ?? post.category}
                readingTimeMin={post.readingTimeMin}
              />
              <BlogContent html={post.content ?? ''} />
            </div>
            <div className="lg:col-span-4">
              <BlogSidebar recentPosts={relatedPosts} tags={post.tags} />
            </div>
          </div>
        </ContentShell>
      </section>
      <Footer />
      <Stickynav />
    </main>
  )
}
