import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { fetchCustomerAccount } from '@/features/auth/api/fetchCustomerAccount'
import { AdressenContent } from '@/features/auth/components/AdressenContent'

export const metadata: Metadata = {
  title: 'Adressen | Mein Konto | Planenadler',
  description: 'Ihre Rechnungs- und Lieferadressen.',
}

export default async function AdressenPage() {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL!
  const cookie = (await headers()).get('cookie') ?? ''
  const customer = await fetchCustomerAccount(graphqlUrl, cookie)

  if (!customer) {
    return (
      <p className="text-[#1F5CAB]/80">
        Adressen konnten nicht geladen werden.
      </p>
    )
  }

  return <AdressenContent customer={customer} />
}
