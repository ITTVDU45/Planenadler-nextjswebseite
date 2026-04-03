import Image from 'next/image'
import type { HeroImage } from '../../types'

interface HeroSlideCardProps {
  image: HeroImage
  variant: 'active' | 'preview'
  onClick?: () => void
  ariaLabel?: string
}

export function HeroSlideCard({ image, variant, onClick, ariaLabel }: HeroSlideCardProps) {
  const sizeClass =
    variant === 'active'
      ? 'h-32 w-28 sm:h-44 sm:w-36 lg:h-52 lg:w-40'
      : 'h-32 w-[5.5rem] sm:h-36 sm:w-28 lg:h-44 lg:w-32 cursor-pointer opacity-70 hover:opacity-100'

  const content = (
    <div
      className={[
        'relative shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300',
        variant === 'active'
          ? 'border-white/80 shadow-xl'
          : 'border-white/30 hover:border-white/70 shadow-md',
        sizeClass,
      ].join(' ')}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        className="object-cover"
        sizes="160px"
      />
    </div>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className="shrink-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/60"
      >
        {content}
      </button>
    )
  }

  return <div aria-label={ariaLabel}>{content}</div>
}
