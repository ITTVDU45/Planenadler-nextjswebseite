import type { HeroSlide } from './types'
import { PLACEHOLDER_IMAGE_DATA_URL } from '@/shared/lib/functions'

const placeholderBackground = {
  src: PLACEHOLDER_IMAGE_DATA_URL,
  alt: 'Hero Hintergrund',
}

const placeholderThumb = {
  src: PLACEHOLDER_IMAGE_DATA_URL,
  alt: 'Hero Vorschau',
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'cabins',
    navLabel: 'Terrassenplane Konfigurieren',
    title: 'Terrassenplane Konfigurieren',
    description:
      'Schaffen Sie einen geschützten Rückzugsort im Freien mit unseren Terrassenplanen. Entdecken Sie eine Vielzahl von Optionen, um Ihre Terrasse stilvoll zu gestalten und vor den Elementen zu schützen. Jetzt entdecken und Ihren Außenbereich aufwerten!',
    cta: {
      label: 'Jetzt Konfigurieren',
      href: '/product/terrassenplanen',
      bgColor: 'bg-[#205297] hover:bg-[#205297]',
    },
    background: {
      src: '/images/Terrassenplane4.png',
      alt: 'Terrassenplane',
    },
    thumbMain: {
      src: '/images/Terrassenplane4.png',
      alt: 'Terrassenplane',
    },
    
  },
  {
    id: 'gated',
    navLabel: 'Anhängerplane Konfigurieren',
    title: 'Anhängerplane Konfigurieren',
    description:
      'Lorem ipsum dolor sit amet consectetur. Pellentesque ut etiam faucibus felis consectetur urna volutpat. Diam tortor sed nibh diam consequat nunc nibh et diam.',
    cta: {
      label: 'Jetzt Konfigurieren',
      href: '/product/hochplane',
      bgColor: 'bg-[#205297] hover:bg-[#205297]',
    },
    background: {
      src: '/images/Anhängerplanehero.png',
      alt: 'Anhängerplane',
    },
    thumbMain: {
      src: '/images/Anhängerplanehero.png',
      alt: 'Terrassenplane',
    },
  },
]
