'use client'

import { useEffect, useMemo, useState } from 'react'
import { LazyMotion, domAnimation, m } from 'motion/react'

import { HERO_SLIDES } from './data'
import type { HeroSlide } from './types'
import { HeroTextBlock } from './components/HeroTextBlock'
import { HeroCTA } from './components/HeroCTA'
import { HeroSlideCard } from './components/HeroSlideCard'
import { HeroSliderDots } from './components/HeroSliderDots'
import { HeroBackground } from './components/HeroBackground'
import { HeroOverlays } from './components/HeroOverlays'
import { ContentShell } from '@/shared/components/ContentShell.component'

interface HeroSliderProps {
  slides?: HeroSlide[]
  autoPlayMs?: number
}

export function HeroSlider({ slides = HERO_SLIDES, autoPlayMs }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const safeSlides = slides.length ? slides : HERO_SLIDES
  const count = safeSlides.length

  const activeSlide = safeSlides[activeIndex]
  const nextIndex = useMemo(
    () => (count ? (activeIndex + 1) % count : 0),
    [activeIndex, count],
  )
  const nextSlide = safeSlides[nextIndex]

  useEffect(() => {
    if (!autoPlayMs || count < 2) return
    const id = window.setInterval(
      () => setActiveIndex((value) => (value + 1) % count),
      autoPlayMs,
    )
    return () => window.clearInterval(id)
  }, [autoPlayMs, count])

  if (!count) return null

  return (
    <section className="relative w-full py-6">
      <ContentShell>
        <div className="relative w-full overflow-hidden rounded-[2.5rem]">
          <div className="relative min-h-[520px] h-[75vh] max-h-[900px] sm:min-h-[600px] sm:h-[80vh]">
          <HeroBackground
            image={activeSlide.background}
            slideId={activeSlide.id}
          />
          <HeroOverlays />

          <div className="relative z-10 flex h-full flex-col justify-between gap-8 px-8 pb-8 pt-8 sm:px-14 sm:pb-14 sm:pt-12">
            <div className="grid flex-1 grid-cols-12 items-center gap-6">
              <div className="col-span-12 sm:col-span-7 lg:col-span-6">
                <LazyMotion features={domAnimation}>
                  <m.div
                    key={`text-${activeSlide.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                  >
                    <HeroTextBlock
                      title={activeSlide.title}
                      subtitle={activeSlide.subtitle}
                      description={activeSlide.description}
                    />
                    <div className="mt-8">
                      <HeroCTA
                        label={activeSlide.cta.label}
                        href={activeSlide.cta.href}
                        bgColor={activeSlide.cta.bgColor}
                      />
                    </div>
                  </m.div>
                </LazyMotion>
              </div>

              <div className="relative col-span-12 hidden h-full sm:col-span-5 lg:col-span-6 sm:block">
                <div className="absolute -bottom-6 right-2 flex items-end gap-6 pr-6 sm:right-0 sm:pr-8 lg:pr-10">
                  <LazyMotion features={domAnimation}>
                    <m.div
                      key={`card-main-${activeSlide.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <HeroSlideCard
                        image={activeSlide.thumbMain}
                        variant="active"
                        ariaLabel={`Slide: ${activeSlide.title}`}
                      />
                    </m.div>
                  </LazyMotion>

                  {nextSlide ? (
                    <LazyMotion features={domAnimation}>
                      <m.div
                        key={`card-next-${nextSlide.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="translate-x-0 lg:translate-x-2"
                      >
                        <HeroSlideCard
                          image={nextSlide.background}
                          variant="preview"
                          onClick={() => setActiveIndex(nextIndex)}
                          ariaLabel={`Zum nächsten Slide: ${nextSlide.title}`}
                        />
                      </m.div>
                    </LazyMotion>
                  ) : null}
                </div>
              </div>

              <div className="col-span-12 sm:hidden">
                <div className="mt-8 flex items-center gap-4">
                  <HeroSlideCard
                    image={activeSlide.thumbMain}
                    variant="active"
                    ariaLabel={`Slide: ${activeSlide.title}`}
                  />
                  {nextSlide ? (
                    <HeroSlideCard
                      image={nextSlide.background}
                      variant="preview"
                      onClick={() => setActiveIndex(nextIndex)}
                      ariaLabel={`Zum nächsten Slide: ${nextSlide.title}`}
                    />
                  ) : null}
                </div>
              </div>
            </div>

            <HeroSliderDots
              count={count}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
              labels={safeSlides.map((slide) => slide.title)}
            />
          </div>
          </div>
        </div>
      </ContentShell>
    </section>
  )
}
