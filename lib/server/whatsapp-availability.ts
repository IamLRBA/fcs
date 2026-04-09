/**
 * Server-only: detect WhatsApp registration when Green API is configured.
 * If Green API is not set, returns true so existing deployments keep sending (best effort).
 */
function digitsOnlyInternational(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, '')
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('0')) cleaned = '256' + cleaned.slice(1)
    else if (!cleaned.startsWith('256')) cleaned = '256' + cleaned
  } else {
    cleaned = cleaned.slice(1)
  }
  return cleaned.replace(/\D/g, '')
}

export async function customerPhoneHasWhatsApp(phone: string): Promise<boolean> {
  const id = process.env.GREEN_API_ID_INSTANCE
  const token = process.env.GREEN_API_TOKEN_INSTANCE
  if (!id || !token) {
    return true
  }

  const phoneNumber = digitsOnlyInternational(phone)
  if (phoneNumber.length < 10) return false

  const apiBaseUrl = process.env.GREEN_API_URL || `https://${id}.api.green-api.com`
  const endpoint = `${apiBaseUrl}/waInstance${id}/checkWhatsapp/${token}`

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: parseInt(phoneNumber, 10) }),
    })
    if (!res.ok) return true
    const data = (await res.json()) as { existsWhatsapp?: boolean }
    return data.existsWhatsapp === true
  } catch {
    return true
  }
}
