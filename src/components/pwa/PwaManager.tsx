'use client'

import { useCallback, useEffect, useState } from 'react'
import { syncPendingActions } from '@/lib/sync'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)

  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i)
  }

  return output
}

export function PwaManager() {
  const [isOnline, setIsOnline] = useState(true)
  const [updateReady, setUpdateReady] = useState(false)
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isWorking, setIsWorking] = useState(false)

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      syncPendingActions()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const register = async () => {
      if (process.env.NODE_ENV !== 'production') return
      try {
        const response = await fetch('/sw.js', { method: 'HEAD' })
        if (!response.ok) return
      } catch {
        return
      }

      navigator.serviceWorker
        .register('/sw.js')
        .then(async (reg) => {
          setRegistration(reg)

          if (reg.waiting) setUpdateReady(true)

          reg.addEventListener('updatefound', () => {
            const installing = reg.installing
            if (!installing) return
            installing.addEventListener('statechange', () => {
              if (installing.state === 'installed') {
                if (navigator.serviceWorker.controller) setUpdateReady(true)
              }
            })
          })

          if ('pushManager' in reg && publicKey) {
            const subscription = await reg.pushManager.getSubscription()
            setIsSubscribed(Boolean(subscription))
          }
        })
        .catch(() => null)
    }

    register()
  }, [publicKey])

  const applyUpdate = useCallback(() => {
    if (!registration?.waiting) return
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    window.location.reload()
  }, [registration])

  const subscribePush = useCallback(async () => {
    if (!registration || !publicKey || !('pushManager' in registration)) return

    try {
      setIsWorking(true)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      })

      setIsSubscribed(true)
    } finally {
      setIsWorking(false)
    }
  }, [publicKey, registration])

  const unsubscribePush = useCallback(async () => {
    if (!registration || !('pushManager' in registration)) return
    try {
      setIsWorking(true)
      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) return

      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })
      await subscription.unsubscribe()
      setIsSubscribed(false)
    } finally {
      setIsWorking(false)
    }
  }, [registration])

  return (
    <>
      {!isOnline ? (
        <div className="fixed bottom-4 left-4 z-50 rounded-full bg-[#1F5CAB] px-4 py-2 text-xs font-semibold text-white shadow-lg">
          Offline
        </div>
      ) : null}

      {updateReady ? (
        <div className="fixed bottom-4 right-4 z-50 rounded-[18px] border border-white/60 bg-white/90 px-4 py-3 text-xs font-semibold text-[#1F5CAB] shadow-lg backdrop-blur">
          <div>Update verfügbar</div>
          <button
            type="button"
            onClick={applyUpdate}
            className="mt-2 inline-flex items-center rounded-full bg-[#1F5CAB] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#0F2B52]"
          >
            Aktualisieren
          </button>
        </div>
      ) : null}

      {publicKey ? (
        <div
          className={`fixed z-50 rounded-[18px] border border-white/60 bg-white/90 px-4 py-3 text-xs font-semibold text-[#1F5CAB] shadow-lg backdrop-blur ${
            updateReady ? 'bottom-20 right-4' : 'bottom-4 right-4'
          }`}
        >
          <div>Push‑Benachrichtigungen</div>
          <button
            type="button"
            onClick={isSubscribed ? unsubscribePush : subscribePush}
            disabled={isWorking}
            className="mt-2 inline-flex items-center rounded-full bg-[#3982DC] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#1F5CAB] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubscribed ? 'Deaktivieren' : 'Aktivieren'}
          </button>
        </div>
      ) : null}
    </>
  )
}
