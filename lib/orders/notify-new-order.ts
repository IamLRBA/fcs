import type { Order } from '@/lib/cart'
import { EmailTemplates } from '@/lib/emails/templates'
import { postSendEmail, postSendWhatsApp } from '@/lib/server/internal-api'
import { customerPhoneHasWhatsApp } from '@/lib/server/whatsapp-availability'
import { WhatsAppNotifications } from '@/lib/whatsapp/notifications'

/**
 * Fires immediately after an order is persisted (API). Shop gets the same order summary
 * email as the customer (minus receipt). WhatsApp to business always; to customer only if
 * the number registers on WhatsApp (Green API when configured).
 */
export async function notifyNewOrderPlaced(order: Order): Promise<void> {
  try {
    await postSendEmail(EmailTemplates.sellerNotification(order))
  } catch (e) {
    console.error('[notifyNewOrderPlaced] seller email', e)
  }

  try {
    await postSendEmail(EmailTemplates.buyerConfirmation(order))
  } catch (e) {
    console.error('[notifyNewOrderPlaced] buyer email', e)
  }

  try {
    const biz = WhatsAppNotifications.businessNotification(order)
    await postSendWhatsApp(biz.phone, biz.message)
  } catch (e) {
    console.error('[notifyNewOrderPlaced] business WhatsApp', e)
  }

  try {
    const onWa = await customerPhoneHasWhatsApp(order.customer.phone)
    if (onWa) {
      const cust = WhatsAppNotifications.customerConfirmation(order)
      await postSendWhatsApp(cust.phone, cust.message)
    }
  } catch (e) {
    console.error('[notifyNewOrderPlaced] customer WhatsApp', e)
  }
}
