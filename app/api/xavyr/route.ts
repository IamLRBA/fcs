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

    const lower = query.toLowerCase()
    const looksLikeGeneralGeo =
      /^\s*where\s+is\s+[a-z][a-z\s-]{2,}\s*\??\s*$/i.test(query) &&
      !/(shop|cart|checkout|account|login|contact|delivery|kampala|mysticalpieces|product|products|shirts|tees|outerwear|bottoms|footwear|accessories)/i.test(
        query
      )

    if (isSensitiveQuery(query)) {
      response = guardrailResponse(query, recent)
    } else if (looksLikeGeneralGeo && !lower.includes('uganda')) {
      // General knowledge like "where is Kenya" should use the free AI boost when available
      const { text, provider } = await chatWithOptionalAi(query, history)
      if (text) {
        response = { content: text }
        source = provider ?? 'local'
      } else {
        response = {
          content:
            'Kenya is in East Africa. If you want, I can also help with MysticalPIECES: collections, checkout, delivery, and where to find pages.',
          suggestions: ['Browse collections', 'How do I order?', 'Contact the store'],
          confidence: 'medium',
        }
      }
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

        const wantsMoreHelp =
          response.confidence === 'low' ||
          (response.confidence === 'medium' && query.trim().split(/\s+/).length >= 4)

        if (wantsMoreHelp) {
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
