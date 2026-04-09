'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { getGaMeasurementId, pageview } from '@/lib/analytics'

export function GoogleAnalyticsAppTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstPath = useRef(true)

  useEffect(() => {
    const gaId = getGaMeasurementId()
    if (!gaId) return

    const qs = searchParams?.toString()
    const url = pathname + (qs ? `?${qs}` : '')

    if (isFirstPath.current) {
      isFirstPath.current = false
      return
    }

    pageview(url)
  }, [pathname, searchParams])

  return null
}
