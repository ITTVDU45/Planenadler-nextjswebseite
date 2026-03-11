import { redirect } from 'next/navigation'

const CHECKOUT_SHIPPING_PATH = '/checkout/shipping'

export default function KassePage() {
  redirect(CHECKOUT_SHIPPING_PATH)
}
