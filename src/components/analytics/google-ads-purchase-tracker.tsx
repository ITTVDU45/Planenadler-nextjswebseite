'use client'

import { useEffect, useRef } from 'react'

import {
  fireGoogleAdsPurchaseConversionWhenReady,
  getGoogleAdsPurchaseSendTo,
} from '@/lib/google-ads'

const STORAGE_PREFIX = 'gads-purchase-sent:'

export interface GoogleAdsPurchaseTrackerProps {
  /** Eindeutige Bestell-ID für Dedupe (z. B. Woo databaseId oder Bestellnummer). */
  transactionId: string
  /** Gesamtwert in EUR (optional, für Conversion-Wert). */
  valueEuro?: number
}

/**
 * Feuert einmal pro Session/Bestellung die Google-Ads-Kauf-Conversion (wenn ENV gesetzt).
 */
export function GoogleAdsPurchaseTracker({ transactionId, valueEuro }: GoogleAdsPurchaseTrackerProps) {
  const attempted = useRef(false)

  useEffect(() => {
    if (!getGoogleAdsPurchaseSendTo()) return
    if (!transactionId) return
    if (attempted.current) return

    const key = STORAGE_PREFIX + transactionId
    try {
      if (sessionStorage.getItem(key)) return
    } catch {
      /* private mode */
    }

    attempted.current = true

    fireGoogleAdsPurchaseConversionWhenReady({
      transactionId,
      currency: 'EUR',
      value: valueEuro,
    })

    try {
      sessionStorage.setItem(key, '1')
    } catch {
      /* ignore */
    }
  }, [transactionId, valueEuro])

  return null
}
