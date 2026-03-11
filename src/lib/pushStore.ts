export interface StoredSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

const store: StoredSubscription[] = []

export function addSubscription(subscription: StoredSubscription) {
  const exists = store.find((item) => item.endpoint === subscription.endpoint)
  if (exists) return
  store.push(subscription)
}

export function removeSubscription(endpoint: string) {
  const index = store.findIndex((item) => item.endpoint === endpoint)
  if (index >= 0) store.splice(index, 1)
}

export function listSubscriptions() {
  return [...store]
}
