'use client'

import type { CheckoutGatewayOption, CheckoutGatewayDiagnostics } from '../lib/payment-gateways'
import type { PaymentMethodId } from '../types/checkout.types'

interface ExpressCheckoutProps {
  title: string
  subtitle: string
  gateways: CheckoutGatewayOption[]
  diagnostics: CheckoutGatewayDiagnostics | null
  loading: boolean
  error: string | null
  context: 'cart' | 'payment'
  providerLoading?: PaymentMethodId | null
  onActivateGateway: (gatewayId: PaymentMethodId) => void
  onRefresh: () => void
}

function getButtonLabel(gateway: CheckoutGatewayOption, context: 'cart' | 'payment'): string {
  if (gateway.expressEligible && context === 'payment') {
    return `Mit ${gateway.label} direkt weiter`
  }
  if (gateway.expressEligible && context === 'cart') {
    return `${gateway.label} Express`
  }
  if (context === 'cart') {
    return `${gateway.label} im Checkout`
  }
  return `${gateway.label} auswaehlen`
}

function getButtonStyle(gateway: CheckoutGatewayOption): string {
  if (gateway.expressEligible) {
    return 'border-transparent bg-[#1F5CAB] text-white hover:bg-[#0F2B52]'
  }
  return 'border-[#B9D4F3] bg-white text-[#1F5CAB] hover:border-[#1F5CAB] hover:bg-[#F7FAFF]'
}

export function ExpressCheckout({
  title,
  subtitle,
  gateways,
  diagnostics,
  loading,
  error,
  context,
  providerLoading = null,
  onActivateGateway,
  onRefresh,
}: ExpressCheckoutProps) {
  const availableGateways = gateways.filter((gateway) => gateway.available)

  return (
    <section className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#1F5CAB]">{title}</h2>
          <p className="mt-1 text-sm text-[#1F5CAB]/75">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-full border border-[#DBE9F9] bg-white px-3 py-1.5 text-xs font-semibold text-[#1F5CAB] transition hover:border-[#1F5CAB]"
        >
          Neu pruefen
        </button>
      </div>

      {loading ? (
        <div className="mt-5 rounded-xl border border-[#DBE9F9] bg-white p-4 text-sm text-[#1F5CAB]/75">
          Zahlungsarten werden aus WooCommerce geladen...
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          {availableGateways.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {availableGateways.map((gateway) => {
                const isLoading = providerLoading === gateway.id
                return (
                  <button
                    key={gateway.id}
                    type="button"
                    onClick={() => onActivateGateway(gateway.id)}
                    disabled={isLoading}
                    className={`rounded-2xl border px-4 py-4 text-left transition disabled:cursor-wait disabled:opacity-70 ${getButtonStyle(gateway)}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-base font-semibold">{gateway.label}</span>
                      {gateway.expressEligible ? (
                        <span className="rounded-full bg-white/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                          Express
                        </span>
                      ) : null}
                    </div>
                    <p className={`mt-1 text-sm ${gateway.expressEligible ? 'text-white/85' : 'text-[#1F5CAB]/75'}`}>
                      {getButtonLabel(gateway, context)}
                    </p>
                    {gateway.helperText ? (
                      <p className={`mt-2 text-xs ${gateway.expressEligible ? 'text-white/70' : 'text-[#1F5CAB]/60'}`}>
                        {gateway.helperText}
                      </p>
                    ) : null}
                    {isLoading ? (
                      <p className="mt-2 text-xs text-white/80">Provider wird gestartet...</p>
                    ) : null}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              WooCommerce liefert fuer diese Session aktuell keine verfuegbaren Zahlungsarten zurueck.
            </div>
          )}

          {diagnostics ? (
            <div className="mt-5 rounded-xl border border-[#DBE9F9] bg-white p-4 text-sm text-[#1F5CAB]">
              <p className="font-semibold">Verbindungstest</p>
              <p className="mt-1 text-[#1F5CAB]/75">
                {diagnostics.cartFetchOk && diagnostics.checkoutBootstrapOk
                  ? 'Next.js erreicht Warenkorb und Checkout der WooCommerce Store API.'
                  : 'Die Verbindung zur WooCommerce Store API ist unvollstaendig.'}
              </p>
              <div className="mt-3 grid gap-2 text-xs text-[#1F5CAB]/80 sm:grid-cols-2">
                <p>Session-Cookie: {diagnostics.cookiePresent ? 'vorhanden' : 'nicht gefunden'}</p>
                <p>Artikel im Cart: {diagnostics.cartItemCount}</p>
                <p>Cart-Endpoint: {diagnostics.cartFetchOk ? 'ok' : 'Fehler'}</p>
                <p>Checkout-Bootstrap: {diagnostics.checkoutBootstrapOk ? 'ok' : 'Fehler'}</p>
              </div>
              <p className="mt-3 text-xs text-[#1F5CAB]/70">
                Backend-Gateways: {diagnostics.availablePaymentMethods.length > 0 ? diagnostics.availablePaymentMethods.join(', ') : 'keine'}
              </p>
              {diagnostics.errors.length > 0 ? (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  {diagnostics.errors.join(' ')}
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
