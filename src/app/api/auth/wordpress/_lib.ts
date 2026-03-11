import { NextRequest, NextResponse } from 'next/server'

const ACCOUNT_PATH = '/mein-konto/'
const LOST_PASSWORD_PATH = '/mein-konto/lost-password/'

export function resolveWordPressOrigin(): string {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL
  if (!graphqlUrl) {
    throw new Error('Konfiguration fehlt: NEXT_PUBLIC_GRAPHQL_URL')
  }
  return new URL(graphqlUrl).origin
}

export function resolveWordPressAccountUrl(): string {
  return `${resolveWordPressOrigin()}${ACCOUNT_PATH}`
}

export function resolveWordPressLostPasswordUrl(): string {
  return `${resolveWordPressOrigin()}${LOST_PASSWORD_PATH}`
}

export function validateSameOrigin(request: NextRequest): string | null {
  const origin = request.headers.get('origin')
  if (!origin) return null

  try {
    const originUrl = new URL(origin)
    if (originUrl.host !== request.nextUrl.host) {
      return 'Unzulaessige Herkunft.'
    }
  } catch {
    return 'Unzulaessige Herkunft.'
  }

  return null
}

export function extractInputValue(html: string, inputName: string): string {
  const inputTags = html.match(/<input[^>]*>/gi) ?? []
  const normalizedInputName = inputName.toLowerCase()

  for (const inputTag of inputTags) {
    const nameMatch = inputTag.match(/\bname=["']([^"']+)["']/i)
    if (!nameMatch?.[1] || nameMatch[1].toLowerCase() !== normalizedInputName) continue
    const valueMatch = inputTag.match(/\bvalue=["']([^"']*)["']/i)
    return valueMatch?.[1] ?? ''
  }

  return ''
}

