import Image from 'next/image'
import { AnimatePresence, LazyMotion, domAnimation, m } from 'motion/react'
import type { HeroImage } from '../../types'

interface HeroBackgroundProps {
  image: HeroImage
  slideId: string
}

export function HeroBackground({ image, slideId }: HeroBackgroundProps) {
  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait">
        <m.div
          key={slideId}
          initial={{ opacity: 0.2, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  )
}
