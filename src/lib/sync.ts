import { clearAction, getPendingActions } from './db'

export async function syncPendingActions() {
  const pending = await getPendingActions()
  if (!pending.length) return { synced: 0 }

  let synced = 0

  for (const action of pending) {
    try {
      const response = await fetch(action.endpoint, {
        method: action.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.payload),
      })

      if (!response.ok) continue

      await clearAction(action.id)
      synced += 1
    } catch {
      continue
    }
  }

  return { synced }
}
