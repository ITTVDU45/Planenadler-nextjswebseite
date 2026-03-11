import type { NextApiRequest, NextApiResponse } from 'next'
import webpush from 'web-push'
import { listSubscriptions, removeSubscription } from '@/lib/pushStore'

function setupVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return false

  webpush.setVapidDetails('mailto:hello@planenadler.de', publicKey, privateKey)
  return true
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!setupVapid()) {
    return res.status(400).json({ error: 'VAPID keys missing' })
  }

  const { title, body } = req.body as { title?: string; body?: string }
  const payload = JSON.stringify({
    title: title ?? 'Planenadler',
    body: body ?? 'Neue Benachrichtigung',
  })

  const subscriptions = listSubscriptions()
  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webpush.sendNotification(subscription, payload),
    ),
  )

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      removeSubscription(subscriptions[index].endpoint)
    }
  })

  return res.status(200).json({ ok: true, sent: results.length })
}
