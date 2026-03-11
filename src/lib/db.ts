import { openDB, type DBSchema } from 'idb'

export interface OfflineAction {
  id: string
  endpoint: string
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  payload: unknown
  createdAt: number
}

interface PwaDatabase extends DBSchema {
  actions: {
    key: string
    value: OfflineAction
    indexes: { 'by-createdAt': number }
  }
}

let dbPromise: ReturnType<typeof openDB<PwaDatabase>> | null = null

function getDb() {
  if (typeof indexedDB === 'undefined') return null
  if (dbPromise) return dbPromise

  dbPromise = openDB<PwaDatabase>('planenadler-pwa', 1, {
    upgrade(db) {
      const store = db.createObjectStore('actions', { keyPath: 'id' })
      store.createIndex('by-createdAt', 'createdAt')
    },
  })

  return dbPromise
}

export async function addOfflineAction(
  action: Omit<OfflineAction, 'id' | 'createdAt'>,
) {
  const db = getDb()
  if (!db) return null
  const id = crypto.randomUUID()
  const record: OfflineAction = { ...action, id, createdAt: Date.now() }
  const resolvedDb = await db
  await resolvedDb.put('actions', record)
  return record
}

export async function getPendingActions() {
  const db = getDb()
  if (!db) return []
  const resolvedDb = await db
  return resolvedDb.getAllFromIndex('actions', 'by-createdAt')
}

export async function clearAction(id: string) {
  const db = getDb()
  if (!db) return
  const resolvedDb = await db
  await resolvedDb.delete('actions', id)
}
