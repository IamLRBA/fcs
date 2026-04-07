import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json()
    
    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: 'Phone and message are required' },
        { status: 400 }
      )
    }
    
    // Try WhatsApp Business API (Meta) if configured
    if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: phone.replace(/^whatsapp:/, '').replace(/\+/g, ''),
              type: 'text',
              text: { body: message }
            })
          }
        )
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || 'Failed to send WhatsApp message')
        }
        
        const result = await response.json()
        
        console.log('WhatsApp message sent via Meta Business API:', {
          to: phone,
          messageId: result.messages?.[0]?.id
        })
        
        return NextResponse.json({ 
          success: true, 
          message: 'WhatsApp message sent successfully via Meta Business API',
          messageId: result.messages?.[0]?.id
        })
      } catch (metaError: any) {
        console.warn('Meta Business API failed, trying Green API:', metaError.message)
        // Fall through to Green API
      }
    }
    
    // Try Green API if configured
    if (process.env.GREEN_API_ID_INSTANCE && process.env.GREEN_API_TOKEN_INSTANCE) {
      try {
        // Use custom API URL if provided, otherwise use default format
        const apiBaseUrl = process.env.GREEN_API_URL || `https://${process.env.GREEN_API_ID_INSTANCE}.api.green-api.com`
        const endpoint = `${apiBaseUrl}/waInstance${process.env.GREEN_API_ID_INSTANCE}/sendMessage/${process.env.GREEN_API_TOKEN_INSTANCE}`
        
        // Format phone number for Green API
        // Remove whatsapp: prefix, remove +, remove spaces/dashes, add @c.us if not present
        let phoneNumber = phone.replace(/^whatsapp:/, '').replace(/\+/g, '').replace(/[\s\-\(\)]/g, '')
        const chatId = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chatId: chatId,
            message: message
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.errorMessage || errorData.message || `HTTP ${response.status}: Failed to send WhatsApp message`)
        }
        
        const result = await response.json()
        
        console.log('WhatsApp message sent via Green API:', {
          to: phone,
          idMessage: result.idMessage,
          chatId: chatId
        })
        
        return NextResponse.json({ 
          success: true, 
          message: 'WhatsApp message sent successfully via Green API',
          idMessage: result.idMessage
        })
      } catch (greenError: any) {
        console.error('Green API failed:', greenError.message)
        // Fall through to fallback
      }
    }
    
    // No WhatsApp service configured - log only (or generate WhatsApp Web link)
    console.warn('No WhatsApp service configured. Message will be logged only.')
    console.log('WhatsApp message details:', {
      to: phone,
      messagePreview: message.substring(0, 100) + '...',
      whatsappLink: `https://wa.me/${phone.replace(/^whatsapp:/, '').replace(/\+/g, '')}?text=${encodeURIComponent(message.substring(0, 500))}`
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'WhatsApp message logged (no WhatsApp service configured)',
      note: 'Configure Meta Business API or Green API to send actual messages'
    })
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error)
    
    const errorMessage = error.message || 'Failed to send WhatsApp message'
    const errorCode = error.code || error.status
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        code: errorCode,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

