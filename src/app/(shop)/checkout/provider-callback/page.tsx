import { redirect } from 'next/navigation'

export default async function CheckoutProviderCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const provider = typeof params.provider === 'string' ? params.provider : ''
  const status = typeof params.status === 'string' ? params.status : ''

  const validProvider = provider === 'paypal' || provider === 'klarna'
  const validStatus = status === 'success' || status === 'cancel'

  const search = new URLSearchParams()
  for (const [key, rawValue] of Object.entries(params)) {
    if (Array.isArray(rawValue)) {
      for (const value of rawValue) {
        if (value) search.append(key, value)
      }
      continue
    }
    if (typeof rawValue === 'string' && rawValue) {
      search.set(key, rawValue)
    }
  }

  if (validProvider) search.set('provider', provider)
  if (validStatus) search.set('status', status)

  redirect(`/checkout/payment${search.toString() ? `?${search.toString()}` : ''}`)
}
