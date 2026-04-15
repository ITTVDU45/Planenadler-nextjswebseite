import Script from 'next/script'

import { getGaMeasurementId } from '@/lib/analytics'
import { getGoogleAdsAwId } from '@/lib/google-ads'

export function GoogleAnalyticsScripts() {
  const gaId = getGaMeasurementId()
  const adsAwId = getGoogleAdsAwId()
  if (!gaId && !adsAwId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId ?? adsAwId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${gaId ? `gtag('config', '${gaId}', { page_path: window.location.pathname });` : ''}
          ${adsAwId ? `gtag('config', '${adsAwId}');` : ''}
        `}
      </Script>
    </>
  )
}
