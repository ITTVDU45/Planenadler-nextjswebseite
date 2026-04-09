/**
 * WooCommerce Store API liefert `payment_methods` meist als string[],
 * manche Erweiterungen nutzen Objekte mit `id`.
 */
export function normalizeStoreApiPaymentMethods(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const ids: string[] = []
  for (const entry of raw) {
    if (typeof entry === 'string') {
      const t = entry.trim()
      if (t) ids.push(t)
      continue
    }
    if (entry && typeof entry === 'object') {
      const o = entry as Record<string, unknown>
      const id = o.id
      if (typeof id === 'string' && id.trim()) {
        ids.push(id.trim())
        continue
      }
      const name = o.name
      if (typeof name === 'string' && name.trim()) ids.push(name.trim())
    }
  }
  return ids
}

export function mergeUniquePaymentMethodIds(...lists: string[][]): string[] {
  return [...new Set(lists.flat().filter(Boolean))]
}
