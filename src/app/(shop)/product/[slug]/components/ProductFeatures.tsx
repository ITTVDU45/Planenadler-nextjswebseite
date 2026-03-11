import { Card, CardContent } from '@/components/ui/card'
import type { ProductFeature } from './types'

interface ProductFeaturesProps {
  items: ProductFeature[]
}

function FeatureIcon() {
  return (
    <span
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#CFE1F7] bg-gradient-to-br from-[#F7FBFF] to-[#EAF3FF] text-[#1F5CAB] shadow-[0_6px_18px_rgba(31,92,171,0.12)]"
      aria-hidden
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M5 12.5l4 4L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export default function ProductFeatures({ items }: ProductFeaturesProps) {
  return (
    <section className="py-12 md:py-16" aria-labelledby="product-features-title">
      <div className="mx-auto max-w-7xl px-4">
        <h2 id="product-features-title" className="text-2xl font-bold text-[#0F2B52]">
          Vorteile und Eigenschaften
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          {items.map((item) => (
            <Card
              key={item.title}
              className="h-full rounded-2xl border border-[#D8E6F8] bg-gradient-to-b from-white to-[#F9FCFF] shadow-[0_12px_28px_rgba(15,43,82,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(15,43,82,0.12)]"
            >
              <CardContent className="flex h-full items-start gap-3 px-5 pb-5 pt-6">
                <FeatureIcon />
                <div>
                  <p className="text-[15px] font-semibold leading-6 text-[#0F2B52]">{item.title}</p>
                  <p className="mt-1.5 text-sm leading-6 text-[#1F5CAB]/75">{item.detail}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
