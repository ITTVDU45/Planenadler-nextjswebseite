import type { ConfiguratorContent } from '../types'

export const CONFIGURATOR_CONTENT: ConfiguratorContent = {
  title: 'Ihre Plane in 3 Schritten',
  steps: [
    {
      step: 1,
      title: 'Maße eingeben',
      description: 'Tragen Sie Länge, Höhe und gewünschte Form ein – wir fertigen exakt nach Maß.',
    },
    {
      step: 2,
      title: 'Material & Farbe wählen',
      description: 'Wählen Sie Farbe, Fenster, Türen und Befestigung nach Ihrem Bedarf.',
    },
    {
      step: 3,
      title: 'Bestellung abschließen',
      description: 'Bestellen Sie mit wenigen Klicks – inklusive Beratung und Versand.',
    },
  ],
  ctaLabel: 'Jetzt Plane konfigurieren',
  ctaHref: '/shop',
  image: {
    src: '/images/Planenadler1.jpg',
    alt: 'Konfigurator – Plane konfigurieren',
  },
}
