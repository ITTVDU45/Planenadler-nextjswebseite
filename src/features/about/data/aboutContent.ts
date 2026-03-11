import type { HeroContent, AboutStoryContent, MissionContent } from '../types'

export const HERO_CONTENT: HeroContent = {
  headline: 'Planenadler – Maßgeschneiderte PVC-Planen in höchster Qualität',
  subline:
    'Individuelle Lösungen für Anhänger, Terrassen, Pools, Boote und mehr.',
  ctaPrimary: { label: 'Plane konfigurieren', href: '/shop' },
  ctaSecondary: { label: 'Zu unseren Produkten', href: '/shop' },
  trustBadges: [
    { id: 'made-in-de', label: 'Made in Germany' },
    { id: 'massanfertigung', label: 'Maßanfertigung' },
    { id: 'lieferung', label: 'Schnelle Lieferung' },
    { id: 'erfahrung', label: 'Langjährige Erfahrung' },
  ],
}

export const ABOUT_STORY_CONTENT: AboutStoryContent = {
  title: 'Über uns',
  paragraphs: [
    'Planenadler steht seit Jahren für maßgeschneiderte Planen und Abdeckungen in höchster Qualität. Unser Team verbindet langjährige Erfahrung mit fundiertem Expertenwissen in Konfektion und Materialkunde.',
    'Wir setzen auf hochwertige Materialien und eine kundenorientierte Beratung – von der ersten Skizze bis zur fertigen Lieferung. Qualitätssicherung und präzise Fertigung nach Ihren Vorgaben sind für uns selbstverständlich.',
  ],
  storyTitle: 'Warum wir Planenadler gegründet haben',
  storyParagraph:
    'Wir wollten einen Anbieter schaffen, der individuelle Planenlösungen ohne Kompromisse anbietet – mit transparenter Beratung, fairer Preisgestaltung und zuverlässiger Lieferung.',
  highlights: [
    { label: 'Standort', value: 'Deutschland' },
    { label: 'Produktion', value: 'Eigene Fertigung' },
    { label: 'Qualitätssicherung', value: 'Prüfung vor Versand' },
    { label: 'Garantie', value: 'Nach Absprache' },
  ],
}

export const MISSION_CONTENT: MissionContent = {
  title: 'Unsere Mission',
  text: 'Wir glauben an Individualisierung statt Standard: Jede Plane wird exakt nach Ihren Maßen und Wünschen gefertigt. Unser Qualitätsversprechen, Innovationsbereitschaft und konsequenter Kundenfokus machen uns zum Partner für Anhänger, Terrassen, Pools und mehr.',
  points: [
    'Qualitätsversprechen: Hochwertige Materialien und saubere Verarbeitung.',
    'Innovation: Moderne Konfektion und passgenaue Lösungen.',
    'Kundenfokus: Persönliche Beratung und zuverlässige Lieferung.',
  ],
}
