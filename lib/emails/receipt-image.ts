/** Stable Content-ID for inline receipt images (must match HTML `cid:` references). */
export const RECEIPT_INLINE_CID = 'receipt@mysticalpieces'

/**
 * html2canvas returns a data URL; email providers need raw base64 (no `data:image/...` prefix).
 */
export function dataUrlToRawBase64(dataUrl: string): string {
  const trimmed = dataUrl.trim()
  const match = /^data:image\/[a-z+]+;base64,(.+)$/i.exec(trimmed)
  if (match?.[1]) return match[1].replace(/\s/g, '')
  if (!trimmed.startsWith('data:')) return trimmed.replace(/\s/g, '')
  throw new Error('Invalid receipt image data')
}

export function receiptMimeFromDataUrl(dataUrl: string): 'image/png' | 'image/jpeg' {
  if (/^data:image\/jpe?g/i.test(dataUrl.trim())) return 'image/jpeg'
  return 'image/png'
}

export function receiptFilename(orderId: string, mime: 'image/png' | 'image/jpeg'): string {
  const ext = mime === 'image/jpeg' ? 'jpg' : 'png'
  return `receipt-${orderId}.${ext}`
}
