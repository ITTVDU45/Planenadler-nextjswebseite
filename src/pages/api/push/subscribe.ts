import type { NextApiRequest, NextApiResponse } from 'next'
import webpush from 'web-push'
import { addSubscription, type StoredSubscription } from '@/lib/pushStore'

function setupVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return false

  webpush.setVapidDetails('mailto:hello@planenadler.de', publicKey, privateKey)
  return true
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!setupVapid()) {
    return res.status(400).json({ error: 'VAPID keys missing' })
  }

  const subscription = req.body as StoredSubscription
  if (!subscription?.endpoint || !subscription?.keys?.p256dh) {
    return res.status(400).json({ error: 'Invalid subscription' })
  }

  addSubscription(subscription)
  return res.status(200).json({ ok: true })
}
