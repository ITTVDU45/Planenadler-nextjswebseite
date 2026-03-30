import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

const DEFAULT_GRAPHQL_SERVER_URL = 'https://wp.planenadler.de/graphql'

function resolveServerUri(): string {
  const configuredUrl =
    process.env.GRAPHQL_SERVER_URL?.trim() || process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim()

  if (!configuredUrl) {
    return DEFAULT_GRAPHQL_SERVER_URL
  }

  try {
    return new URL(configuredUrl).toString()
  } catch {
    return DEFAULT_GRAPHQL_SERVER_URL
  }
}

const serverUri = resolveServerUri()

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
