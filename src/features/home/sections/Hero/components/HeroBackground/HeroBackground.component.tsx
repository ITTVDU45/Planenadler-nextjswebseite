import Image from 'next/image'
import type { HeroImage } from '../../types'

interface HeroBackgroundProps {
  image: HeroImage
  slideId: string
}

export function HeroBackground({ image, slideId }: HeroBackgroundProps) {
  return (
    <div key={slideId} className="absolute inset-0">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
    </div>
  )
}
