import Head from 'next/head'
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
import { mapBlogPostToArticle, getCategoriesFromBlogPosts } from '@/features/home/sections/BlogShowcase/mapBlogPostToArticle'
import type { ProductGroupCard } from '@/features/about/types'
import { mergeProductGroupsWithApiProducts } from '@/features/about/lib/mergeProductGroupsWithApi'
import client from '@/config/apollo/ApolloClient'
import { FETCH_ALL_PRODUCTS_QUERY } from '@/features/product/api/queries'
import { getRecentBlogPosts } from '@/features/blog'
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import type { Article, ArticleCategory } from '@/features/home/sections/BlogShowcase/types'

const PAGE_TITLE = 'Über uns | Planenadler'
const META_DESCRIPTION =
  'Planenadler – Maßgeschneiderte PVC-Planen in höchster Qualität. Individuelle Lösungen für Anhänger, Terrassen, Pools, Boote. Made in Germany, Maßanfertigung, schnelle Lieferung.'

const ÜberUns: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  productGroups,
  blogArticles,
  blogCategories,
}) => {
  const faqSchema = buildFaqSchema(ABOUT_FAQ_ITEMS)

  return (
    <>
      <Head>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={META_DESCRIPTION} />
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

export default ÜberUns

export const getStaticProps: GetStaticProps<{
  productGroups: ProductGroupCard[]
  blogArticles: Article[]
  blogCategories: ArticleCategory[]
}> = async () => {
  let productGroups: ProductGroupCard[] = mergeProductGroupsWithApiProducts([])
  let blogArticles: Article[] = []
  let blogCategories: ArticleCategory[] = [{ id: 'all', label: 'Alle', slug: 'all' }]

  // Blog separat laden – Fehler der Produkt-Abfrage beeinflussen Blog-Daten nicht
  try {
    const posts = await getRecentBlogPosts(4)
    blogArticles = posts.map(mapBlogPostToArticle)
    blogCategories = getCategoriesFromBlogPosts(posts)
    if (blogCategories.length === 0) {
      blogCategories = [{ id: 'all', label: 'Alle', slug: 'all' }]
    }
  } catch {
    // Fallback bleibt in getBlogPosts
  }

  // Produkte separat laden
  try {
    const productsResult = await client.query({ query: FETCH_ALL_PRODUCTS_QUERY })
    const nodes = productsResult.data?.products?.nodes ?? []
    productGroups = mergeProductGroupsWithApiProducts(nodes)
  } catch {
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
