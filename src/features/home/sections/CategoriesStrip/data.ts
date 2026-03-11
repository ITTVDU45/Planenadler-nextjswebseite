import type { Category } from './types'
import { PLACEHOLDER_IMAGE_DATA_URL } from '@/shared/lib/functions'

const placeholderImage = {
  src: PLACEHOLDER_IMAGE_DATA_URL,
  alt: 'Kategorie Bild',
}

export const POPULAR_CATEGORIES: Category[] = [
  {
    id: 'terrassenplanen',
    name: 'Terrassenplanen',
    href: '/product/terrassenplanen',
    image: { src: '/images/Terrassenplane_adlerplanen.png', alt: 'Terrassenplanen' },
    itemsCount: 0,
    bgColor: '#DBE9F9',
  },
  {
    id: 'abdeckplanen',
    name: 'Abdeckplanen',
    href: '/product/abdeckplane',
    image: { src: '/images/Abdeckplane Adler Planen.png', alt: 'Abdeckplanen' },
    itemsCount: 0,
    bgColor: '#B9D4F3',
  },
  {
    id: 'abdeckhauben',
    name: 'Abdeckhauben',
    href: '/product/abdeckhaube',
    image: { src: '/images/Abdeckhaube_adlerPlanen.png', alt: 'Abdeckhauben' },
    itemsCount: 0,
    bgColor: '#75AAE7',
  },
  {
    id: 'anhaengerplanen',
    name: 'Anhängerplanen',
    href: '/product/hochplane',
    image: { src: '/images/AnhängerplaneAdlerplanen.png', alt: 'Anhängerplanen' },
    itemsCount: 0,
    bgColor: '#DBE9F9',
  },
  {
    id: 'poolplanen',
    name: 'Poolplanen',
    href: '/product/poolplane',
    image: { src: '/images/Poolplane Adlerplanen.png', alt: 'Poolplanen' },
    itemsCount: 0,
    bgColor: '#B9D4F3',
  },
  {
    id: 'gitterboxen',
    name: 'Gitterboxen',
    href: '/product/gitterboxen',
    image: { src: '/images/Gitterboxplanenadler.png', alt: 'Gitterboxen' },
    itemsCount: 0,
    bgColor: '#75AAE7',
  },
]
