import Link from 'next/link'
import Image from 'next/image'
import { decodePriceDisplay } from '@/shared/lib/functions'
import type { ProductRecommendation } from './types'

interface ProductRecommendationCardProps {
  product: ProductRecommendation
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? '#F59E0B' : 'none'}
      stroke="#F59E0B"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M12 3.5l2.7 5.6 6.2.9-4.5 4.3 1.1 6.2L12 17.7 6.5 20.5l1.1-6.2-4.5-4.3 6.2-.9L12 3.5z" />
    </svg>
  )
}

export function ProductRecommendationCard({ product }: ProductRecommendationCardProps) {
  const priceValue = decodePriceDisplay(product.price)
  const priceLabel = priceValue ? `ab ${priceValue}` : 'Preis auf Anfrage'
  const productHref = `/product/${product.slug}`

  return (
    <article className="flex min-w-[280px] max-w-[340px] shrink-0 snap-start flex-col rounded-[2rem] bg-white p-4 shadow-[0_10px_30px_rgba(31,92,171,0.08)] transition hover:-translate-y-1 sm:p-5">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-[#F9F9F4]">
        {product.image?.src ? (
          <Image
            src={product.image.src}
            alt={product.image.alt || product.name}
            fill
            className="object-contain p-4 sm:p-6"
            sizes="(max-width: 640px) 80vw, 320px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[#1F5CAB]/40">
            Kein Bild
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <StarIcon key={value} filled={value <= 5} />
        ))}
        <span className="ml-2 text-xs font-semibold text-[#3982DC]">4,5+</span>
      </div>

      <h3 className="mt-3 text-sm font-semibold text-[#1F5CAB] sm:text-base">
        {product.name}
      </h3>
      <p className="mt-1 text-sm font-bold text-[#3982DC] sm:text-base">
        {priceLabel}
      </p>

      <div className="mt-4">
        <Link
          href={productHref}
          className="inline-flex items-center rounded-full bg-[#1F5CAB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0F2B52]"
          aria-label={`Jetzt konfigurieren: ${product.name}`}
        >
          Jetzt konfigurieren
        </Link>
      </div>
    </article>
  )
}
