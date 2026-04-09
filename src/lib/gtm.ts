export const GTM_ID_FALLBACK = 'GTM-M33MB2FV'

export function getGtmId(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_GTM_ID?.trim()
  if (fromEnv === '') return null
  const raw = fromEnv || GTM_ID_FALLBACK
  return /^GTM-[A-Z0-9]+$/i.test(raw) ? raw : null
}

export function getGtmBootstrapScript(gtmId: string): string {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`
}
