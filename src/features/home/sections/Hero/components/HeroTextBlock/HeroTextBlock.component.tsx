interface HeroTextBlockProps {
  title: string
  subtitle?: string
  description: string
}

export function HeroTextBlock({ title, subtitle, description }: HeroTextBlockProps) {
  return (
    <div className="flex flex-col gap-3">
      {subtitle && (
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
          {subtitle}
        </p>
      )}
      <h1 className="text-3xl font-black leading-tight tracking-tight text-white drop-shadow sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
        {description}
      </p>
    </div>
  )
}
