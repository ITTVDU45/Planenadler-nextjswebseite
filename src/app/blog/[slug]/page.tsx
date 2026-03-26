import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { getBreadcrumbJsonLd } from '@/lib/seo-schema'
import { ContentShell } from '@/shared/components/ContentShell.component'
import {
  getBlogPosts,
  getPostBySlug,
  getUniqueCategoriesFromPosts,
  BlogMeta,
  BlogContent,
  BlogSidebar,
  RelatedPosts,
} from '@/features/blog'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planenadler.de'

interface BlogSlugPageProps {
  params: Promise<{ slug: string }>
}

function buildCanonical(slug: string): string {
  const base = SITE_URL.replace(/\/$/, '')
  return `${base}/blog/${slug}`
}

function categoryNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function pickRelatedPosts(
  posts: Awaited<ReturnType<typeof getBlogPosts>>,
  currentSlug: string,
  categorySlug?: string,
  limit = 4
) {
  const rest = posts
    .filter((candidate) => candidate.slug !== currentSlug)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  if (!categorySlug) return rest.slice(0, limit)

  const inCategory = rest.filter((candidate) =>
    candidate.categories?.some((category) => category.slug === categorySlug) ||
    categoryNameToSlug(candidate.category ?? '') === categorySlug
  )

  return (inCategory.length > 0 ? inCategory : rest).slice(0, limit)
}

export async function generateMetadata({ params }: BlogSlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Artikel nicht gefunden | Planenadler' }

  const title = `${post.title} | Planenadler`
  const description = post.excerpt.slice(0, 160).trim()
  const canonical = buildCanonical(slug)
  const image = post.coverImage?.src
    ? post.coverImage.src.startsWith('http')
      ? post.coverImage.src
      : `${SITE_URL}${post.coverImage.src}`
    : undefined

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

  const allPosts = await getBlogPosts()
  const categorySlug =
    post.categories?.[0]?.slug ??
    (post.category ? categoryNameToSlug(post.category) : undefined)
  const categories = getUniqueCategoriesFromPosts(allPosts)
  const relatedPosts = pickRelatedPosts(allPosts, slug, categorySlug, 4)
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
    image: post.coverImage?.src
      ? post.coverImage.src.startsWith('http')
        ? post.coverImage.src
        : `${SITE_URL}${post.coverImage.src}`
      : undefined,
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

      <section className="w-full bg-gradient-to-b from-[#DBE9F9]/30 via-white to-[#F7FAFF] py-8 lg:py-12">
        <ContentShell>
          <div className="relative overflow-hidden rounded-[36px] border border-[#DBE9F9] bg-[#0E376E] shadow-[0_30px_80px_rgba(31,92,171,0.18)]">
            <div className="relative min-h-[320px] sm:min-h-[380px] lg:min-h-[460px]">
              <Image
                src={post.coverImage.src}
                alt={post.coverImage.alt}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#08264F]/85 via-[#08264F]/45 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
                <div className="max-w-3xl rounded-[28px] border border-white/20 bg-white/92 p-6 backdrop-blur md:p-8">
                  <nav aria-label="Breadcrumb" className="mb-4">
                    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#1F5CAB]/70">
                      <li>
                        <Link href="/" className="transition hover:text-[#1F5CAB]">
                          Home
                        </Link>
                      </li>
                      <li aria-hidden>/</li>
                      <li>
                        <Link href="/blog" className="transition hover:text-[#1F5CAB]">
                          News &amp; Ratgeber
                        </Link>
                      </li>
                      {categorySlug ? (
                        <>
                          <li aria-hidden>/</li>
                          <li>
                            <Link
                              href={`/blog?category=${encodeURIComponent(categorySlug)}`}
                              className="transition hover:text-[#1F5CAB]"
                            >
                              {post.categories?.[0]?.name ?? post.category}
                            </Link>
                          </li>
                        </>
                      ) : null}
                    </ol>
                  </nav>

                  <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#1F5CAB] sm:text-4xl lg:text-5xl">
                    {post.title}
                  </h1>

                  {post.excerpt ? (
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[#1F5CAB]/75 sm:text-base">
                      {post.excerpt}
                    </p>
                  ) : null}

                  <div className="mt-5">
                    <BlogMeta
                      date={post.publishedAt}
                      category={post.categories?.[0]?.name ?? post.category}
                      readingTimeMin={post.readingTimeMin}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentShell>
      </section>

      <section className="pb-8 pt-10 lg:pb-12 lg:pt-14">
        <ContentShell>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              <article className="rounded-[32px] border border-[#DBE9F9] bg-white p-6 shadow-[0_18px_40px_rgba(31,92,171,0.08)] sm:p-8 lg:p-10">
                <BlogContent html={post.content ?? ''} />
              </article>
            </div>
            <div className="lg:col-span-4">
              <BlogSidebar
                categories={categories}
                currentCategorySlug={categorySlug}
                tags={post.tags}
              />
            </div>
          </div>

          <RelatedPosts posts={relatedPosts} title="Weitere Blogartikel" />
        </ContentShell>
      </section>

      <Footer />
      <Stickynav />
    </main>
  )
}
