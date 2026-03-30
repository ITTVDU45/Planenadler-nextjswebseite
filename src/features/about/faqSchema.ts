import type { FaqItem, FaqSection } from './types'

function flattenFaqItems(items: FaqItem[] | FaqSection[]): FaqItem[] {
  if (items.length === 0) return []

  const firstItem = items[0] as FaqItem | FaqSection
  if ('question' in firstItem) {
    return items as FaqItem[]
  }

  return (items as FaqSection[]).flatMap((section) => section.items)
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function buildFaqSchema(items: FaqItem[] | FaqSection[]) {
  const flatItems = flattenFaqItems(items)

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: flatItems.map((item) => ({
      '@type': 'Question' as const,
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: stripHtml(item.answer),
      },
    })),
  }
}
