import { NextResponse } from 'next/server'
import { chatWithOpenAI, sanitizeXavyrReply, type ChatTurn } from '@/lib/xavyr/ai-chat'
import { pickConversationResponse, FALLBACK_RESPONSES } from '@/lib/xavyr/conversation-pools'
import { guardrailResponse, isSensitiveQuery } from '@/lib/xavyr/guardrails'
import { respondToQuery } from '@/lib/xavyr/responder'
import type { XavyrResponse } from '@/lib/xavyr/types'

type Body = {
  query?: string
  history?: ChatTurn[]
  recentAssistant?: string[]
}

function pickVaried(pool: string[], recent: string[]): string {
  const recentSet = new Set(recent.map((r) => r.trim().toLowerCase()))
  const available = pool.filter((r) => !recentSet.has(r.trim().toLowerCase()))
  const list = available.length ? available : pool
  return list[Math.floor(Math.random() * list.length)]
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body
    const query = String(body.query ?? '').trim()
    const recent = Array.isArray(body.recentAssistant) ? body.recentAssistant : []
    const history = Array.isArray(body.history) ? body.history.slice(-10) : []

    if (!query) {
      return NextResponse.json({ error: 'Empty query' }, { status: 400 })
    }

    let response: XavyrResponse

    if (isSensitiveQuery(query)) {
      response = guardrailResponse(query, recent)
    } else {
      const conversational = pickConversationResponse(query, recent)
      if (conversational) {
        response = {
          content: conversational.content,
          links: conversational.links,
          suggestions: conversational.suggestions,
        }
      } else {
        const aiEnabled = process.env.XAVYR_AI_ENABLED === '1' || Boolean(process.env.OPENAI_API_KEY)
        let aiText: string | null = null

        if (aiEnabled) {
          aiText = await chatWithOpenAI(query, history)
        }

        if (aiText) {
          response = { content: sanitizeXavyrReply(aiText) }
        } else {
          const local = respondToQuery(query, recent)
          if (local.content.includes('not sure I caught')) {
            local.content = pickVaried(FALLBACK_RESPONSES, recent)
          }
          response = local
        }
      }
    }

    const res = NextResponse.json({ ...response, source: process.env.OPENAI_API_KEY ? 'hybrid' : 'local' })
    res.headers.set('Cache-Control', 'no-store')
    return res
  } catch (e) {
    console.error('[api/xavyr]', e)
    return NextResponse.json({ error: 'Guide unavailable' }, { status: 500 })
  }
}
