import type { InfoWithImageRightContent } from './types'

export const INFO_WITH_IMAGE_RIGHT: InfoWithImageRightContent = {
  title: 'Individuelle Planen nach Maß – für jeden Einsatzbereich',
  description:
    'Ob Terrasse, Anhänger, Pool oder Lager: Wir fertigen Ihre Plane exakt nach Ihren Maßen und Anforderungen. Hochwertige Materialien, präzise Verarbeitung und persönliche Beratung – alles aus einer Hand.',
  images: [
    {
      src: '/images/Terrassenplane4.png',
      alt: 'Terrassenplane in Anwendung',
    },
    {
      src: '/images/AnhängerplaneAdlerplanen.png',
      alt: 'Anhängerplane – maßgefertigt',
    },
  ],
  buttons: [
    {
      label: 'Jetzt konfigurieren',
      href: '/konfigurator',
      variant: 'primary',
    },
    {
      label: 'Alle Produkte',
      href: '/shop',
      variant: 'secondary',
    },
  ],
}
