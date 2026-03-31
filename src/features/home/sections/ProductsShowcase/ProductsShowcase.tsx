import type { ProductCardItem } from './types'
import { ProductCard } from './components/ProductCard'
import { ContentShell } from '@/shared/components/ContentShell.component'

interface ProductsShowcaseProps {
  products: ProductCardItem[]
}

export function ProductsShowcase({ products }: ProductsShowcaseProps) {
  return (
    <section className="w-full bg-[#F7FAFF] py-16 lg:py-24">
      <ContentShell>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1F5CAB] sm:text-3xl lg:text-4xl">
            Unsere Produkte
          </h2>
          <p className="mt-2 text-sm text-[#1F5CAB]/70 sm:text-base">
            Alle Produkte auf einen Blick, direkt nach Relevanz sortiert.
          </p>
        </div>

        <div className="mt-10">
          {products.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#1F5CAB]/60">
              Aktuell sind keine Produkte verfuegbar.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </ContentShell>
    </section>
  )
}
