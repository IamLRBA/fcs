import type { EmailConfig } from '@/lib/emails/templates'
import { SHOP_EMAIL } from '@/lib/constants/brand-contact'

export type SendEmailOutcome =
  | { ok: true; channel: 'sendgrid' | 'smtp'; message: string }
  | { ok: false; error: string; code: 'NO_PROVIDER' | 'SEND_FAILED' }

/**
 * Send transactional email via SendGrid (if configured), else SMTP, else failure.
 * Used by `/api/send-email` and by server-side order notifications (no HTTP loopback).
 */
export async function sendEmailWithConfig(emailConfig: EmailConfig): Promise<SendEmailOutcome> {
  if (process.env.SENDGRID_API_KEY) {
    try {
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)

      const fromEmail = process.env.FROM_EMAIL || SHOP_EMAIL
      const fromName = process.env.FROM_NAME || 'Mystical PIECES'

      const attachments = emailConfig.attachment
        ? [
            {
              content: emailConfig.attachment.content,
              filename: emailConfig.attachment.filename,
              type: emailConfig.attachment.type,
              disposition: 'attachment' as const,
            },
          ]
        : []

      await sgMail.send({
        to: emailConfig.to,
        from: { email: fromEmail, name: fromName },
        subject: emailConfig.subject,
        text: emailConfig.text,
        html: emailConfig.html,
        attachments,
      })

      return {
        ok: true,
        channel: 'sendgrid',
        message: 'Email sent successfully via SendGrid',
      }
    } catch (sendGridError: unknown) {
      const msg = sendGridError instanceof Error ? sendGridError.message : String(sendGridError)
      console.warn('[sendEmailWithConfig] SendGrid failed, trying SMTP:', msg)
    }
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = require('nodemailer')

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER
      const fromName = process.env.FROM_NAME || 'Mystical PIECES'

      const attachments = emailConfig.attachment
        ? [
            {
              filename: emailConfig.attachment.filename,
              content: Buffer.from(emailConfig.attachment.content, 'base64'),
              contentType: emailConfig.attachment.type,
            },
          ]
        : []

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: emailConfig.to,
        subject: emailConfig.subject,
        text: emailConfig.text,
        html: emailConfig.html,
        attachments,
      })

      return {
        ok: true,
        channel: 'smtp',
        message: 'Email sent successfully via SMTP',
      }
    } catch (smtpError: unknown) {
      const msg = smtpError instanceof Error ? smtpError.message : String(smtpError)
      console.error('[sendEmailWithConfig] SMTP failed:', msg)
      return { ok: false, error: msg, code: 'SEND_FAILED' }
    }
  }

  console.warn(
    '[sendEmailWithConfig] No working email provider: set SENDGRID_API_KEY and/or SMTP_HOST, SMTP_USER, SMTP_PASS (check SendGrid errors above if key is set).'
  )
  console.warn('[sendEmailWithConfig] Would send to:', emailConfig.to, '| subject:', emailConfig.subject)

  return {
    ok: false,
    error:
      'No email provider configured or SendGrid failed with no SMTP fallback. Set SENDGRID_API_KEY or SMTP_* in the deployment environment.',
    code: 'NO_PROVIDER',
  }
}
