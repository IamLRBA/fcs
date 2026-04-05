import type { Order } from '@/lib/cart'
import { EmailTemplates } from '@/lib/emails/templates'
import { WhatsAppNotifications } from '@/lib/whatsapp/notifications'
import { postSendEmail, postSendWhatsApp } from '@/lib/server/internal-api'

export async function notifyOrderReady(order: Order): Promise<void> {
  await postSendEmail(EmailTemplates.customerOrderReady(order))
  const wa = WhatsAppNotifications.customerOrderReady(order)
  await postSendWhatsApp(wa.phone, wa.message)
}

export async function notifyOrderDelivered(order: Order): Promise<void> {
  await postSendEmail(EmailTemplates.customerOrderDelivered(order))
  const wa = WhatsAppNotifications.customerOrderDelivered(order)
  await postSendWhatsApp(wa.phone, wa.message)
}
