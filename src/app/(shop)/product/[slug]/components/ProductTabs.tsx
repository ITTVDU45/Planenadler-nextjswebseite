'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ProductTab } from './types'

interface ProductTabsProps {
  tabs: ProductTab[]
}

export default function ProductTabs({ tabs }: ProductTabsProps) {
  const firstTab = tabs[0]?.value ?? 'beschreibung'
  const richTextClassName =
    'prose prose-sm max-w-none text-[#1F5CAB]/90 prose-p:text-[#1F5CAB]/90 prose-p:leading-7 prose-strong:text-[#0F2B52] prose-strong:font-semibold prose-ul:my-4 prose-ul:list-disc prose-ul:pl-5 prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-5 prose-li:my-1 prose-headings:text-[#0F2B52] prose-headings:font-bold prose-h1:text-4xl prose-h1:leading-tight prose-h2:text-3xl prose-h2:leading-tight prose-h3:text-2xl prose-h3:leading-snug prose-h4:text-xl prose-h4:leading-snug prose-h5:text-lg prose-h5:leading-snug prose-h6:text-base prose-h6:leading-snug'

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
                  {tab.content.html ? (
                    <div
                      className={richTextClassName}
                      dangerouslySetInnerHTML={{ __html: tab.content.html }}
                    />
                  ) : (
                    <p className="whitespace-pre-line text-sm leading-7 text-[#1F5CAB]/90">
                      {tab.content.intro}
                    </p>
                  )}

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
