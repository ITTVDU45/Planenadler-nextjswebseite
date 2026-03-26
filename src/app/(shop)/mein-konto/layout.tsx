import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { ContentShell } from '@/shared/components/ContentShell.component'
import { checkCustomerSession } from '@/features/auth/api/fetchCustomerAccount'
import { MeinKontoNav } from '@/features/auth/components/MeinKontoNav'
import { NOINDEX_ROBOTS } from '@/lib/seo'

const REDIRECT_LOGIN = '/anmelden'

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
}

export default async function MeinKontoLayout({
  children,
}: {
  children: ReactNode
}) {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL
  if (!graphqlUrl) {
    redirect(REDIRECT_LOGIN)
  }

  const headersList = await headers()
  const cookie = headersList.get('cookie') ?? ''

  const isLoggedIn = await checkCustomerSession(graphqlUrl, cookie)
  if (!isLoggedIn) {
    redirect(REDIRECT_LOGIN)
  }

  return (
    <main className="min-h-screen bg-white pb-24 sm:pt-20 lg:pb-16">
      <TopBar />
      <ContentShell className="py-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <aside className="w-full shrink-0 lg:w-56">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#1F5CAB]/80">
              Mein Konto
            </h2>
            <MeinKontoNav />
          </aside>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </ContentShell>
      <Footer />
      <Stickynav />
    </main>
  )
}
