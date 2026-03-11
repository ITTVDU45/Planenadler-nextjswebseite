export type ContactInfoType = 'tel' | 'email' | 'address'

export interface ContactInfoItem {
  id: string
  type: ContactInfoType
  title: string
  value: string
  href?: string
  primaryAction?: { label: string; href: string }
  secondaryAction?: { label: string; href: string }
  bgColor: string
  textColor: string
  subTextColor: string
}

export interface ContactFormValues {
  firstName: string
  lastName: string
  email: string
  phone: string
  subject: string
  message: string
  privacy: boolean
  website: string
}

export interface ContactHeroContent {
  subline: string
  image?: { src: string; alt: string }
}
