import { headers } from 'next/headers'
import type { EmailConfig } from '@/lib/emails/templates'

/** Resolve request origin for same-origin API calls from Route Handlers. */
export async function getInternalOrigin(): Promise<string> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? (host?.includes('localhost') ? 'http' : 'https')
  if (host) return `${proto}://${host}`
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}

export async function postSendEmail(config: EmailConfig): Promise<boolean> {
  const origin = await getInternalOrigin()
  try {
    const res = await fetch(`${origin}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    if (!res.ok) return false
    const j = await res.json()
    return j.success === true
  } catch {
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
