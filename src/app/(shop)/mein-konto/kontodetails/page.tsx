import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { fetchCustomerAccount } from '@/features/auth/api/fetchCustomerAccount'
import { KontodetailsForm } from '@/features/auth/components/KontodetailsForm'

export const metadata: Metadata = {
  title: 'Kontodetails | Mein Konto | Planenadler',
  description: 'Ihre Kontoinformationen.',
}

export default async function KontodetailsPage() {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL!
  const cookie = (await headers()).get('cookie') ?? ''
  const customer = await fetchCustomerAccount(graphqlUrl, cookie)

  if (!customer) {
    return (
      <p className="text-[#1F5CAB]/80">
        Kontodetails konnten nicht geladen werden.
      </p>
    )
  }

  return <KontodetailsForm customer={customer} />
}
