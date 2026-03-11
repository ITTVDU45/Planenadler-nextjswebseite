import type { NextApiRequest, NextApiResponse } from 'next'

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX = 5

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim()
  if (Array.isArray(forwarded)) return forwarded[0].trim()
  return req.socket?.remoteAddress ?? 'unknown'
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count += 1
  return true
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface ContactBody {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  subject?: string
  message?: string
  privacy?: boolean
  website?: string
}

interface ValidationErrors {
  firstName?: string
  lastName?: string
  email?: string
  subject?: string
  message?: string
  privacy?: string
}

function validate(body: ContactBody): { ok: true } | { ok: false; errors: ValidationErrors } {
  const errors: ValidationErrors = {}
  if (!body.firstName?.trim()) errors.firstName = 'Vorname ist erforderlich.'
  if (!body.lastName?.trim()) errors.lastName = 'Nachname ist erforderlich.'
  if (!body.email?.trim()) errors.email = 'E-Mail ist erforderlich.'
  else if (!EMAIL_REGEX.test(body.email)) errors.email = 'Bitte eine gültige E-Mail-Adresse eingeben.'
  if (!body.subject?.trim()) errors.subject = 'Betreff ist erforderlich.'
  if (!body.message?.trim()) errors.message = 'Nachricht ist erforderlich.'
  if (body.privacy !== true) errors.privacy = 'Bitte stimmen Sie der Datenschutzerklärung zu.'

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      success: false,
      error: 'Zu viele Anfragen. Bitte später erneut versuchen.',
    })
  }

  let body: ContactBody
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {}
  } catch {
    return res.status(400).json({ success: false, error: 'Ungültiger Request-Body.' })
  }

  if (body.website?.trim()) {
    return res.status(200).json({ success: true })
  }

  const result = validate(body)
  if (!result.ok) {
    return res.status(400).json({ success: false, errors: result.errors })
  }

  return res.status(200).json({ success: true })
}
