import { redirect } from 'next/navigation'

/**
 * Callback nach Redirect von Klarna oder PayPal.
 * Liest provider und status aus der URL und leitet zu Zahlungsmethoden mit Query-Param weiter.
 * Bei success kann später ein API-Aufruf erfolgen, um die Zahlungsmethode im Account zu bestätigen.
 */
export default async function PaymentMethodCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string; status?: string }>
}) {
  const params = await searchParams
  const provider = params.provider ?? ''
  const status = params.status ?? ''

  const validProvider = provider === 'klarna' || provider === 'paypal'
  const validStatus = status === 'success' || status === 'cancel'

  const search = new URLSearchParams()
  if (validProvider) search.set('provider', provider)
  if (validStatus) search.set('status', status)

  redirect(`/mein-konto/zahlungsmethoden${search.toString() ? `?${search.toString()}` : ''}`)
}
