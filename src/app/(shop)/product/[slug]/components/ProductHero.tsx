 'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { GoogleReviewBadge } from '@/shared/components/GoogleReviewBadge'
import type { TruckTarpProduct } from './types'
import type { GoogleReviewData } from '@/lib/google-reviews'

interface ProductHeroProps {
  product: TruckTarpProduct
  googleReviews?: GoogleReviewData | null
}

const PAYMENT_BADGES = [
  { label: 'Affirm', src: '/images/Zahlungsmittel/affirm.png' },
  { label: 'Afterpay', src: '/images/Zahlungsmittel/afterpay.png' },
  { label: 'Amazon Pay', src: '/images/Zahlungsmittel/amazon_pay.png' },
  { label: 'Apple Pay', src: '/images/Zahlungsmittel/apple_pay.png' },
  { label: 'Bancontact', src: '/images/Zahlungsmittel/bancontact.png' },
  { label: 'Google Pay', src: '/images/Zahlungsmittel/google_pay.png' },
  { label: 'JCB', src: '/images/Zahlungsmittel/jcb.png' },
  { label: 'Klarna', src: '/images/Zahlungsmittel/klarna.png' },
  { label: 'Visa', src: '/images/Zahlungsmittel/visa.png' },
  { label: 'Mastercard', src: '/images/Zahlungsmittel/mastercard.png' },
  { label: 'PayPal', src: '/images/Zahlungsmittel/paypal.png' },
  { label: 'Stripe', src: '/images/Zahlungsmittel/stripe.png' },
]

export default function ProductHero({ product, googleReviews }: ProductHeroProps) {
  const heroImages = useMemo(() => {
    const unique = new Map<string, typeof product.image>()

    ;[product.image, ...product.gallery].forEach((image) => {
      if (!image?.src || unique.has(image.src)) {
        return
      }

      unique.set(image.src, image)
    })

    return Array.from(unique.values())
  }, [product])

  const [activeImageSrc, setActiveImageSrc] = useState(heroImages[0]?.src ?? product.image.src)
  const activeImage =
    heroImages.find((image) => image.src === activeImageSrc) ?? heroImages[0] ?? product.image

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
              <div className="mt-2 flex flex-wrap items-center gap-2.5">
                {PAYMENT_BADGES.map((method) => (
                  <div
                    key={method.label}
                    className="flex h-14 min-w-[96px] items-center justify-center rounded-2xl border border-[#D9E7F8] bg-[#F8FBFF] px-4 shadow-[0_4px_12px_rgba(15,43,82,0.04)]"
                    title={method.label}
                    aria-label={method.label}
                  >
                    <Image
                      src={method.src}
                      alt={method.label}
                      width={72}
                      height={30}
                      sizes="72px"
                      className="h-auto max-h-8 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            {googleReviews && googleReviews.totalReviews > 0 && (
              <GoogleReviewBadge reviews={googleReviews} />
            )}
          </div>
        </div>

        <div className="order-1 md:order-2">
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl bg-[#F7FAFE] shadow-[0_18px_45px_rgba(15,43,82,0.08)]">
            <Image
              src={activeImage.src}
              alt={activeImage.alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-contain p-5"
            />
          </div>
          {heroImages.length > 1 ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {heroImages.map((image, index) => {
                const isActive = image.src === activeImage.src

                return (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => setActiveImageSrc(image.src)}
                    aria-label={`Produktbild ${index + 1} anzeigen`}
                    aria-pressed={isActive}
                    className={`relative h-20 w-20 overflow-hidden rounded-2xl border bg-white p-1.5 transition ${
                      isActive
                        ? 'border-[#1F5CAB] shadow-[0_10px_24px_rgba(31,92,171,0.22)]'
                        : 'border-[#D9E7F8] hover:border-[#AFC9EA]'
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="80px"
                      className="rounded-xl object-cover"
                    />
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
