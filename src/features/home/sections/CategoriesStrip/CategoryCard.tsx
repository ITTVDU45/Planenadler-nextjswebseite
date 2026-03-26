import Image from 'next/image'
import Link from 'next/link'
import type { Category } from './types'

interface CategoryCardProps {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={category.href}
      className="group flex flex-col items-center overflow-hidden rounded-[1.5rem] p-4 text-center transition hover:shadow-md sm:p-5"
      style={{ backgroundColor: category.bgColor }}
    >
      <div className="relative h-20 w-20 overflow-hidden rounded-2xl sm:h-24 sm:w-24">
        <Image
          src={category.image.src}
          alt={category.image.alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="96px"
        />
      </div>
      <h3 className="mt-3 text-xs font-bold text-[#1F5CAB] sm:text-sm">
        {category.name}
      </h3>
      {category.itemsCount != null && (
        <span className="mt-1 text-[10px] text-[#3982DC]/70">
          {category.itemsCount} Produkte
        </span>
      )}
    </Link>
  )
}
