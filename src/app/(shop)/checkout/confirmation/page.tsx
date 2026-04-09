import { redirect } from 'next/navigation'

/** @deprecated Nutze /thank-you – bleibt für alte Links erhalten. */
export default function CheckoutConfirmationPage() {
  redirect('/thank-you')
}
