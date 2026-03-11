import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { fetchCustomerAccount } from '@/features/auth/api/fetchCustomerAccount'
import type { CustomerAccountData } from '@/features/auth/types/customer'

export const metadata: Metadata = {
  title: 'Mein Konto | Planenadler',
  description: 'Ihr Kundenbereich – Bestellungen, Adressen und Kontodetails.',
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '–'
  try {
    return new Date(iso).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '–'
  }
}

function formatAddress(addr: CustomerAccountData['billing']): string {
  if (!addr) return '–'
  const parts = [
    [addr.firstName, addr.lastName].filter(Boolean).join(' '),
    addr.address1,
    addr.address2,
    [addr.postcode, addr.city].filter(Boolean).join(' '),
    addr.country,
  ].filter(Boolean)
  return parts.join(', ') || '–'
}

export default async function MeinKontoDashboardPage() {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL!
  const cookie = (await headers()).get('cookie') ?? ''
  const customer = await fetchCustomerAccount(graphqlUrl, cookie)

  if (!customer) {
    return (
      <p className="text-[#1F5CAB]/80">
        Konto-Daten konnten nicht geladen werden.
      </p>
    )
  }

  const firstName = customer.firstName ?? ''
  const nameFromParts = [firstName, customer.lastName].filter(Boolean).join(' ').trim()
  const displayName = customer.displayName ?? (nameFromParts || 'Kunde')
  const orders = customer.orders?.nodes ?? []
  const lastOrder = orders.length > 0 ? orders[0] : null

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#1F5CAB] sm:text-3xl">
        Dashboard
      </h1>
      <p className="text-[#1F5CAB]/80">
        Hallo {displayName}, willkommen in Ihrem Kontobereich.
      </p>

      {lastOrder && (
        <section className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-6" aria-labelledby="last-order-heading">
          <h2 id="last-order-heading" className="text-lg font-semibold text-[#1F5CAB]">
            Letzte Bestellung
          </h2>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-[#1F5CAB]/70">Bestellnummer</dt>
              <dd className="font-medium text-[#1F5CAB]">{lastOrder.orderNumber ?? lastOrder.databaseId ?? '–'}</dd>
            </div>
            <div>
              <dt className="text-sm text-[#1F5CAB]/70">Datum</dt>
              <dd className="font-medium text-[#1F5CAB]">{formatDate(lastOrder.date)}</dd>
            </div>
            <div>
              <dt className="text-sm text-[#1F5CAB]/70">Status</dt>
              <dd className="font-medium text-[#1F5CAB]">{lastOrder.status ?? '–'}</dd>
            </div>
            <div>
              <dt className="text-sm text-[#1F5CAB]/70">Summe</dt>
              <dd className="font-medium text-[#1F5CAB]">{lastOrder.total ?? '–'}</dd>
            </div>
          </dl>
        </section>
      )}

      <section className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-6" aria-labelledby="address-heading">
        <h2 id="address-heading" className="text-lg font-semibold text-[#1F5CAB]">
          Rechnungsadresse
        </h2>
        <p className="mt-2 text-[#1F5CAB]/80">
          {formatAddress(customer.billing)}
        </p>
      </section>
    </div>
  )
}
