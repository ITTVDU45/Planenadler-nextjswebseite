'use client'

import Router from 'next/router'
import { useEffect } from 'react'

import { getGaMeasurementId, pageview } from '@/lib/analytics'

export function GoogleAnalyticsPagesTracker() {
  useEffect(() => {
    const gaId = getGaMeasurementId()
    if (!gaId) return

    function onRouteChangeComplete(url: string) {
      pageview(url)
    }

    Router.events.on('routeChangeComplete', onRouteChangeComplete)
    return () => {
      Router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [])

  return null
}
