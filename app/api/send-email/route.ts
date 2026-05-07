import { NextRequest, NextResponse } from 'next/server'
import type { EmailConfig } from '@/lib/emails/templates'
import { sendEmailWithConfig } from '@/lib/emails/send-with-providers'

export async function POST(request: NextRequest) {
  try {
    const emailConfig: EmailConfig = await request.json()
    const outcome = await sendEmailWithConfig(emailConfig)

    if (!outcome.ok) {
      const status = outcome.code === 'NO_PROVIDER' ? 503 : 500
      return NextResponse.json(
        {
          success: false,
          error: outcome.error,
        },
        { status }
      )
    }

    return NextResponse.json({
      success: true,
      message: outcome.message,
      channel: outcome.channel,
    })
  } catch (error: unknown) {
    console.error('[api/send-email]', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email'
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
