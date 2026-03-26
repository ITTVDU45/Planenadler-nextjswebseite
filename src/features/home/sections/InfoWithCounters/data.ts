import type { InfoWithCountersContent } from './types'

export const INFO_WITH_COUNTERS: InfoWithCountersContent = {
  title: 'Zahlen, die für sich sprechen',
  description:
    'Seit Jahren fertigen wir individuelle Planen für Kunden aus ganz Deutschland. Präzision, Qualität und Kundennähe sind unser Antrieb.',
  counters: [
    { id: 'customers', value: '500+', label: 'Zufriedene Kunden' },
    { id: 'products', value: '1.000+', label: 'Gefertigte Planen' },
    { id: 'experience', value: '10+', label: 'Jahre Erfahrung' },
    { id: 'rating', value: '4,8', label: 'Ø Kundenbewertung' },
  ],
}
