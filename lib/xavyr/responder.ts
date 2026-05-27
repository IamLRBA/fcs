import {
  DEFAULT_SUGGESTIONS,
  KNOWLEDGE,
  SHOP_CATEGORIES,
  pickKnowledgeAnswer,
} from '@/lib/xavyr/knowledge'
import {
  pickConversationResponse,
  GUARDRAIL_RESPONSES,
  FALLBACK_RESPONSES,
} from '@/lib/xavyr/conversation-pools'
import { isSensitiveQuery } from '@/lib/xavyr/guardrails'
import type { XavyrResponse } from '@/lib/xavyr/types'

function pickVaried(pool: string[], recent: string[]): string {
  const recentSet = new Set(recent.map((r) => r.trim().toLowerCase()))
  const available = pool.filter((r) => !recentSet.has(r.trim().toLowerCase()))
  const list = available.length ? available : pool
  return list[Math.floor(Math.random() * list.length)]
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1)
}

function scoreEntry(query: string, tokens: string[], keywords: string[]): number {
  const q = query.toLowerCase()
  let score = 0
  for (const kw of keywords) {
    const k = kw.toLowerCase()
    if (q.includes(k)) score += k.includes(' ') ? 6 : 4
    if (tokens.some((t) => k.includes(t) || t.includes(k))) score += 2
  }
  return score
}

function categoryHint(query: string): XavyrResponse | null {
  const q = query.toLowerCase()
  const map: Record<string, string> = {
    shirt: '/products/shirts',
    tee: '/products/tees',
    't-shirt': '/products/tees',
    coat: '/products/coats',
    jacket: '/products/coats',
    outerwear: '/products/coats',
    pant: '/products/pants-and-shorts',
    short: '/products/pants-and-shorts',
    bottom: '/products/pants-and-shorts',
    shoe: '/products/footwear',
    sneaker: '/products/footwear',
    boot: '/products/footwear',
    sandal: '/products/footwear',
    accessory: '/products/accessories',
    accessor: '/products/accessories',
  }
  for (const [word, href] of Object.entries(map)) {
    if (q.includes(word)) {
      const cat = SHOP_CATEGORIES.find((c) => c.href === href)
      if (cat) {
        return {
          content: `You might like our ${cat.label} collection. Each piece is curated thrift. Most are one of a kind, so availability changes often.`,
          links: [cat, { label: 'All collections', href: '/sections/shop' }],
        }
      }
    }
  }
  return null
}

export function respondToQuery(query: string, recentAssistantTexts: string[] = []): XavyrResponse {
  const trimmed = query.trim()
  if (!trimmed) {
    return {
      content: 'Ask me anything about shopping, collections, or navigating MysticalPIECES.',
      suggestions: DEFAULT_SUGGESTIONS,
    }
  }

  if (isSensitiveQuery(trimmed)) {
    return {
      content: pickVaried(GUARDRAIL_RESPONSES, recentAssistantTexts),
      suggestions: ['Browse collections', 'How do I order?', 'Contact the store'],
    }
  }

  const conversational = pickConversationResponse(trimmed, recentAssistantTexts)
  if (conversational) {
    return {
      content: conversational.content,
      links: conversational.links,
      suggestions: conversational.suggestions,
    }
  }

  const tokens = tokenize(trimmed)
  let best = { score: 0, entry: KNOWLEDGE[0] }

  for (const entry of KNOWLEDGE) {
    const score = scoreEntry(trimmed, tokens, entry.keywords)
    if (score > best.score) best = { score, entry }
  }

  if (best.score >= 4) {
    return {
      content: pickKnowledgeAnswer(best.entry, recentAssistantTexts),
      links: best.entry.links,
      suggestions: best.entry.suggestions,
    }
  }

  const cat = categoryHint(trimmed)
  if (cat) return cat

  if (best.score >= 2) {
    return {
      content: pickKnowledgeAnswer(best.entry, recentAssistantTexts),
      links: best.entry.links,
      suggestions: best.entry.suggestions ?? DEFAULT_SUGGESTIONS,
    }
  }

  return {
    content: pickVaried(FALLBACK_RESPONSES, recentAssistantTexts),
    suggestions: DEFAULT_SUGGESTIONS,
  }
}
