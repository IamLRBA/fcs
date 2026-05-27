import { NextResponse } from 'next/server'
import { chatWithOptionalAi, type ChatTurn } from '@/lib/xavyr/ai-chat'
import { pickConversationResponse } from '@/lib/xavyr/conversation-pools'
import { guardrailResponse, isSensitiveQuery } from '@/lib/xavyr/guardrails'
import { respondToQuery } from '@/lib/xavyr/responder'
import type { XavyrResponse } from '@/lib/xavyr/types'

type Body = {
  query?: string
  history?: ChatTurn[]
  recentAssistant?: string[]
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body
    const query = String(body.query ?? '').trim()
    const recent = Array.isArray(body.recentAssistant) ? body.recentAssistant : []
    const history = Array.isArray(body.history) ? body.history.slice(-10) : []
    const historyText = history.map((m) => m.content)

    if (!query) {
      return NextResponse.json({ error: 'Empty query' }, { status: 400 })
    }

    let response: XavyrResponse
    let source: 'local' | 'gemini' | 'groq' | 'openai' = 'local'

    if (isSensitiveQuery(query)) {
      response = guardrailResponse(query, recent)
    } else {
      const conversational = pickConversationResponse(query, recent)
      if (conversational) {
        response = {
          content: conversational.content,
          links: conversational.links,
          suggestions: conversational.suggestions,
          confidence: 'high',
        }
      } else {
        response = respondToQuery(query, recent, historyText)

        if (response.confidence === 'low') {
          const { text, provider } = await chatWithOptionalAi(query, history)
          if (text) {
            response = { content: text }
            source = provider ?? 'local'
          }
        }
      }
    }

    const { confidence: _c, ...payload } = response
    const res = NextResponse.json({ ...payload, source })
    res.headers.set('Cache-Control', 'no-store')
    return res
  } catch (e) {
    console.error('[api/xavyr]', e)
    return NextResponse.json({ error: 'Guide unavailable' }, { status: 500 })
  }
}
