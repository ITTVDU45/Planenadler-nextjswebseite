'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { ProductImage } from './types'

interface ProductGalleryProps {
  mainImage: ProductImage
  images: ProductImage[]
  className?: string
}

export default function ProductGallery({ mainImage, images, className }: ProductGalleryProps) {
  const items = useMemo(() => {
    const all = [mainImage, ...images]
    const seen = new Map<string, ProductImage>()
    all.forEach((item) => {
      if (item.src && !seen.has(item.src)) {
        seen.set(item.src, item)
      }
    })
    return Array.from(seen.values())
  }, [images, mainImage])

  const [activeSrc, setActiveSrc] = useState(items[0]?.src ?? mainImage.src)
  const activeItem = items.find((item) => item.src === activeSrc) ?? items[0] ?? mainImage

  return (
    <div className={cn('space-y-4 lg:flex lg:h-full lg:flex-col lg:space-y-0', className)}>
      <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl bg-[#F7FAFE] lg:min-h-0 lg:flex-1 lg:aspect-auto">
        <Image
          src={activeItem.src}
          alt={activeItem.alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 45vw"
          className="object-contain p-5"
        />
      </div>

      <div className="grid grid-cols-5 gap-2 lg:mt-4 lg:flex-none">
        {items.slice(0, 5).map((item, index) => {
          const isActive = item.src === activeItem.src
          return (
            <button
              key={`${item.src}-${index}`}
              type="button"
              onClick={() => setActiveSrc(item.src)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-xl border bg-white transition',
                isActive ? 'border-[#1F5CAB] shadow-[0_6px_16px_rgba(15,43,82,0.12)]' : 'border-[#E5ECF8] hover:border-[#BCD3EE]',
              )}
              aria-label={`Bild ${index + 1} anzeigen`}
              aria-current={isActive ? 'true' : 'false'}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
