type GraphQLErrorItem = {
  message: string
}

type GraphQLResponse<T> = {
  data?: T
  errors?: GraphQLErrorItem[]
}

interface GraphQLFetchOptions {
  query: string
  variables?: Record<string, unknown>
  timeoutMs?: number
}

export async function gqlFetch<T>(
  endpoint: string,
  { query, variables, timeoutMs = 10000 }: GraphQLFetchOptions,
): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    })

    const json = (await res.json()) as GraphQLResponse<T>
    if (!res.ok || json.errors?.length) {
      throw new Error(json.errors?.[0]?.message || 'GraphQL request failed')
    }
    if (!json.data) {
      throw new Error('No data returned from GraphQL')
    }
    return json.data
  } finally {
    clearTimeout(timeout)
  }
}
