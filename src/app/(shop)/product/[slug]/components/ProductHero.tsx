import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ProductGallery from './ProductGallery'
import type { TruckTarpProduct } from './types'

interface ProductHeroProps {
  product: TruckTarpProduct
}

export default function ProductHero({ product }: ProductHeroProps) {
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

            <div className="mt-3 rounded-lg border border-[#EAF1FB] bg-[#FCFDFF] p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F3F7FE] text-xs font-semibold text-[#1F5CAB]/85">
                    G
                  </span>
                  <p className="text-xs font-semibold text-[#1F5CAB]/85">Google Bewertungen</p>
                </div>
                <span className="text-[11px] text-[#1F5CAB]/55">Trusted</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#0F2B52]">4.8</span>
                <div className="flex items-center gap-0.5" aria-label="4.8 von 5 Sternen">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} width="12" height="12" viewBox="0 0 24 24" aria-hidden>
                      <path
                        d="M12 3.5l2.7 5.6 6.2.9-4.5 4.3 1.1 6.2L12 17.7 6.5 20.5l1.1-6.2-4.5-4.3 6.2-.9L12 3.5z"
                        fill="#F4B545"
                        stroke="#F4B545"
                        strokeWidth="1"
                      />
                    </svg>
                  ))}
                </div>
                <span className="text-[11px] text-[#1F5CAB]/65">(236 Rezensionen)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 md:order-2">
          <ProductGallery mainImage={product.image} images={product.gallery} />
        </div>
      </div>
    </section>
  )
}
