interface HeroSliderDotsProps {
  count: number
  activeIndex: number
  onSelect: (index: number) => void
  labels?: string[]
}

export function HeroSliderDots({ count, activeIndex, onSelect, labels = [] }: HeroSliderDotsProps) {
  if (count < 2) return null

  return (
    <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Slider Navigation">
      {Array.from({ length: count }).map((_, index) => {
        const isActive = index === activeIndex
        const label = labels[index] ?? `Slide ${index + 1}`
        return (
          <button
            key={`hero-dot-${index}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={label}
            onClick={() => onSelect(index)}
            className={[
              'h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/60',
              isActive ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70',
            ].join(' ')}
          />
        )
      })}
    </div>
  )
}
