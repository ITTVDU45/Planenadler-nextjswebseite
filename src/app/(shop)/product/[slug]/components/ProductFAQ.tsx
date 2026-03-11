import Link from 'next/link'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import type { BlogTeaser, FaqItem } from './types'

interface ProductFAQProps {
  blogTeasers: BlogTeaser[]
  faqItems: FaqItem[]
}

export default function ProductFAQ({ blogTeasers, faqItems }: ProductFAQProps) {
  return (
    <section className="py-12 md:py-16" aria-labelledby="faq-title">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-[#0F2B52]">Ratgeber und Inspiration</h2>
          <div className="mt-6 space-y-4">
            {blogTeasers.map((teaser) => (
              <Card key={teaser.id} className="rounded-2xl">
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3982DC]">{teaser.publishedAt}</p>
                  <h3 className="mt-2 text-lg font-bold text-[#0F2B52]">{teaser.title}</h3>
                  <p className="mt-2 text-sm text-[#1F5CAB]/80">{teaser.excerpt}</p>
                  <Link href={teaser.href} className="mt-3 inline-block text-sm font-semibold text-[#1F5CAB] hover:underline">
                    Mehr lesen
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 id="faq-title" className="text-2xl font-bold text-[#0F2B52]">
            Haeufige Fragen (FAQ)
          </h2>

          <Accordion defaultValue={faqItems[0]?.id} className="mt-6 space-y-3">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
