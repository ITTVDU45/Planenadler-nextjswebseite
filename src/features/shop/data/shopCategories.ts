import type { ShopCategory } from '../types'

export const SHOP_CATEGORIES: ShopCategory[] = [
  {
    id: 'terrassenplanen',
    slug: 'terrassenplanen',
    name: 'Terrassenplanen',
    description:
      'Schutz und Komfort für Ihre Terrasse – transparent oder blickdicht, nach Maß.',
    image: { src: '/images/Terrassenplane_adlerplanen.png', alt: 'Terrassenplanen' },
    href: '/product/terrassenplanen',
    hrefConfig: '/product/terrassenplanen#konfigurator',
  },
  {
    id: 'anhaengerplanen',
    slug: 'anhaengerplanen',
    name: 'Anhängerplanen',
    description:
      'Robuste Planen für Anhänger und Transport – maßgefertigt und langlebig.',
    image: { src: '/images/AnhängerplaneAdlerplanen.png', alt: 'Anhängerplanen' },
    href: '/product/hochplane',
    hrefConfig: '/product/hochplane#konfigurator',
  },
  {
    id: 'abdeckhauben',
    slug: 'abdeckhauben',
    name: 'Abdeckhauben',
    description:
      'Schutz für Maschinen, Fahrzeuge und Lager – passgenau und witterungsbeständig.',
    image: { src: '/images/Abdeckhaube_adlerPlanen.png', alt: 'Abdeckhauben' },
    href: '/product/abdeckhaube',
    hrefConfig: '/product/abdeckhaube#konfigurator',
  },
  {
    id: 'abdeckplanen',
    slug: 'abdeckplanen',
    name: 'Abdeckplanen',
    description: 'Vielseitige Abdeckungen für Industrie, Garten und Transport.',
    image: { src: '/images/Abdeckplane Adler Planen.png', alt: 'Abdeckplanen' },
    href: '/product/abdeckplane',
    hrefConfig: '/product/abdeckplane#konfigurator',
  },
  {
    id: 'poolplanen',
    slug: 'poolplanen',
    name: 'Poolplanen',
    description: 'Poolabdeckungen nach Maß – für Sauberkeit und Wärmeschutz.',
    image: { src: '/images/Poolplane Adlerplanen.png', alt: 'Poolplanen' },
    href: '/product/poolplane',
    hrefConfig: '/product/poolplane#konfigurator',
  },
  {
    id: 'gitterboxen',
    slug: 'gitterboxen',
    name: 'Gitterboxplanen',
    description: 'Planen für Gitterboxen und Paletten – sicher und maßgenau.',
    image: { src: '/images/Gitterboxplanenadler.png', alt: 'Gitterboxplanen' },
    href: '/product/gitterboxen',
    hrefConfig: '/product/gitterboxen#konfigurator',
  },
]
