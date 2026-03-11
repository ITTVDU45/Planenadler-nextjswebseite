/**
 * GraphQL fetcher for blog (WordPress posts) using NEXT_PUBLIC_GRAPHQL_URL.
 */

type GraphQLErrorItem = { message: string }

type GraphQLResponse<T> = {
  data?: T
  errors?: GraphQLErrorItem[]
}

interface GraphQLFetchOptions {
  query: string
  variables?: Record<string, unknown>
  timeoutMs?: number
}

export async function blogGraphQLFetch<T>(
  options: GraphQLFetchOptions
): Promise<T> {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL
  if (!endpoint) {
    throw new Error('NEXT_PUBLIC_GRAPHQL_URL ist nicht gesetzt')
  }

  const { query, variables = {}, timeoutMs = 10000 } = options
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    })

    let json: GraphQLResponse<T>
    try {
      json = (await res.json()) as GraphQLResponse<T>
    } catch {
      const text = await res.text().catch(() => '')
      throw new Error(
        `Blog GraphQL: Ungültige JSON-Antwort (Status ${res.status}). ${text.slice(0, 200)}`
      )
    }

    if (json.errors?.length) {
      const msg = json.errors.map((e) => e.message).join('; ')
      throw new Error(`Blog GraphQL Fehler: ${msg}`)
    }
    if (!res.ok) {
      throw new Error(`Blog GraphQL: HTTP ${res.status}`)
    }
    if (!json.data) {
      throw new Error('Blog GraphQL: Keine Daten in der Antwort')
    }
    return json.data
  } finally {
    clearTimeout(timeout)
  }
}
