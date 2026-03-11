import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { decodePriceDisplay } from '@/shared/lib/functions'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import type { ProductCardItem } from '../types'

interface ProductCardProps {
  product: ProductCardItem
}

function sanitizeProductHtml(input?: string) {
  if (!input) return ''
  return input
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
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


export function ProductCard({ product }: ProductCardProps) {
  const displayRating = '4,5+'
  const priceValue = decodePriceDisplay(product.price)
  const priceLabel = priceValue ? `ab ${priceValue}` : 'ab —'
  const shortDescriptionHtml = sanitizeProductHtml(product.shortDescription)
  const descriptionHtml = sanitizeProductHtml(product.description)
  const productHref = product.slug ? `/product/${product.slug}` : '/product/lkw-plane-individuell'
  const galleryImages = useMemo(() => {
    const allImages = [product.image, ...product.gallery]
    const deduped = new Map<string, { src: string; alt: string }>()
    allImages.forEach((image) => {
      if (!image?.src) return
      if (!deduped.has(image.src)) {
        deduped.set(image.src, { src: image.src, alt: image.alt || product.name })
      }
    })
    return Array.from(deduped.values())
  }, [product.gallery, product.image, product.name])
  const [activeImageSrc, setActiveImageSrc] = useState(galleryImages[0]?.src ?? product.image.src)

  useEffect(() => {
    setActiveImageSrc(galleryImages[0]?.src ?? product.image.src)
  }, [galleryImages, product.image.src])

  return (
    <div className="rounded-[2rem] bg-white p-4 shadow-[0_10px_30px_rgba(31,92,171,0.08)] transition hover:-translate-y-1 sm:p-5">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-[#F9F9F4]">
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label={`Produktinfo anzeigen: ${product.name}`}
              className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#DBE9F9] bg-white/90 text-[#1F5CAB] shadow-sm transition hover:bg-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 10.2v6M12 7.8h.01"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            closeClassName="z-20 border-transparent bg-[#1F5CAB] text-white shadow-md hover:bg-[#0F2B52]"
            className="modern-popup-scrollbar inset-x-0 bottom-0 h-auto max-h-[90vh] gap-5 overflow-y-auto rounded-t-[1.75rem] border border-[#E3EDF9] bg-white p-5 text-[#1F5CAB] shadow-[0_-28px_58px_rgba(15,43,82,0.18)] sm:left-1/2 sm:max-w-3xl sm:-translate-x-1/2 sm:rounded-[1.75rem]"
          >
            <div className="rounded-2xl bg-[#F8FBFF] p-4">
              <h3 className="pr-10 text-xl font-bold text-[#1F5CAB]">{product.name}</h3>
              <div className="mt-1 text-base font-semibold text-[#3982DC]">
                {priceLabel}
              </div>
              <div className="mt-3">
                <Link
                  href={productHref}
                  className="inline-flex items-center rounded-full bg-[#1F5CAB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0F2B52]"
                >
                  Jetzt konfigurieren
                </Link>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl bg-white">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.25rem] bg-[#F9F9F4]">
                <Image
                  src={activeImageSrc || product.image.src}
                  alt={product.image.alt}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 640px) 90vw, 700px"
                />
              </div>

              {galleryImages.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {galleryImages.map((image, index) => {
                    const isActive = image.src === activeImageSrc
                    return (
                      <button
                        key={`${product.id}-gallery-${index}`}
                        type="button"
                        onClick={() => setActiveImageSrc(image.src)}
                        className={[
                          'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-[#F9F9F4] transition',
                          isActive ? 'border-[#1F5CAB]' : 'border-transparent',
                        ].join(' ')}
                        aria-label={`Galeriebild ${index + 1} anzeigen`}
                        aria-current={isActive ? 'true' : 'false'}
                      >
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-contain p-1.5"
                          sizes="64px"
                        />
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>

            <div className="space-y-4 rounded-2xl border border-[#E7EEF8] bg-[#FCFDFF] p-4">
              {shortDescriptionHtml ? (
                <div className="rounded-xl bg-white p-3">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-[#1F5CAB]">
                    Kurzbeschreibung
                  </h4>
                  <div
                    className="prose prose-sm mt-2 max-w-none text-sm leading-relaxed text-[#1F5CAB]/85 prose-p:my-1 prose-a:text-[#1F5CAB]"
                    dangerouslySetInnerHTML={{ __html: shortDescriptionHtml }}
                  />
                </div>
              ) : null}

              {descriptionHtml ? (
                <div className="rounded-xl bg-white p-3">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-[#1F5CAB]">
                    Beschreibung
                  </h4>
                  <div
                    className="prose prose-sm mt-2 max-w-none text-sm leading-relaxed text-[#1F5CAB]/85 prose-p:my-1 prose-a:text-[#1F5CAB]"
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                  />
                </div>
              ) : null}

              {product.attributes.length ? (
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wide text-[#1F5CAB]">
                    Eigenschaften
                  </h4>
                  <div className="mt-2 overflow-hidden rounded-xl border border-[#DBE9F9]">
                    {product.attributes.map((attribute, index) => (
                      <div
                        key={`${product.id}-attribute-${attribute.name}-${index}`}
                        className="grid grid-cols-2 gap-3 border-b border-[#DBE9F9] px-3 py-2 last:border-b-0"
                      >
                        <div className="text-xs font-semibold text-[#1F5CAB]">
                          {attribute.name}
                        </div>
                        <div className="text-xs text-[#1F5CAB]/80">
                          {attribute.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {!shortDescriptionHtml && !descriptionHtml && !product.attributes.length ? (
                <p className="text-sm text-[#1F5CAB]/80">
                  Derzeit sind keine weiteren Produktinformationen verfuegbar.
                </p>
              ) : null}
            </div>
          </SheetContent>
        </Sheet>
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          className="object-contain p-4 sm:p-6"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <StarIcon key={value} filled={value <= 5} />
          ))}
          <span className="ml-2 text-xs font-semibold text-[#3982DC]">
            {displayRating}
          </span>
        </div>
      </div>

      <div className="mt-4 text-sm font-semibold text-[#1F5CAB] sm:text-base">
        {product.name}
      </div>
      <div className="mt-1 text-sm font-bold text-[#3982DC] sm:text-base">
        {priceLabel}
      </div>
      <div className="mt-4">
        <Link
          href={productHref}
          className="inline-flex items-center rounded-full bg-[#1F5CAB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0F2B52]"
          aria-label={`Jetzt konfigurieren: ${product.name}`}
        >
          Jetzt konfigurieren
        </Link>
      </div>
    </div>
  )
}
