import Head from 'next/head'
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import Layout from '@/shared/components/Layout.component'
import {
  HeroSection,
  AboutStorySection,
  MissionSection,
  ConfiguratorSection,
  BenefitsSection,
  ProductGridSection,
  FAQSection,
  buildFaqSchema,
  ABOUT_FAQ_ITEMS,
} from '@/features/about'
import { BlogShowcase } from '@/features/home'
import {
  getCategoriesFromBlogPosts,
  mapBlogPostToArticle,
} from '@/features/home/sections/BlogShowcase/mapBlogPostToArticle'
import type { ProductGroupCard } from '@/features/about/types'
import {
  mergeProductGroupsWithApiProducts,
  type ApiProductForMerge,
} from '@/features/about/lib/mergeProductGroupsWithApi'
import { FETCH_ALL_PRODUCTS_QUERY } from '@/features/product/api/queries'
import { fetchGraphqlWithFallback } from '@/features/product/api/server-fetch'
import { getRecentBlogPosts } from '@/features/blog'
import type { Article, ArticleCategory } from '@/features/home/sections/BlogShowcase/types'
import { absoluteUrl } from '@/lib/seo'
import { getBreadcrumbJsonLd, getWebPageJsonLd } from '@/lib/seo-schema'

const PAGE_TITLE = 'Ueber uns | Planenadler'
const META_DESCRIPTION =
  'Planenadler entwickelt massgeschneiderte PVC-Planen in hoher Qualitaet fuer Terrasse, Pool, Anhaenger und viele weitere Anwendungen.'
const CANONICAL_URL = absoluteUrl('/ueber-uns')
const OG_IMAGE_URL = absoluteUrl('/Planenadlerlogo.png')

const UeberUns: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  productGroups,
  blogArticles,
  blogCategories,
}) => {
  const faqSchema = buildFaqSchema(ABOUT_FAQ_ITEMS)
  const webPageJsonLd = getWebPageJsonLd(PAGE_TITLE, '/ueber-uns', META_DESCRIPTION)
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Ueber uns', path: '/ueber-uns' },
  ])

  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link rel="canonical" href={CANONICAL_URL} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={META_DESCRIPTION} />
        <meta property="og:url" content={CANONICAL_URL} />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Head>
      <Layout title={PAGE_TITLE}>
        <HeroSection />
        <AboutStorySection />
        <MissionSection />
        <ConfiguratorSection />
        <BenefitsSection />
        <ProductGridSection products={productGroups} />
        <BlogShowcase articles={blogArticles} categories={blogCategories} />
        <FAQSection />
      </Layout>
    </>
  )
}

export default UeberUns

export const getStaticProps: GetStaticProps<{
  productGroups: ProductGroupCard[]
  blogArticles: Article[]
  blogCategories: ArticleCategory[]
}> = async () => {
  let productGroups: ProductGroupCard[] = mergeProductGroupsWithApiProducts([])
  let blogArticles: Article[] = []
  let blogCategories: ArticleCategory[] = [{ id: 'all', label: 'Alle', slug: 'all' }]

  try {
    const posts = await getRecentBlogPosts(4)
    blogArticles = posts.map(mapBlogPostToArticle)
    blogCategories = getCategoriesFromBlogPosts(posts)
    if (blogCategories.length === 0) {
      blogCategories = [{ id: 'all', label: 'Alle', slug: 'all' }]
    }
  } catch {
    // API fallback stays inside service layer.
  }

  try {
    const productsResult = await fetchGraphqlWithFallback<{
      products?: { nodes?: ApiProductForMerge[] }
    }>(FETCH_ALL_PRODUCTS_QUERY)
    const nodes = productsResult.products?.nodes ?? []
    productGroups = mergeProductGroupsWithApiProducts(nodes)
  } catch (error) {
    console.error('[AboutPage] GraphQL fetch failed', error)
    productGroups = mergeProductGroupsWithApiProducts([])
  }

  return {
    props: {
      productGroups,
      blogArticles,
      blogCategories,
    },
    revalidate: 60,
  }
}
