'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ProductTab } from './types'

interface ProductTabsProps {
  tabs: ProductTab[]
}

export default function ProductTabs({ tabs }: ProductTabsProps) {
  const firstTab = tabs[0]?.value ?? 'beschreibung'

  return (
    <section className="py-12 md:py-16" aria-labelledby="product-tabs-title">
      <div className="mx-auto max-w-7xl px-4">
        <h2 id="product-tabs-title" className="text-2xl font-bold text-[#0F2B52]">
          Produktinformationen
        </h2>

        <Tabs defaultValue={firstTab} className="mt-6">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm leading-7 text-[#1F5CAB]/90">{tab.content.intro}</p>

                  {tab.content.bullets?.length ? (
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#1F5CAB]/85">
                      {tab.content.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}

                  {tab.content.specs?.length ? (
                    <dl className="mt-6 divide-y divide-[#EEF3FB] rounded-xl border border-[#E7EEF8]">
                      {tab.content.specs.map((spec) => (
                        <div key={spec.label} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm">
                          <dt className="font-semibold text-[#0F2B52]">{spec.label}</dt>
                          <dd className="text-[#1F5CAB]/80">{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
