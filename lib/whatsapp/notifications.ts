import type { Order } from '@/lib/cart'
import { SHOP_EMAIL, SHOP_WHATSAPP_E164 } from '@/lib/constants/brand-contact'

export interface WhatsAppConfig {
  phone: string
  message: string
}

function itemsLines(order: Order): string {
  return order.items
    .map((item, i) => {
      const bits = [`${i + 1}. ${item.name} (${item.sku})`]
      if (item.size) bits.push(`Size ${item.size}`)
      if (item.color) bits.push(item.color)
      bits.push(`Qty ${item.quantity} × UGX ${item.price.toLocaleString()} = UGX ${(item.price * item.quantity).toLocaleString()}`)
      return bits.join(' · ')
    })
    .join('\n')
}

export class WhatsAppNotifications {
  private static BUSINESS_PHONE = SHOP_WHATSAPP_E164

  private static formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/[^\d+]/g, '')
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('0')) cleaned = '+256' + cleaned.substring(1)
      else if (cleaned.startsWith('256')) cleaned = '+' + cleaned
      else cleaned = '+256' + cleaned
    }
    return cleaned
  }

  static customerConfirmation(order: Order, _receiptImage?: string): WhatsAppConfig {
    const message = `MysticalPIECES — order confirmed

Dear ${order.customer.fullName},

Thank you. We have received your order and will prepare it for delivery.

Order ${order.id}
${new Date(order.timestamp).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
Status: ${order.status}

Items:
${itemsLines(order)}

Subtotal UGX ${order.subtotal.toLocaleString()}
Delivery ${order.deliveryFee === 0 ? 'Free' : `UGX ${order.deliveryFee.toLocaleString()}`}
Total (cash on delivery) UGX ${order.total.toLocaleString()}

Deliver to:
${order.customer.address.street}, ${order.customer.address.city}
${order.notes ? `Note: ${order.notes}\n` : ''}
Payment: cash on delivery.

Email: ${SHOP_EMAIL}
WhatsApp: ${this.BUSINESS_PHONE}`

    return {
      phone: this.formatPhoneNumber(order.customer.phone),
      message,
    }
  }

  static businessNotification(order: Order): WhatsAppConfig {
    const message = `MysticalPIECES — new order

Order ${order.id}
${new Date(order.timestamp).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
Status: ${order.status}

Customer:
${order.customer.fullName}
${order.customer.email}
${order.customer.phone}

Delivery:
${order.customer.address.street}, ${order.customer.address.city}
Option: ${order.deliveryOption === 'kampala' ? 'Kampala (no fee)' : `Outside Kampala · fee UGX ${order.deliveryFee.toLocaleString()}`}
${order.notes ? `Note: ${order.notes}\n` : ''}
Items:
${itemsLines(order)}

Subtotal UGX ${order.subtotal.toLocaleString()}
Delivery ${order.deliveryFee === 0 ? 'Free' : `UGX ${order.deliveryFee.toLocaleString()}`}
Total UGX ${order.total.toLocaleString()}`

    return {
      phone: this.BUSINESS_PHONE,
      message,
    }
  }

  static generateWhatsAppLink(config: WhatsAppConfig): string {
    const encodedMessage = encodeURIComponent(config.message)
    return `https://wa.me/${config.phone.replace(/\+/g, '')}?text=${encodedMessage}`
  }

  static async sendWhatsApp(config: WhatsAppConfig): Promise<boolean> {
    try {
      try {
        const response = await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: config.phone, message: config.message }),
        })
        if (response.ok) {
          const result = await response.json()
          console.log('WhatsApp message sent via API:', { to: config.phone, success: result.success })
          return result.success
        }
      } catch {
        console.warn('API route not available, using WhatsApp Web link fallback')
      }
      const whatsappLink = this.generateWhatsAppLink(config)
      console.log('WhatsApp Link (fallback):', whatsappLink)
      return true
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      return false
    }
  }

  /** @deprecated Use server `customerPhoneHasWhatsApp` for accurate checks; client may still call for UX hints. */
  static async isPhoneOnWhatsApp(phone: string): Promise<boolean> {
    const formatted = this.formatPhoneNumber(phone)
    return formatted.length >= 10
  }

  static customerOrderReady(order: Order): WhatsAppConfig {
    const message = `MysticalPIECES

Dear ${order.customer.fullName},

Your order ${order.id} is ready and will be dispatched shortly. Delivery is usually within two to three working days.

Address: ${order.customer.address.street}, ${order.customer.address.city}
Total (cash on delivery): UGX ${order.total.toLocaleString()}

${SHOP_EMAIL}`
    return { phone: this.formatPhoneNumber(order.customer.phone), message }
  }

  static customerOrderProcessing(order: Order): WhatsAppConfig {
    const message = `MysticalPIECES

Dear ${order.customer.fullName},

We have started preparing your order ${order.id}.

Delivery: ${order.customer.address.street}, ${order.customer.address.city}
Total (cash on delivery): UGX ${order.total.toLocaleString()}

We will message you again when the order is ready and when it has been delivered.

${SHOP_EMAIL}`
    return { phone: this.formatPhoneNumber(order.customer.phone), message }
  }

  static customerOrderDelivered(order: Order): WhatsAppConfig {
    const message = `MysticalPIECES

Dear ${order.customer.fullName},

Your order ${order.id} is marked as delivered. We hope you enjoy your pieces.

Thank you for shopping with us.

${SHOP_EMAIL}`
    return { phone: this.formatPhoneNumber(order.customer.phone), message }
  }
}
