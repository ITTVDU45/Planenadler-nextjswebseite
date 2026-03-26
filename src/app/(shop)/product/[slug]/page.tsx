import type { Metadata } from 'next'
import ProductFeatures from './components/ProductFeatures'
import ProductGallery from './components/ProductGallery'
import ProductConfigurator from './components/ProductConfigurator'
import ProductTabs from './components/ProductTabs'
import ProductRecommendations from './components/ProductRecommendations'
import { getCachedProductPageData } from './product-page-cache'
import { ProductBlogFaqBoundary, ProductHeroReviewsBoundary } from './ProductPageStreaming'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { SITE_NAME, absoluteUrl } from '@/lib/seo'
import { getBreadcrumbJsonLd } from '@/lib/seo-schema'

/**
 * ISR (Sekunden). Muss ein **konstanter** Wert sein (Next.js Segment Config ist statisch zu analysieren).
 * Feintuning des Daten-Caches: weiterhin `PRODUCT_PAGE_REVALIDATE_SECONDS` in product-data / product-page-cache.
 */
export const revalidate = 300

interface ProductPageProps {
  params: { slug?: string } | Promise<{ slug?: string }>
}

async function resolveSlug(params: ProductPageProps['params']): Promise<string> {
  const resolved = await params
  return typeof resolved?.slug === 'string' && resolved.slug.length > 0
    ? resolved.slug
    : 'lkw-plane-individuell'
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const slug = await resolveSlug(params)
  const product = await getCachedProductPageData(slug)
  const title = `${product.title} | ${SITE_NAME}`
  const description = (product.subtitle || `${product.title} online konfigurieren und anfragen.`).slice(0, 160)
  const canonical = absoluteUrl(`/product/${slug}`)
  const imageUrl = product.image?.src
    ? absoluteUrl(product.image.src)
    : absoluteUrl('/Planenadlerlogo.png')

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: [
        {
          url: imageUrl,
          alt: product.image?.alt ?? product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const slug = await resolveSlug(params)
  const product = await getCachedProductPageData(slug)

  const breadcrumbSchema = getBreadcrumbJsonLd([
    { name: 'Startseite', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: product.title, path: `/product/${slug}` },
  ])

  const numericPrice = Number.parseFloat(
    product.price
      .replace(/[^0-9,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.'),
  )
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.subtitle,
    image: [product.image.src, ...product.gallery.map((image) => image.src)].map((src) => absoluteUrl(src)),
    sku: String(product.databaseId || slug),
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    category: 'PVC-Plane',
    url: absoluteUrl(`/product/${slug}`),
    offers: Number.isFinite(numericPrice)
      ? {
          '@type': 'Offer',
          priceCurrency: 'EUR',
          price: numericPrice.toFixed(2),
          availability: 'https://schema.org/InStock',
          url: absoluteUrl(`/product/${slug}`),
        }
      : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <main className="bg-white pb-16 sm:pt-20">
        <TopBar />
        <ProductHeroReviewsBoundary product={product} />
        <ProductFeatures items={product.features} />

        <section id="konfigurator" className="py-12 md:py-16" aria-labelledby="configurator-title">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <h2 id="configurator-title" className="mb-4 text-2xl font-bold text-[#0F2B52]">
                Individuelle Konfiguration
              </h2>
              <ProductGallery mainImage={product.image} images={product.gallery} />
            </div>
            <ProductConfigurator
              productId={product.databaseId}
              productName={product.title}
              price={product.price}
              hints={product.configuratorHints}
              configuratorOptions={product.configuratorOptions}
              priceEndpoint={product.priceEndpoint}
            />
          </div>
        </section>

        <ProductTabs tabs={product.tabs} />
        <ProductRecommendations items={product.recommendations} />
        <ProductBlogFaqBoundary />
        <Footer />
        <span className="sr-only">Produkt-Slug: {slug}</span>
      </main>
      <Stickynav />
    </>
  )
}
