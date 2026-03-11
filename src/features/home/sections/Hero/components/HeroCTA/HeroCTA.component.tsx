import Link from 'next/link'

interface HeroCTAProps {
  label: string
  href: string
  bgColor?: string
}

export function HeroCTA({ label, href, bgColor }: HeroCTAProps) {
  const classes = [
    'inline-flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold text-white sm:w-auto',
    'transition-all focus:outline-none focus:ring-2 focus:ring-white/60 shadow-lg',
    bgColor ?? 'bg-white/20 hover:bg-white/30 backdrop-blur-md',
  ].join(' ')

  return (
    <Link href={href} className={classes}>
      {label}
    </Link>
  )
}
