import type { Order } from '@/lib/cart'
import { EmailTemplates } from '@/lib/emails/templates'
import { WhatsAppNotifications } from '@/lib/whatsapp/notifications'
import { postSendEmail, postSendWhatsApp } from '@/lib/server/internal-api'
import { customerPhoneHasWhatsApp } from '@/lib/server/whatsapp-availability'
import { SHOP_EMAIL } from '@/lib/constants/brand-contact'

async function sendShopMirror(template: ReturnType<typeof EmailTemplates.customerOrderProcessing>) {
  try {
    await postSendEmail({
      ...template,
      to: SHOP_EMAIL,
      subject: `[Admin copy] ${template.subject}`,
    })
  } catch (e) {
    console.error('[notifyOrderStatus] seller email', e)
  }
}

export async function notifyOrderProcessing(order: Order): Promise<void> {
  const template = EmailTemplates.customerOrderProcessing(order)
  try {
    await postSendEmail(template)
  } catch (e) {
    console.error('[notifyOrderProcessing] customer email', e)
  }
  await sendShopMirror(template)
  try {
    if (await customerPhoneHasWhatsApp(order.customer.phone)) {
      const wa = WhatsAppNotifications.customerOrderProcessing(order)
      await postSendWhatsApp(wa.phone, wa.message)
    }
  } catch (e) {
    console.error('[notifyOrderProcessing] customer WhatsApp', e)
  }
}

export async function notifyOrderReady(order: Order): Promise<void> {
  const template = EmailTemplates.customerOrderReady(order)
  try {
    await postSendEmail(template)
  } catch (e) {
    console.error('[notifyOrderReady] customer email', e)
  }
  await sendShopMirror(template)
  try {
    if (await customerPhoneHasWhatsApp(order.customer.phone)) {
      const wa = WhatsAppNotifications.customerOrderReady(order)
      await postSendWhatsApp(wa.phone, wa.message)
    }
  } catch (e) {
    console.error('[notifyOrderReady] customer WhatsApp', e)
  }
}

export async function notifyOrderDelivered(order: Order): Promise<void> {
  const template = EmailTemplates.customerOrderDelivered(order)
  try {
    await postSendEmail(template)
  } catch (e) {
    console.error('[notifyOrderDelivered] customer email', e)
  }
  await sendShopMirror(template)
  try {
    if (await customerPhoneHasWhatsApp(order.customer.phone)) {
      const wa = WhatsAppNotifications.customerOrderDelivered(order)
      await postSendWhatsApp(wa.phone, wa.message)
    }
  } catch (e) {
    console.error('[notifyOrderDelivered] customer WhatsApp', e)
  }
}
