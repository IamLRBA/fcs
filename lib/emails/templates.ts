import type { Order } from '@/lib/cart'
import { SHOP_EMAIL } from '@/lib/constants/brand-contact'

export interface EmailConfig {
  to: string
  subject: string
  html: string
  text: string
  attachment?: {
    filename: string
    content: string
    type: string
  }
}

/** MysticalPIECES palette — matches site primary / paper tones */
const C = {
  primary: '#6F4E37',
  accent: '#8B7A5A',
  text: '#2C2825',
  muted: '#5C534C',
  border: '#D4C4B0',
  paper: '#FAF7F3',
  white: '#FFFFFF',
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatOrderDate(ts: string): string {
  return new Date(ts).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function orderItemsAndTotalsHtml(order: Order): string {
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${C.border};vertical-align:top;">
          <div style="font-weight:600;color:${C.text};">${esc(item.name)}</div>
          <div style="font-size:13px;color:${C.muted};margin-top:4px;">${esc(item.sku)}${item.size ? ` · Size ${esc(item.size)}` : ''}${item.color ? ` · ${esc(item.color)}` : ''}</div>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${C.border};text-align:right;white-space:nowrap;color:${C.text};">${item.quantity} × UGX ${item.price.toLocaleString()}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${C.border};text-align:right;white-space:nowrap;font-weight:600;color:${C.primary};">UGX ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>`
    )
    .join('')

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr>
          <th align="left" style="padding:8px 0;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${C.muted};border-bottom:2px solid ${C.primary};">Item</th>
          <th align="right" style="padding:8px 0;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${C.muted};border-bottom:2px solid ${C.primary};">Qty / unit</th>
          <th align="right" style="padding:8px 0;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${C.muted};border-bottom:2px solid ${C.primary};">Line</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:15px;color:${C.text};">
      <tr><td style="padding:6px 0;">Subtotal</td><td align="right">UGX ${order.subtotal.toLocaleString()}</td></tr>
      <tr><td style="padding:6px 0;">Delivery</td><td align="right">${order.deliveryFee === 0 ? 'Free' : `UGX ${order.deliveryFee.toLocaleString()}`}</td></tr>
      <tr><td style="padding:12px 0 0;font-weight:700;font-size:17px;color:${C.primary};">Total (cash on delivery)</td><td align="right" style="padding:12px 0 0;font-weight:700;font-size:17px;color:${C.primary};">UGX ${order.total.toLocaleString()}</td></tr>
    </table>`
}

function deliveryBlockHtml(order: Order): string {
  return `
    <div style="margin-top:20px;padding:16px;background:${C.paper};border-left:3px solid ${C.primary};">
      <div style="font-size:12px;letter-spacing:0.05em;text-transform:uppercase;color:${C.muted};margin-bottom:8px;">Delivery</div>
      <div style="color:${C.text};line-height:1.5;">${esc(order.customer.fullName)}<br>${esc(order.customer.phone)}<br>${esc(order.customer.address.street)}<br>${esc(order.customer.address.city)}</div>
      ${order.notes ? `<p style="margin:12px 0 0;color:${C.muted};font-size:14px;"><strong style="color:${C.text};">Note:</strong> ${esc(order.notes)}</p>` : ''}
    </div>`
}

function wrapEmail(title: string, lead: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:24px 16px;background:#E8E2DA;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:560px;margin:0 auto;background:${C.white};border:1px solid ${C.border};">
    <div style="padding:24px 28px 8px;border-bottom:1px solid ${C.border};">
      <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${C.accent};">MysticalPIECES</div>
      <h1 style="margin:12px 0 0;font-size:22px;font-weight:600;color:${C.primary};font-family:Georgia,serif;">${title}</h1>
    </div>
    <div style="padding:24px 28px 32px;color:${C.text};font-size:15px;line-height:1.6;">
      ${lead}
      ${bodyHtml}
      <p style="margin-top:28px;font-size:14px;color:${C.muted};">Questions? Reply to this email or write to ${SHOP_EMAIL}.</p>
    </div>
    <div style="padding:16px 28px;background:${C.paper};border-top:1px solid ${C.border};font-size:12px;color:${C.muted};line-height:1.5;">
      MysticalPIECES · Mystical Thrift Fashion<br>
      ${SHOP_EMAIL}
    </div>
  </div>
</body>
</html>`
}

export class EmailTemplates {
  static buyerConfirmation(order: Order, receiptImage?: string): EmailConfig {
    const subject = `Order confirmed — ${order.id} — MysticalPIECES`
    const lead = `<p style="margin:0 0 16px;">Dear ${esc(order.customer.fullName)},</p>
      <p style="margin:0 0 16px;">Thank you for your order. We have received it and will prepare it for delivery. A summary is below.</p>`

    const body = `
      <p style="margin:0 0 8px;"><strong>Order</strong> ${esc(order.id)} · ${formatOrderDate(order.timestamp)} · ${esc(order.status)}</p>
      ${orderItemsAndTotalsHtml(order)}
      ${deliveryBlockHtml(order)}
      <p style="margin:20px 0 0;font-size:14px;color:${C.muted};">Payment is cash on delivery. We will email you again when the order moves to the next stage.</p>`

    const html = wrapEmail('Order confirmation', lead, body)
    const text = `Dear ${order.customer.fullName},

Thank you for your order. We have received it and will prepare it for delivery.

Order ${order.id} · ${formatOrderDate(order.timestamp)} · ${order.status}

Items:
${order.items.map((i) => `- ${i.name} (${i.sku}) qty ${i.quantity} — UGX ${(i.price * i.quantity).toLocaleString()}`).join('\n')}

Subtotal UGX ${order.subtotal.toLocaleString()}
Delivery ${order.deliveryFee === 0 ? 'Free' : `UGX ${order.deliveryFee.toLocaleString()}`}
Total (COD) UGX ${order.total.toLocaleString()}

Deliver to:
${order.customer.fullName}
${order.customer.phone}
${order.customer.address.street}
${order.customer.address.city}
${order.notes ? `\nNote: ${order.notes}` : ''}

MysticalPIECES · ${SHOP_EMAIL}`

    const emailConfig: EmailConfig = {
      to: order.customer.email,
      subject,
      html: html.trim(),
      text: text.trim(),
    }
    if (receiptImage) {
      emailConfig.attachment = {
        filename: `receipt-${order.id}.png`,
        content: receiptImage,
        type: 'image/png',
      }
    }
    return emailConfig
  }

  /** Second touch: receipt image only (after order API already sent confirmation). */
  static buyerReceiptAttachment(order: Order, receiptImage: string): EmailConfig {
    const subject = `Your receipt — ${order.id} — MysticalPIECES`
    const lead = `<p style="margin:0 0 16px;">Dear ${esc(order.customer.fullName)},</p>
      <p style="margin:0 0 16px;">Please find your order receipt attached as a PNG image. Keep it for your records.</p>`
    const body = `<p style="margin:0;color:${C.muted};font-size:14px;">Order ${esc(order.id)} · Total UGX ${order.total.toLocaleString()} (cash on delivery).</p>`
    return {
      to: order.customer.email,
      subject,
      html: wrapEmail('Receipt', lead, body).trim(),
      text: `Dear ${order.customer.fullName},

Your receipt for order ${order.id} is attached (PNG). Total UGX ${order.total.toLocaleString()} (cash on delivery).

MysticalPIECES · ${SHOP_EMAIL}`.trim(),
      attachment: {
        filename: `receipt-${order.id}.png`,
        content: receiptImage,
        type: 'image/png',
      },
    }
  }

  static sellerNotification(order: Order): EmailConfig {
    const subject = `New order — ${order.id} — MysticalPIECES`
    const lead = `<p style="margin:0 0 16px;">A new order has been placed on the store.</p>`

    const body = `
      <p style="margin:0 0 8px;"><strong>Order</strong> ${esc(order.id)} · ${formatOrderDate(order.timestamp)} · ${esc(order.status)}</p>
      <div style="margin:16px 0;padding:16px;background:${C.paper};border-left:3px solid ${C.primary};">
        <div style="font-size:12px;letter-spacing:0.05em;text-transform:uppercase;color:${C.muted};margin-bottom:8px;">Customer</div>
        <div style="color:${C.text};">${esc(order.customer.fullName)}<br>${esc(order.customer.email)}<br>${esc(order.customer.phone)}</div>
      </div>
      ${orderItemsAndTotalsHtml(order)}
      <div style="margin-top:16px;padding:16px;background:${C.paper};border-left:3px solid ${C.accent};">
        <div style="font-size:12px;color:${C.muted};margin-bottom:6px;">Delivery option</div>
        <div style="color:${C.text};">${order.deliveryOption === 'kampala' ? 'Kampala (no delivery fee)' : `Outside Kampala · fee UGX ${order.deliveryFee.toLocaleString()}`}</div>
        <div style="margin-top:12px;font-size:12px;color:${C.muted};">Address</div>
        <div style="color:${C.text};">${esc(order.customer.address.street)}<br>${esc(order.customer.address.city)}</div>
        ${order.notes ? `<p style="margin:12px 0 0;font-size:14px;"><strong>Note:</strong> ${esc(order.notes)}</p>` : ''}
      </div>`

    const html = wrapEmail('New order', lead, body)
    const text = `New order ${order.id} · ${formatOrderDate(order.timestamp)} · ${order.status}

Customer:
${order.customer.fullName}
${order.customer.email}
${order.customer.phone}

${order.items.map((i) => `- ${i.name} (${i.sku}) qty ${i.quantity} — UGX ${(i.price * i.quantity).toLocaleString()}`).join('\n')}

Subtotal UGX ${order.subtotal.toLocaleString()}
Delivery ${order.deliveryFee === 0 ? 'Free' : `UGX ${order.deliveryFee.toLocaleString()}`}
Total UGX ${order.total.toLocaleString()}

${order.customer.address.street}, ${order.customer.address.city}
${order.notes ? `Note: ${order.notes}` : ''}`

    return { to: SHOP_EMAIL, subject, html: html.trim(), text: text.trim() }
  }

  static customerOrderProcessing(order: Order): EmailConfig {
    const subject = `Order in progress — ${order.id} — MysticalPIECES`
    const lead = `<p style="margin:0 0 16px;">Dear ${esc(order.customer.fullName)},</p>
      <p style="margin:0 0 16px;">We have started preparing your order. It is now in progress.</p>`
    const body = `
      <p style="margin:0;">Order <strong>${esc(order.id)}</strong></p>
      ${deliveryBlockHtml(order)}
      <p style="margin:16px 0 0;">Total due on delivery: <strong>UGX ${order.total.toLocaleString()}</strong></p>
      <p style="margin:16px 0 0;font-size:14px;color:${C.muted};">We will write again when the order is ready to go out, and once it has been delivered.</p>`
    return {
      to: order.customer.email,
      subject,
      html: wrapEmail('Order in progress', lead, body).trim(),
      text: `Dear ${order.customer.fullName},

We have started preparing your order ${order.id}. It is now in progress.

Delivery:
${order.customer.address.street}, ${order.customer.address.city}

Total (COD): UGX ${order.total.toLocaleString()}

We will notify you when the order is ready and when it is delivered.

MysticalPIECES · ${SHOP_EMAIL}`.trim(),
    }
  }

  static customerOrderReady(order: Order): EmailConfig {
    const subject = `Order ready — ${order.id} — MysticalPIECES`
    const lead = `<p style="margin:0 0 16px;">Dear ${esc(order.customer.fullName)},</p>
      <p style="margin:0 0 16px;">Your order is ready and will be dispatched shortly. Delivery usually follows within two to three working days.</p>`
    const body = `
      <p style="margin:0;">Order <strong>${esc(order.id)}</strong></p>
      ${deliveryBlockHtml(order)}
      <p style="margin:16px 0 0;">Amount due on delivery: <strong>UGX ${order.total.toLocaleString()}</strong> (cash on delivery).</p>`
    return {
      to: order.customer.email,
      subject,
      html: wrapEmail('Order ready', lead, body).trim(),
      text: `Dear ${order.customer.fullName},

Your order ${order.id} is ready and will be dispatched shortly. Expect delivery within two to three working days.

${order.customer.address.street}, ${order.customer.address.city}

Total (COD): UGX ${order.total.toLocaleString()}

MysticalPIECES · ${SHOP_EMAIL}`.trim(),
    }
  }

  static customerOrderDelivered(order: Order): EmailConfig {
    const subject = `Delivered — ${order.id} — MysticalPIECES`
    const lead = `<p style="margin:0 0 16px;">Dear ${esc(order.customer.fullName)},</p>
      <p style="margin:0 0 16px;">Your order has been marked as delivered. We hope you enjoy your pieces.</p>`
    const body = `<p style="margin:0;">Order <strong>${esc(order.id)}</strong></p>
      <p style="margin:16px 0 0;font-size:14px;color:${C.muted};">Thank you for shopping with us. We would be glad to see you again on the store.</p>`
    return {
      to: order.customer.email,
      subject,
      html: wrapEmail('Delivered', lead, body).trim(),
      text: `Dear ${order.customer.fullName},

Your order ${order.id} has been marked as delivered. We hope you enjoy your pieces.

Thank you for shopping with MysticalPIECES.

${SHOP_EMAIL}`.trim(),
    }
  }

  static async sendEmail(config: EmailConfig): Promise<boolean> {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to send email:', error)
        return false
      }
      const result = await response.json()
      console.log('Email sent successfully:', { to: config.to, subject: config.subject })
      return result.success
    } catch (error) {
      console.error('Error sending email:', error)
      console.log('Email details (manual send):', {
        to: config.to,
        subject: config.subject,
        textPreview: config.text.substring(0, 100) + '...',
      })
      return false
    }
  }
}
