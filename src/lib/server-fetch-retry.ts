/**
 * Server-seitiger fetch mit Retries bei typischen transienten Fehlern (502/503/504, 429, Timeout).
 * Fuer WordPress/WPGraphQL und REST-Upstreams waehrend ISR/SSR.
 */

export interface ServerFetchRetryOptions {
  maxAttempts?: number
  baseDelayMs?: number
  timeoutMs?: number
}

const DEFAULT_MAX_ATTEMPTS = 4
const DEFAULT_BASE_DELAY_MS = 400
const DEFAULT_TIMEOUT_MS = 28_000

const RETRYABLE_STATUS = new Set([408, 429, 502, 503, 504])

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Next.js erweitert fetch-Init um `next` (Caching) — Typ bleibt kompatibel zu RequestInit. */
export type NextServerFetchInit = RequestInit & { next?: { revalidate?: number | false } }

export async function fetchWithTransientRetry(
  url: string,
  init: NextServerFetchInit,
  options?: ServerFetchRetryOptions,
): Promise<Response> {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS
  const baseDelayMs = options?.baseDelayMs ?? DEFAULT_BASE_DELAY_MS
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS

  let lastError: unknown

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
      })

      if (res.ok) return res

      const canRetry =
        RETRYABLE_STATUS.has(res.status) && attempt < maxAttempts - 1

      if (!canRetry) return res

      const retryAfter = res.headers.get('Retry-After')
      const waitSec = retryAfter ? Number.parseInt(retryAfter, 10) : Number.NaN
      const delay = Number.isFinite(waitSec) && waitSec > 0
        ? Math.min(waitSec * 1000, 15_000)
        : Math.min(baseDelayMs * 2 ** attempt, 8_000)

      await sleep(delay)
    } catch (err) {
      lastError = err
      if (attempt >= maxAttempts - 1) break
      await sleep(Math.min(baseDelayMs * 2 ** attempt, 8_000))
    } finally {
      clearTimeout(timeoutId)
    }
  }

  if (lastError instanceof Error) {
    const aborted =
      lastError.name === 'AbortError' ||
      /aborted|timeout/i.test(lastError.message)
    if (aborted) {
      throw new Error(`Zeitueberschreitung nach ${timeoutMs}ms beim Abruf der API`)
    }
    throw lastError
  }

  throw new Error('Netzwerkfehler beim Abruf der API')
}
