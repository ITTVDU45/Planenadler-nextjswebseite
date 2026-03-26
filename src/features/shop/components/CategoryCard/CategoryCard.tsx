import Image from 'next/image'
import Link from 'next/link'
import type { ShopCategory } from '../../types'

interface CategoryCardProps {
  category: ShopCategory
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={category.href}
      className="group flex flex-col overflow-hidden rounded-[2rem] bg-[#F7FAFF] shadow-[0_4px_16px_rgba(31,92,171,0.06)] transition hover:shadow-[0_8px_28px_rgba(31,92,171,0.12)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#DBE9F9]">
        <Image
          src={category.image.src}
          alt={category.image.alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-[#1F5CAB]">{category.name}</h3>
        <p className="mt-1 flex-1 text-sm leading-relaxed text-[#1F5CAB]/70">
          {category.description}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#3982DC] transition group-hover:text-[#1F5CAB]">
          Mehr erfahren
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  )
}
