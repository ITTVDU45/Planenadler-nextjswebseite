'use client'

import { useEffect, useRef } from 'react'
import { pushToDataLayer, roundTrackingValue, type DataLayerEcommerceEvent } from '@/lib/tracking'

interface ProductViewTrackerProps {
  productId: number
  slug?: string
  name: string
  priceValue?: number | null
}

export function ProductViewTracker({ productId, slug, name, priceValue }: ProductViewTrackerProps) {
  const pushedRef = useRef(false)

  useEffect(() => {
    if (pushedRef.current) return

    const itemId = Number.isFinite(productId) && productId > 0 ? String(productId) : slug?.trim()
    if (!itemId || !name.trim()) return

    const event: DataLayerEcommerceEvent = {
      event: 'view_item',
      ecommerce: {
        currency: 'EUR',
        items: [
          {
            item_id: itemId,
            item_name: name,
            price:
              priceValue != null && Number.isFinite(priceValue) && priceValue >= 0
                ? roundTrackingValue(priceValue)
                : undefined,
            quantity: 1,
          },
        ],
      },
    }

    pushToDataLayer(event)
    pushedRef.current = true
  }, [name, priceValue, productId, slug])

  return null
}