function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function extractWooErrorMessage(html: string): string {
  const listMatch = html.match(/<ul[^>]*class=["'][^"']*woocommerce-error[^"']*["'][^>]*>([\s\S]*?)<\/ul>/i)
  if (!listMatch?.[1]) return ''

  const liMatch = listMatch[1].match(/<li[^>]*>([\s\S]*?)<\/li>/i)
  if (!liMatch?.[1]) return ''

  const text = stripHtmlTags(liMatch[1])
  return text || ''
}

function splitSetCookieHeader(headerValue: string): string[] {
  const values: string[] = []
  let current = ''
  let inExpires = false

  for (let i = 0; i < headerValue.length; i += 1) {
    const char = headerValue[i]
    const nextPart = headerValue.slice(i, i + 8).toLowerCase()
    if (nextPart === 'expires=') inExpires = true

    if (char === ',' && !inExpires) {
      if (current.trim()) values.push(current.trim())
      current = ''
      continue
    }

    if (char === ';' && inExpires) inExpires = false
    current += char
  }

  if (current.trim()) values.push(current.trim())
  return values
}

export function getSetCookieHeaders(response: Response): string[] {
  const headersWithGetSetCookie = response.headers as Headers & {
    getSetCookie?: () => string[]
  }

  if (typeof headersWithGetSetCookie.getSetCookie === 'function') {
    return headersWithGetSetCookie.getSetCookie()
  }

  const raw = response.headers.get('set-cookie')
  if (!raw) return []
  return splitSetCookieHeader(raw)
}

function extractCookieName(setCookieHeader: string): string {
  const firstPart = setCookieHeader.split(';', 1)[0] ?? ''
  const separator = firstPart.indexOf('=')
  if (separator <= 0) return ''
  return firstPart.slice(0, separator).trim()
}

function extractCookieValue(setCookieHeader: string): string {
  const firstPart = setCookieHeader.split(';', 1)[0] ?? ''
  const separator = firstPart.indexOf('=')
  if (separator <= 0) return ''
  return firstPart.slice(separator + 1).trim()
}

export function createCookieHeaderForWpRequest(setCookieHeaders: string[]): string {
  const cookies = new Map<string, string>()

  for (const header of setCookieHeaders) {
    const name = extractCookieName(header)
    const value = extractCookieValue(header)
    if (!name || !value) continue

    if (
      !name.startsWith('wordpress_logged_in_') &&
      !name.startsWith('wordpress_sec_') &&
      !name.startsWith('wp_woocommerce_session_')
    ) {
      continue
    }
    cookies.set(name, value)
  }

  return [...cookies.entries()].map(([name, value]) => `${name}=${value}`).join('; ')
}

function normalizeSetCookieForAppHost(setCookieHeader: string, isHttps: boolean): string {
  let value = setCookieHeader

  value = value.replace(/;\s*domain=[^;]*/gi, '')
  if (!isHttps) {
    value = value.replace(/;\s*secure/gi, '')
  }
  if (!/;\s*path=/i.test(value)) {
    value += '; Path=/'
  }
  if (!/;\s*samesite=/i.test(value)) {
    value += '; SameSite=Lax'
  }

  return value
}

export function appendAuthCookiesToResponse(
  response: NextResponse,
  setCookieHeaders: string[],
  isHttps: boolean
) {
  for (const header of setCookieHeaders) {
    const name = extractCookieName(header)
    if (!name) continue

    const isRelevant =
      name.startsWith('wordpress_logged_in_') ||
      name.startsWith('wordpress_sec_') ||
      name.startsWith('wp_woocommerce_session_')

    if (!isRelevant) continue
    response.headers.append('set-cookie', normalizeSetCookieForAppHost(header, isHttps))
  }
}

export function createCookieHeaderFromRequest(request: NextRequest): string {
  const cookies = request.cookies.getAll()
  const relevant = cookies.filter((cookie) => {
    return (
      cookie.name.startsWith('wordpress_logged_in_') ||
      cookie.name.startsWith('wordpress_sec_') ||
      cookie.name.startsWith('wp_woocommerce_session_')
    )
  })

  return relevant.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ')
}

export function appendExpiredAuthCookies(
  response: NextResponse,
  request: NextRequest,
  isHttps: boolean
) {
  const cookies = request.cookies.getAll()
  const names = new Set<string>()
  const hashes = new Set<string>()

  const extractHash = (name: string): string => {
    if (name.startsWith('wordpress_logged_in_')) {
      return name.slice('wordpress_logged_in_'.length)
    }
    if (name.startsWith('wordpress_sec_')) {
      return name.slice('wordpress_sec_'.length)
    }
    if (name.startsWith('wp_woocommerce_session_')) {
      return name.slice('wp_woocommerce_session_'.length)
    }
    return ''
  }

  for (const cookie of cookies) {
    const isRelevant =
      cookie.name.startsWith('wordpress_logged_in_') ||
      cookie.name.startsWith('wordpress_sec_') ||
      cookie.name.startsWith('wp_woocommerce_session_')

    if (!isRelevant) continue
    names.add(cookie.name)
    const hash = extractHash(cookie.name)
    if (hash) hashes.add(hash)
  }

  for (const hash of hashes) {
    names.add(`wordpress_logged_in_${hash}`)
    names.add(`wordpress_sec_${hash}`)
    names.add(`wp_woocommerce_session_${hash}`)
  }

  const paths = ['/', '/wp-admin', '/wp-content/plugins']
  const securePart = isHttps ? '; Secure' : ''

  for (const name of names) {
    for (const path of paths) {
      response.headers.append(
        'set-cookie',
        `${name}=; Path=${path}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${securePart}`
      )
    }
  }
}

export function extractLogoutUrl(html: string, fallbackOrigin: string): string {
  const byHref = html.match(/href=["']([^"']*wp-login\.php\?action=logout[^"']*)["']/i)
  if (byHref?.[1]) {
    return new URL(byHref[1], fallbackOrigin).toString()
  }

  return `${fallbackOrigin}/wp-login.php?action=logout`
}
