interface HeroHeaderProps {
  navLabels: string[]
  activeIndex: number
  onSelect: (index: number) => void
}

export function HeroHeader({ navLabels, activeIndex, onSelect }: HeroHeaderProps) {
  return (
    <nav aria-label="Hero Navigation" className="flex flex-wrap items-center gap-2 sm:gap-4">
      {navLabels.map((label, index) => {
        const isActive = index === activeIndex
        return (
          <button
            key={`hero-nav-${index}`}
            type="button"
            onClick={() => onSelect(index)}
            aria-current={isActive ? 'true' : undefined}
            className={[
              'rounded-full px-4 py-1.5 text-xs font-semibold transition sm:text-sm',
              isActive
                ? 'bg-white text-[#1F5CAB]'
                : 'bg-white/20 text-white hover:bg-white/30',
            ].join(' ')}
          >
            {label}
          </button>
        )
      })}
    </nav>
  )
}
