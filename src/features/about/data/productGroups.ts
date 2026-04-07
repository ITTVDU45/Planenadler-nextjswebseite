import type { ProductGroupCard } from '../types'

export const PRODUCT_GROUPS: ProductGroupCard[] = [
  {
    id: 'terrassenplanen',
    name: 'Terrassenplanen',
    description: 'Schutz und Komfort für Ihre Terrasse – transparent oder blickdicht, nach Maß.',
    image: { src: '/images/Terrassenplane_adlerplanen.png', alt: 'Terrassenplanen' },
    hrefMore: '/shop?category=terrassenplanen',
    hrefConfig: '/konfigurator',
  },
  {
    id: 'anhaengerplanen',
    name: 'Anhängerplanen',
    description: 'Robuste Planen für Anhänger und Transport – maßgefertigt und langlebig.',
    image: { src: '/images/AnhängerplaneAdlerplanen.png', alt: 'Anhängerplanen' },
    hrefMore: '/shop?category=anhaengerplanen',
    hrefConfig: '/konfigurator',
  },
  {
    id: 'abdeckhauben',
    name: 'Abdeckhauben',
    description: 'Schutz für Maschinen, Fahrzeuge und Lager – passgenau und witterungsbeständig.',
    image: { src: '/images/Abdeckhaube_adlerPlanen.png', alt: 'Abdeckhauben' },
    hrefMore: '/shop?category=abdeckhauben',
    hrefConfig: '/konfigurator',
  },
  {
    id: 'abdeckplanen',
    name: 'Abdeckplanen',
    description: 'Vielseitige Abdeckungen für Industrie, Garten und Transport.',
    image: { src: '/images/Abdeckplane Adler Planen.png', alt: 'Abdeckplanen' },
    hrefMore: '/shop?category=abdeckplanen',
    hrefConfig: '/konfigurator',
  },
  {
    id: 'poolplanen',
    name: 'Poolplanen',
    description: 'Poolabdeckungen nach Maß – für Sauberkeit und Wärmeschutz.',
    image: { src: '/images/Poolplane Adlerplanen.png', alt: 'Poolplanen' },
    hrefMore: '/shop?category=poolplanen',
    hrefConfig: '/konfigurator',
  },
  {
    id: 'gitterboxplanen',
    name: 'Gitterboxplanen',
    description: 'Planen für Gitterboxplanen und Paletten – sicher und maßgenau.',
    image: { src: '/images/Gitterboxplanenadler.png', alt: 'Gitterboxplanen' },
    hrefMore: '/shop?category=gitterboxen',
    hrefConfig: '/konfigurator',
  },
]
