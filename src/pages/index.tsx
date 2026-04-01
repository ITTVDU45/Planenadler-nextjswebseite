import Head from 'next/head'
import dynamic from 'next/dynamic'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import Layout from '@/shared/components/Layout.component'
import {
  HeroSlider,
  BenefitsStrip,
  CategoriesStrip,
  InfoWithImageLeft,
  InfoWithCounters,
  BlogShowcase,
  FAQ,
} from '@/features/home'
import { ProductsShowcase } from '@/features/home/sections/ProductsShowcase'
import { CONTACT_INFO_ITEMS } from '@/features/contact'
import { ContentShell } from '@/shared/components/ContentShell.component'
import { fetchGoogleReviews } from '@/lib/google-reviews'
import type { GoogleReviewData } from '@/lib/google-reviews'
import { getRecentBlogPosts } from '@/features/blog'
import {
  getCategoriesFromBlogPosts,
  mapBlogPostToArticle,
} from '@/features/home/sections/BlogShowcase/mapBlogPostToArticle'
import type { Article, ArticleCategory } from '@/features/home/sections/BlogShowcase/types'
import { absoluteUrl } from '@/lib/seo'
import { getBreadcrumbJsonLd, getWebPageJsonLd } from '@/lib/seo-schema'
import { gqlFetch } from '@/features/home/sections/ProductsShowcase/api/fetcher'
import { GET_PRODUCTS_ALL } from '@/features/home/sections/ProductsShowcase/api/queries'
import {
  mapNodeToCard,
  sortProducts,
  type ProductNode,
} from '@/features/home/sections/ProductsShowcase/lib'
import type { ProductCardItem } from '@/features/home/sections/ProductsShowcase/types'

const PAGE_TITLE = 'Planenadler - Massgeschneiderte PVC-Planen'
const META_DESCRIPTION =
  'Massgeschneiderte PVC-Planen fuer Terrasse, Pool, Anhaenger und individuelle Abdeckungen direkt von Planenadler.'
const CANONICAL_URL = absoluteUrl('/')
const OG_IMAGE_URL = absoluteUrl('/Planenadlerlogo.png')

const GoogleReviewSlider = dynamic(
  () => import('@/shared/components/GoogleReviewSlider').then((mod) => mod.GoogleReviewSlider),
)
const InfoWithImageRight = dynamic(
  () =>
    import('@/features/home/sections/InfoWithImageRight/InfoWithImageRight').then(
      (mod) => mod.InfoWithImageRight,
    ),
)

interface ProductsResult {
  products: {
    nodes: ProductNode[]
  }
}

const DEFAULT_GRAPHQL_ENDPOINT = 'https://wp.planenadler.de/graphql'

async function fetchHomepageProducts(): Promise<ProductsResult> {
  const configuredEndpoint =
    process.env.GRAPHQL_SERVER_URL?.trim() || process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim()

  const endpoints = Array.from(
    new Set([configuredEndpoint, DEFAULT_GRAPHQL_ENDPOINT].filter((value): value is string => Boolean(value))),
  )

  let lastError: unknown = null

  for (const endpoint of endpoints) {
    try {
      return await gqlFetch<ProductsResult>(endpoint, {
        query: GET_PRODUCTS_ALL,
        timeoutMs: 12000,
      })
    } catch (error) {
      lastError = error
    }
  }

  if (lastError) {
    console.error('[HomepageProducts] GraphQL fetch failed', lastError)
  }

  return { products: { nodes: [] } }
}

export const getStaticProps: GetStaticProps<{
  googleReviews: GoogleReviewData
  blogArticles: Article[]
  blogCategories: ArticleCategory[]
  products: ProductCardItem[]
}> = async () => {
  const [googleReviews, recentPosts, productsResult] = await Promise.all([
    fetchGoogleReviews(),
    getRecentBlogPosts(4),
    fetchHomepageProducts(),
  ])

  const blogArticles = recentPosts.map(mapBlogPostToArticle)
  const blogCategories = getCategoriesFromBlogPosts(recentPosts)
  const products = sortProducts((productsResult.products?.nodes ?? []).map(mapNodeToCard))

  return {
    props: {
      googleReviews,
      blogArticles,
      blogCategories,
      products,
    },
    revalidate: 3600,
  }
}

function Index({
  googleReviews,
  blogArticles,
  blogCategories,
  products,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const webPageJsonLd = getWebPageJsonLd(PAGE_TITLE, '/', META_DESCRIPTION)
  const breadcrumbJsonLd = getBreadcrumbJsonLd([{ name: 'Home', path: '/' }])

  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link rel="canonical" href={CANONICAL_URL} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={META_DESCRIPTION} />
        <meta property="og:url" content={CANONICAL_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={OG_IMAGE_URL} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={META_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </Head>
      <Layout title={PAGE_TITLE} showPageTitle={false}>
        <HeroSlider autoPlayMs={6000} />
        <CategoriesStrip />
        <ProductsShowcase products={products} />
        <InfoWithImageLeft />
        <InfoWithImageRight />
        <InfoWithCounters />
        <BenefitsStrip />
        <GoogleReviewSlider data={googleReviews} />
        <BlogShowcase articles={blogArticles} categories={blogCategories} />
        <FAQ />

        <section className="w-full bg-[#F4F8FD] py-16 lg:py-24">
          <ContentShell>
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#3982DC]">
                Kontakt
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#1F5CAB] sm:text-3xl lg:text-4xl">
                So erreichen Sie uns
              </h2>
              <p className="mt-3 text-sm text-[#1F5CAB]/70 sm:text-base">
                Rufen Sie uns an, schreiben Sie eine E-Mail oder besuchen Sie uns vor Ort.
              </p>
            </div>
            <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3">
              {CONTACT_INFO_ITEMS.map((card) => {
                const isLight = card.bgColor === '#FFFFFF'
                return (
                  <div
                    key={card.id}
                    className="flex flex-col justify-between rounded-[24px] p-5 sm:p-6"
                    style={{ backgroundColor: card.bgColor }}
                  >
                    <div>
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider ${card.subTextColor}`}
                      >
                        {card.title}
                      </p>
                      <div className={`mt-3 text-sm font-semibold sm:text-base ${card.textColor}`}>
                        {card.value}
                      </div>
                    </div>
                    {card.primaryAction ? (
                      <a
                        href={card.primaryAction.href}
                        className={[
                          'mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-xs font-bold transition-all focus:outline-none focus:ring-2',
                          isLight
                            ? 'bg-[#3982DC] text-white hover:bg-[#1F5CAB] focus:ring-[#3982DC]/40'
                            : 'bg-white text-[#1F5CAB] hover:bg-[#DBE9F9] focus:ring-white/60',
                        ].join(' ')}
                      >
                        {card.primaryAction.label}
                      </a>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </ContentShell>
        </section>
      </Layout>
    </>
  )
}

export default Index
