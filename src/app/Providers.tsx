'use client'

import { ApolloProvider } from '@apollo/client'
import client from '@/config/apollo/ApolloClient'
import CartInitializer from '@/features/cart/components/CartInitializer.component'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <CartInitializer />
      {children}
    </ApolloProvider>
  )
}
