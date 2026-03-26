import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ProductGallery from './ProductGallery'
import { GoogleReviewBadge } from '@/shared/components/GoogleReviewBadge'
import type { TruckTarpProduct } from './types'
import type { GoogleReviewData } from '@/lib/google-reviews'

interface ProductHeroProps {
  product: TruckTarpProduct
  googleReviews?: GoogleReviewData | null
}

export default function ProductHero({ product, googleReviews }: ProductHeroProps) {
  return (
    <section className="py-12 md:py-16" aria-labelledby="product-title">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-2 md:items-center">
        <div className="order-2 md:order-1">
          <h1 id="product-title" className="text-3xl font-extrabold tracking-tight text-[#0F2B52] md:text-5xl">
            {product.title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#1F5CAB]/85 md:text-base">
            {product.subtitle}
          </p>

          <div className="mt-6">
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#3982DC]">Ab Preis</p>
            <p className="mt-1 text-3xl font-bold text-[#1F5CAB]">{product.price}</p>
          </div>

          <div className="mt-8">
            <Button asChild size="lg" className="rounded-xl">
              <Link href="#konfigurator">{product.ctaLabel}</Link>
            </Button>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3982DC]">
                Sichere Zahlung
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {['Visa', 'Mastercard', 'PayPal', 'Klarna', 'SEPA'].map((method) => (
                  <span
                    key={method}
                    className="rounded-full border border-[#D9E7F8] bg-[#F8FBFF] px-3 py-1 text-[11px] font-semibold text-[#1F5CAB]"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>

            {googleReviews && googleReviews.totalReviews > 0 && (
              <GoogleReviewBadge reviews={googleReviews} />
            )}
          </div>
        </div>

        <div className="order-1 md:order-2">
          <ProductGallery mainImage={product.image} images={product.gallery} />
        </div>
      </div>
    </section>
  )
}
