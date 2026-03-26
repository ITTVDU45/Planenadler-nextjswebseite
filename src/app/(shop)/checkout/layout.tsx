import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { NOINDEX_ROBOTS } from '@/lib/seo'

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
}

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children
}
