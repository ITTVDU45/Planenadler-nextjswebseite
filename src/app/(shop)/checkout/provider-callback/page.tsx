import { redirect } from 'next/navigation'

export default async function CheckoutProviderCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string; status?: string }>
}) {
  const params = await searchParams
  const provider = params.provider ?? ''
  const status = params.status ?? ''

  const validProvider = provider === 'paypal' || provider === 'klarna'
  const validStatus = status === 'success' || status === 'cancel'

  const search = new URLSearchParams()
  if (validProvider) search.set('provider', provider)
  if (validStatus) search.set('status', status)

  redirect(`/checkout/payment${search.toString() ? `?${search.toString()}` : ''}`)
}
