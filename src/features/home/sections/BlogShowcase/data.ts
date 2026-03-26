import type { Article, ArticleCategory } from './types'

export const BLOG_CATEGORIES: ArticleCategory[] = [
  { slug: 'all', label: 'Alle' },
  { slug: 'ratgeber', label: 'Ratgeber' },
  { slug: 'news', label: 'News' },
  { slug: 'tipps', label: 'Tipps & Tricks' },
  { slug: 'erfolgsgeschichten', label: 'Erfolgsgeschichten' },
]

export const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Wie KI-Telefonie den Kundenservice revolutioniert',
    excerpt:
      'Erfahren Sie, wie moderne KI-Sprachmodelle den Kundenservice transformieren und Unternehmen dabei helfen, rund um die Uhr erreichbar zu sein.',
    category: 'ratgeber',
    date: '12. März 2026',
    readTime: '5 Min. Lesezeit',
    slug: 'ki-telefonie-kundenservice',
    image: {
      src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
      alt: 'KI Kundenservice Illustration',
    },
    author: {
      name: 'Anna Müller',
      avatar: {
        src: 'https://i.pravatar.cc/150?img=47',
        alt: 'Anna Müller',
      },
    },
  },
  {
    id: '2',
    title: '5 Gründe, warum automatisierte Rückrufe die Zukunft sind',
    excerpt:
      'Automatisierte Rückrufsysteme sparen Zeit und Kosten. Wir zeigen Ihnen die wichtigsten Vorteile für Ihr Unternehmen.',
    category: 'tipps',
    date: '8. März 2026',
    readTime: '4 Min. Lesezeit',
    slug: 'automatisierte-rueckrufe-zukunft',
    image: {
      src: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=800&q=80',
      alt: 'Automatisierter Rückruf',
    },
    author: {
      name: 'Lars Becker',
      avatar: {
        src: 'https://i.pravatar.cc/150?img=12',
        alt: 'Lars Becker',
      },
    },
  },
  {
    id: '3',
    title: 'Erfolgsgeschichte: Wie FirmaX die Antwortzeit um 80 % senkte',
    excerpt:
      'Ein mittelständisches Unternehmen konnte durch den Einsatz von KI-Telefonie seine Reaktionszeiten drastisch reduzieren.',
    category: 'erfolgsgeschichten',
    date: '1. März 2026',
    readTime: '6 Min. Lesezeit',
    slug: 'erfolgsgeschichte-firmax',
    image: {
      src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
      alt: 'Erfolgsgeschichte Unternehmen',
    },
    author: {
      name: 'Sophie Wagner',
      avatar: {
        src: 'https://i.pravatar.cc/150?img=23',
        alt: 'Sophie Wagner',
      },
    },
  },
  {
    id: '4',
    title: 'DSGVO-konformer Einsatz von KI-Telefonie – was Sie wissen müssen',
    excerpt:
      'Datenschutz und KI-Telefonie schließen sich nicht aus. Wir erklären, wie Sie die DSGVO-Anforderungen erfüllen.',
    category: 'ratgeber',
    date: '22. Februar 2026',
    readTime: '7 Min. Lesezeit',
    slug: 'dsgvo-ki-telefonie',
    image: {
      src: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&q=80',
      alt: 'DSGVO Datenschutz',
    },
    author: {
      name: 'Thomas Klein',
      avatar: {
        src: 'https://i.pravatar.cc/150?img=33',
        alt: 'Thomas Klein',
      },
    },
  },
  {
    id: '5',
    title: 'Update: Neue Sprachmodelle für natürlichere Kundengespräche',
    excerpt:
      'Mit dem neuesten Release verbessern wir die Gesprächsqualität unserer KI-Agenten erheblich.',
    category: 'news',
    date: '15. Februar 2026',
    readTime: '3 Min. Lesezeit',
    slug: 'neue-sprachmodelle-update',
    image: {
      src: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
      alt: 'KI Sprachmodelle',
    },
    author: {
      name: 'Anna Müller',
      avatar: {
        src: 'https://i.pravatar.cc/150?img=47',
        alt: 'Anna Müller',
      },
    },
  },
  {
    id: '6',
    title: 'Integration in bestehende CRM-Systeme – Schritt für Schritt',
    excerpt:
      'Wie Sie unsere KI-Telefonie-Lösung problemlos in Salesforce, HubSpot oder Ihre eigene CRM-Software einbinden.',
    category: 'tipps',
    date: '5. Februar 2026',
    readTime: '8 Min. Lesezeit',
    slug: 'crm-integration-anleitung',
    image: {
      src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      alt: 'CRM Integration',
    },
    author: {
      name: 'Lars Becker',
      avatar: {
        src: 'https://i.pravatar.cc/150?img=12',
        alt: 'Lars Becker',
      },
    },
  },
]
