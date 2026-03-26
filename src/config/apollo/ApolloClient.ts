import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

const serverUri =
  process.env.GRAPHQL_SERVER_URL?.trim() || process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim()

const httpLink =
  typeof window === 'undefined'
    ? createHttpLink({
        uri: serverUri,
        fetch,
        credentials: 'omit',
      })
    : createHttpLink({
        uri: '/api/graphql',
        fetch,
        credentials: 'include',
      })

if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem('woo-session')
    if (raw) {
      const data = JSON.parse(raw) as { token?: string }
      const token = typeof data?.token === 'string' ? data.token.trim() : ''
      if (token) {
        void fetch('/api/woo-session', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        }).then(() => {
          try {
            localStorage.removeItem('woo-session')
          } catch {
            /* ignore */
          }
        })
      }
    }
  } catch {
    /* ignore */
  }
}

const isServerSide = typeof window === 'undefined'

const client = new ApolloClient({
  ssrMode: isServerSide,
  link: httpLink,
  cache: new InMemoryCache(),
})

export default client
