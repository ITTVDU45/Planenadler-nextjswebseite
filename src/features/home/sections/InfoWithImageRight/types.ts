export interface InfoImage {
  src: string
  alt: string
}

export interface ActionButton {
  label: string
  href: string
  variant: 'primary' | 'secondary'
}

export interface Avatar {
  id: string
  src: string
  alt: string
}

export interface InfoWithImageRightContent {
  title: string
  description: string
  images: InfoImage[]
  buttons: ActionButton[]
  avatars?: Avatar[]
}
