import { NextRequest, NextResponse } from 'next/server'
import type { EmailConfig } from '@/lib/emails/templates'
import { SHOP_EMAIL } from '@/lib/constants/brand-contact'

export async function POST(request: NextRequest) {
  try {
    const emailConfig: EmailConfig = await request.json()
    
    // Try SendGrid first if configured
    if (process.env.SENDGRID_API_KEY) {
      try {
        const sgMail = require('@sendgrid/mail')
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        
        const fromEmail = process.env.FROM_EMAIL || SHOP_EMAIL
        const fromName = process.env.FROM_NAME || 'Mystical PIECES'
        
        const attachments = emailConfig.attachment ? [{
          content: emailConfig.attachment.content,
          filename: emailConfig.attachment.filename,
          type: emailConfig.attachment.type,
          disposition: 'attachment'
        }] : []
        
        await sgMail.send({
          to: emailConfig.to,
          from: {
            email: fromEmail,
            name: fromName
          },
          subject: emailConfig.subject,
          text: emailConfig.text,
          html: emailConfig.html,
          attachments
        })
        
        console.log('Email sent via SendGrid:', {
          to: emailConfig.to,
          subject: emailConfig.subject,
          hasAttachment: !!emailConfig.attachment
        })
        
        return NextResponse.json({ success: true, message: 'Email sent successfully via SendGrid' })
      } catch (sendGridError: any) {
        console.warn('SendGrid failed, trying SMTP:', sendGridError.message)
        // Fall through to SMTP
      }
    }
    
    // Try SMTP if configured (Gmail, Outlook, etc.)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const nodemailer = require('nodemailer')
        
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        })
        
        const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER
        const fromName = process.env.FROM_NAME || 'Mystical PIECES'
        
        // Prepare attachments if provided
        const attachments = emailConfig.attachment ? [{
          filename: emailConfig.attachment.filename,
          content: Buffer.from(emailConfig.attachment.content, 'base64'),
          contentType: emailConfig.attachment.type
        }] : []
        
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: emailConfig.to,
          subject: emailConfig.subject,
          text: emailConfig.text,
          html: emailConfig.html,
          attachments
        })
        
        console.log('Email sent via SMTP:', {
          to: emailConfig.to,
          subject: emailConfig.subject,
          hasAttachment: !!emailConfig.attachment
        })
        
        return NextResponse.json({ success: true, message: 'Email sent successfully via SMTP' })
      } catch (smtpError: any) {
        console.error('SMTP failed:', smtpError.message)
        throw smtpError
      }
    }
    
    // No email service configured - log only
    console.warn('No email service configured. Email will be logged only.')
    console.log('Email details:', {
      to: emailConfig.to,
      subject: emailConfig.subject,
      hasAttachment: !!emailConfig.attachment
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email logged (no email service configured)' 
    })
  } catch (error: any) {
    console.error('Error sending email:', error)
    
    const errorMessage = error.message || 'Failed to send email'
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

