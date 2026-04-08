import type { ContactHeroContent, ContactInfoItem } from '../types'

export const CONTACT_HERO_CONTENT: ContactHeroContent = {
  subline: 'Fragen, Anfrage oder Beratung - wir helfen gern.',
  image: { src: '/images/Planenadler1.jpg', alt: 'Planenadler Kontakt' },
}

const TEL_HREF = 'tel:+492037385985'
const MAIL_HREF = 'mailto:post@planenadler.de'
const MAPS_HREF =
  'https://www.google.com/maps/search/?api=1&query=D%C3%BCsseldorfer+Str.+387,+47055+Duisburg'

export const CONTACT_INFO_ITEMS: ContactInfoItem[] = [
  {
    id: 'phone',
    type: 'tel',
    title: 'Telefonnummer Buero oder Mobil',
    value: '0203 73 85 985 - 0172 7436428',
    href: TEL_HREF,
    primaryAction: { label: 'Jetzt anrufen', href: TEL_HREF },
    secondaryAction: { label: 'Kontaktseite', href: '/kontakt' },
    bgColor: '#1F5CAB',
    textColor: 'text-white',
    subTextColor: 'text-white/80',
  },
  {
    id: 'email',
    type: 'email',
    title: 'E-Mail Adresse',
    value: 'post@planenadler.de',
    href: MAIL_HREF,
    primaryAction: { label: 'E-Mail senden', href: MAIL_HREF },
    secondaryAction: { label: 'Kontaktseite', href: '/kontakt' },
    bgColor: '#FFFFFF',
    textColor: 'text-[#1F5CAB]',
    subTextColor: 'text-[#3982DC]/80',
  },
  {
    id: 'address',
    type: 'address',
    title: 'Adresse & Öffnungszeiten',
    value: 'Duesseldorfer Str. 387, 47055 Duisburg - Mo-Fr 07:00-17:00',
    href: MAPS_HREF,
    primaryAction: { label: 'Route planen', href: MAPS_HREF },
    secondaryAction: { label: 'Kontaktseite', href: '/kontakt' },
    bgColor: '#3982DC',
    textColor: 'text-white',
    subTextColor: 'text-white/80',
  },
]
