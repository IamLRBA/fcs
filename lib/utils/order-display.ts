import type { Order } from '@/lib/cart'

/** Human-friendly receipt label: customer name + phone (avoids long opaque order IDs in UI). */
export function formatOrderReceiptDisplayName(order: Order): string {
  const name = order.customer?.fullName?.trim() || 'Customer'
  const phone = (order.customer?.phone || '').replace(/\s+/g, ' ').trim()
  return phone ? `${name} · ${phone}` : name
}
