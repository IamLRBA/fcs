import type { Order } from '@/lib/cart'
import { EmailTemplates } from '@/lib/emails/templates'
import { WhatsAppNotifications } from '@/lib/whatsapp/notifications'
import { postSendEmail, postSendWhatsApp } from '@/lib/server/internal-api'
import { customerPhoneHasWhatsApp } from '@/lib/server/whatsapp-availability'

export async function notifyOrderProcessing(order: Order): Promise<void> {
  await postSendEmail(EmailTemplates.customerOrderProcessing(order))
  if (await customerPhoneHasWhatsApp(order.customer.phone)) {
    const wa = WhatsAppNotifications.customerOrderProcessing(order)
    await postSendWhatsApp(wa.phone, wa.message)
  }
}

export async function notifyOrderReady(order: Order): Promise<void> {
  await postSendEmail(EmailTemplates.customerOrderReady(order))
  if (await customerPhoneHasWhatsApp(order.customer.phone)) {
    const wa = WhatsAppNotifications.customerOrderReady(order)
    await postSendWhatsApp(wa.phone, wa.message)
  }
}

export async function notifyOrderDelivered(order: Order): Promise<void> {
  await postSendEmail(EmailTemplates.customerOrderDelivered(order))
  if (await customerPhoneHasWhatsApp(order.customer.phone)) {
    const wa = WhatsAppNotifications.customerOrderDelivered(order)
    await postSendWhatsApp(wa.phone, wa.message)
  }
}
