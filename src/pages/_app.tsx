// Imports
import Head from 'next/head'
import Router from 'next/router'
import NProgress from 'nprogress'
import { ApolloProvider } from '@apollo/client'
import { Playfair_Display } from 'next/font/google'

import client from '@/config/apollo/ApolloClient'
import CartInitializer from '@/features/cart/components/CartInitializer.component'
import { PwaManager } from '@/components/pwa/PwaManager'

// Types
import type { AppProps } from 'next/app'

// Styles
import '@/shared/styles/globals.css'
import 'nprogress/nprogress.css'

// NProgress
Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <CartInitializer />
      <PwaManager />
      <div className={playfair.variable}>
        <Component {...pageProps} />
      </div>
    </ApolloProvider>
  );
}

export default MyApp
