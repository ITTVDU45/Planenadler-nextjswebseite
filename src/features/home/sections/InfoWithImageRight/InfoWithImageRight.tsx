 'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import type { InfoWithImageRightContent } from './types'
import { INFO_WITH_IMAGE_RIGHT } from './data'
import { ActionButton } from '../InfoWithCounters/ActionButton'
import { ContentShell } from '@/shared/components/ContentShell.component'

interface InfoWithImageRightProps {
  content?: InfoWithImageRightContent
}

export function InfoWithImageRight({
  content = INFO_WITH_IMAGE_RIGHT,
}: InfoWithImageRightProps) {
  const images = content.images.length ? content.images : INFO_WITH_IMAGE_RIGHT.images
  const [activeIndex, setActiveIndex] = useState(0)
  const total = images.length

  const activeImage = useMemo(() => images[activeIndex], [images, activeIndex])
  const goNext = () => setActiveIndex((index) => (index + 1) % total)
  const goPrev = () => setActiveIndex((index) => (index - 1 + total) % total)

  return (
    <section className="w-full bg-white py-16 lg:py-24">
      <ContentShell>
        <div className="mb-8 max-w-4xl sm:mb-10 lg:mb-16">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#1F5CAB] sm:text-4xl lg:text-6xl">
            {content.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-14">
          <div className="flex flex-col justify-center lg:col-span-5 xl:col-span-4 lg:pt-8">
            <p className="text-sm leading-relaxed text-[#1F5CAB]/80 sm:text-base lg:text-lg">
              {content.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              {content.buttons.map((button) => (
                <ActionButton key={`${button.href}-${button.label}`} button={button} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#DBE9F9] sm:rounded-[2.5rem]">
              <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 text-[#1F5CAB] shadow-md transition hover:bg-white"
                  aria-label="Vorheriges Bild"
                >
                  ‹
                </button>
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 text-[#1F5CAB] shadow-md transition hover:bg-white"
                  aria-label="Nächstes Bild"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </ContentShell>
    </section>
  )
}
