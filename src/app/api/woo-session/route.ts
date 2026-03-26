import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/lib/client-ip'
import { checkRateLimit } from '@/lib/rate-limit'
import { appendWooSessionCookie, normalizeWooSessionToken } from '@/lib/woo-session-cookie'
import { validateSameOrigin } from '@/app/api/auth/wordpress/_lib'
import { isRequestHttps } from '@/lib/request-is-https'

type Body = { token?: string }

export async function POST(request: NextRequest) {
  const originError = validateSameOrigin(request)
  if (originError) {
    return NextResponse.json({ error: originError }, { status: 403 })
  }

  const ip = getClientIp(request)
  const rl = checkRateLimit(`woo-session:${ip}`, { windowMs: 60_000, max: 30 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec ?? 60) } },
    )
  }

  const body = (await request.json().catch(() => ({}))) as Body
  const raw = typeof body.token === 'string' ? body.token : ''
  const token = normalizeWooSessionToken(raw || undefined)
  const res = NextResponse.json({ success: true })
  appendWooSessionCookie(res, token, isRequestHttps(request))
  return res
}

export async function DELETE(request: NextRequest) {
  const originError = validateSameOrigin(request)
  if (originError) {
    return NextResponse.json({ error: originError }, { status: 403 })
  }

  const res = NextResponse.json({ success: true })
  appendWooSessionCookie(res, null, isRequestHttps(request))
  return res
}
