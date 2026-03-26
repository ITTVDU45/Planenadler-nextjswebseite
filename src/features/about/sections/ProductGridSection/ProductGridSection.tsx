import Image from 'next/image'
import Link from 'next/link'
import type { ProductGroupCard } from '../../types'
import { ContentShell } from '@/shared/components/ContentShell.component'

interface ProductGridSectionProps {
  products: ProductGroupCard[]
}

export function ProductGridSection({ products }: ProductGridSectionProps) {
  if (!products.length) return null

  return (
    <section className="w-full bg-[#F4F8FD] py-16 lg:py-24">
      <ContentShell>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#3982DC]">
            Produktkatalog
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#1F5CAB] sm:text-3xl lg:text-4xl">
            Unsere Planen-Produkte
          </h2>
          <p className="mt-3 text-sm text-[#1F5CAB]/70 sm:text-base">
            Alle Produkte werden individuell nach Ihren Maßen und Wünschen gefertigt.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_4px_20px_rgba(31,92,171,0.07)] transition hover:shadow-[0_8px_32px_rgba(31,92,171,0.13)]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#DBE9F9]">
                <Image
                  src={product.image.src}
                  alt={product.image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h3 className="text-base font-bold text-[#1F5CAB] sm:text-lg">
                  {product.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#1F5CAB]/70">
                  {product.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={product.hrefMore}
                    className="inline-flex items-center justify-center rounded-full border border-[#DBE9F9] px-4 py-2 text-xs font-semibold text-[#1F5CAB] transition hover:bg-[#DBE9F9]"
                  >
                    Mehr erfahren
                  </Link>
                  <Link
                    href={product.hrefConfig}
                    className="inline-flex items-center justify-center rounded-full bg-[#1F5CAB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0F2B52]"
                  >
                    Konfigurieren
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </ContentShell>
    </section>
  )
}
