'use client'

import { useEffect, useState } from 'react'
import type { PaymentOptionsResponse } from '../lib/payment-gateways'

interface PaymentOptionsState {
  data: PaymentOptionsResponse | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function usePaymentOptions(): PaymentOptionsState {
  const [data, setData] = useState<PaymentOptionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadPaymentOptions() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/checkout/payment-options', {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        })
        const payload = (await response.json().catch(() => ({}))) as
          | PaymentOptionsResponse
          | { error?: string }

        if (!response.ok) {
          setError(payload && 'error' in payload ? payload.error ?? 'Zahlungsarten konnten nicht geladen werden.' : 'Zahlungsarten konnten nicht geladen werden.')
          setData(null)
          return
        }

        setData(payload as PaymentOptionsResponse)
      } catch (error) {
        if (controller.signal.aborted) return
        setData(null)
        setError(error instanceof Error ? error.message : 'Zahlungsarten konnten nicht geladen werden.')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadPaymentOptions()

    return () => controller.abort()
  }, [refreshTick])

  return {
    data,
    loading,
    error,
    refresh: () => setRefreshTick((value) => value + 1),
  }
}

