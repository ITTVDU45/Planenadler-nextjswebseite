type Bucket = { count: number; resetAt: number }

const store = new Map<string, Bucket>()

const MAX_KEYS = 10_000

function pruneIfNeeded() {
  if (store.size <= MAX_KEYS) return
  const now = Date.now()
  for (const [key, bucket] of store.entries()) {
    if (now > bucket.resetAt) store.delete(key)
  }
  if (store.size > MAX_KEYS) {
    const keys = [...store.keys()].slice(0, store.size - MAX_KEYS)
    for (const k of keys) store.delete(k)
  }
}

export interface RateLimitOptions {
  windowMs: number
  max: number
}

export interface RateLimitResult {
  ok: boolean
  retryAfterSec?: number
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const { windowMs, max } = options
  const now = Date.now()
  pruneIfNeeded()

  let bucket = store.get(key)
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 1, resetAt: now + windowMs }
    store.set(key, bucket)
    return { ok: true }
  }

  if (bucket.count >= max) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) }
  }

  bucket.count += 1
  return { ok: true }
}
