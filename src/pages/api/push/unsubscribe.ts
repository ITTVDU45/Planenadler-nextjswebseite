import type { NextApiRequest, NextApiResponse } from 'next'
import { removeSubscription } from '@/lib/pushStore'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { endpoint } = req.body as { endpoint?: string }
  if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' })

  removeSubscription(endpoint)
  return res.status(200).json({ ok: true })
}
