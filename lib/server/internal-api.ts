import { headers } from 'next/headers'
import type { EmailConfig } from '@/lib/emails/templates'
import { sendEmailWithConfig } from '@/lib/emails/send-with-providers'

/** Resolve request origin for same-origin API calls (e.g. WhatsApp) from Route Handlers. */
export async function getInternalOrigin(): Promise<string> {
  const trim = (u: string) => u.replace(/\/$/, '')
  const fromEnv = process.env.INTERNAL_APP_URL || process.env.NEXT_PUBLIC_APP_URL
  if (fromEnv) return trim(fromEnv)
  if (process.env.VERCEL_URL) return `https://${trim(process.env.VERCEL_URL)}`
  const koyeb = process.env.KOYEB_PUBLIC_DOMAIN
  if (koyeb) {
    const host = trim(koyeb.replace(/^https?:\/\//, ''))
    return `https://${host}`
  }
  try {
    const h = await headers()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    const proto = h.get('x-forwarded-proto') ?? (host?.includes('localhost') ? 'http' : 'https')
    if (host) return `${proto}://${host}`
  } catch {
    // Can happen for detached async work outside request scope.
  }
  return 'http://localhost:3000'
}

/** Sends email in-process (no HTTP loopback). Required for reliable order emails on Koyeb/Vercel. */
export async function postSendEmail(config: EmailConfig): Promise<boolean> {
  try {
    const outcome = await sendEmailWithConfig(config)
    if (!outcome.ok) {
      console.error('[postSendEmail]', outcome.error, { to: config.to, subject: config.subject })
      return false
    }
    return true
  } catch (e) {
    console.error('[postSendEmail] unexpected', e)
    return false
  }
}

export async function postSendWhatsApp(phone: string, message: string): Promise<boolean> {
  const origin = await getInternalOrigin()
  try {
    const res = await fetch(`${origin}/api/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message }),
    })
    if (!res.ok) return false
    const j = await res.json()
    return j.success === true
  } catch {
    return false
  }
}
