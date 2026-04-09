import { Html, Head, Main, NextScript } from 'next/document'

import { getGtmBootstrapScript, getGtmId } from '@/lib/gtm'

export default function Document() {
  const gtmId = getGtmId()

  return (
    <Html lang="de">
      <Head>
        <link rel="icon" href="/Planenadlerlogo.png" type="image/png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/Planenadlerlogo.png" />
        <meta name="theme-color" content="#1F5CAB" />
        <meta name="application-name" content="Planenadler" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {gtmId ? (
          <script
            dangerouslySetInnerHTML={{
              __html: getGtmBootstrapScript(gtmId),
            }}
          />
        ) : null}
      </Head>
      <body>
        {gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height={0}
              width={0}
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
