import type { DocumentNode } from 'graphql'
import { print } from 'graphql'

import { gqlFetch } from '@/features/home/sections/ProductsShowcase/api/fetcher'

const DEFAULT_GRAPHQL_ENDPOINT = 'https://wp.planenadler.de/graphql'

function getGraphqlEndpoints(): string[] {
  const configuredEndpoint =
    process.env.GRAPHQL_SERVER_URL?.trim() || process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim()

  return Array.from(
    new Set(
      [configuredEndpoint, DEFAULT_GRAPHQL_ENDPOINT].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  )
}

export async function fetchGraphqlWithFallback<T>(
  query: DocumentNode,
  variables?: Record<string, unknown>,
  timeoutMs = 12000,
): Promise<T> {
  const endpoints = getGraphqlEndpoints()
  let lastError: unknown = null

  for (const endpoint of endpoints) {
    try {
      return await gqlFetch<T>(endpoint, {
        query: print(query),
        variables,
        timeoutMs,
      })
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('GraphQL fetch failed')
}
