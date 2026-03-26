import type { InfoWithImageLeftContent } from './types'

export const INFO_WITH_IMAGE_LEFT: InfoWithImageLeftContent = {
  title: 'Qualität, die man sieht und spürt',
  description:
    'Unsere Planen werden aus hochwertigem PVC-Material gefertigt und professionell verschweißt. Das Ergebnis: langlebiger Schutz, der Wind, Regen und UV-Strahlung standhält.',
  points: [
    'Reißfestes PVC-Material – 650 g/m² Standard',
    'Professionell verschweißte Nähte',
    'UV- und witterungsbeständig',
    'Individuelle Farben und Befestigungen wählbar',
  ],
  image: {
    src: '/images/Terrassenplane_adlerplanen.png',
    alt: 'Hochwertige PVC-Plane – Detailansicht',
  },
  ctaLabel: 'Mehr über unsere Materialien',
  ctaHref: '/ueber-uns',
}
