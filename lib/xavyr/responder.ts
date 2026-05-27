import {
  DEFAULT_SUGGESTIONS,
  KNOWLEDGE,
  SHOP_CATEGORIES,
  pickKnowledgeAnswer,
} from '@/lib/xavyr/knowledge'
import { pickConversationResponse, FALLBACK_RESPONSES } from '@/lib/xavyr/conversation-pools'
import { guardrailResponse, isSensitiveQuery } from '@/lib/xavyr/guardrails'
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

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are',
  'was', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'we', 'they', 'me',
  'my', 'your', 'our', 'it', 'its', 'what', 'how', 'where', 'when', 'why', 'who', 'please', 'just',
])

function meaningfulTokens(text: string): string[] {
  return tokenize(text).filter((t) => !STOP_WORDS.has(t))
}

function scoreEntry(query: string, tokens: string[], keywords: string[]): number {
  const q = query.toLowerCase()
  let score = 0
  for (const kw of keywords) {
    const k = kw.toLowerCase()
    if (q.includes(k)) score += k.includes(' ') ? 8 : 5
    const kwTokens = tokenize(k)
    for (const kt of kwTokens) {
      if (tokens.includes(kt)) score += 3
      if (tokens.some((t) => t.startsWith(kt) || kt.startsWith(t))) score += 1
    }
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
    hoodie: '/products/coats',
    outerwear: '/products/coats',
    pant: '/products/pants-and-shorts',
    trouser: '/products/pants-and-shorts',
    short: '/products/pants-and-shorts',
    bottom: '/products/pants-and-shorts',
    denim: '/products/pants-and-shorts',
    shoe: '/products/footwear',
    sneaker: '/products/footwear',
    boot: '/products/footwear',
    sandal: '/products/footwear',
    footwear: '/products/footwear',
    accessory: '/products/accessories',
    accessor: '/products/accessories',
    bag: '/products/accessories',
    hat: '/products/accessories',
    belt: '/products/accessories',
  }
  for (const [word, href] of Object.entries(map)) {
    if (q.includes(word)) {
      const cat = SHOP_CATEGORIES.find((c) => c.href === href)
      if (cat) {
        return {
          content: pickVaried(
            [
              `You might like our ${cat.label} collection. Each piece is curated thrift. Most are one of a kind, so availability changes often.`,
              `${cat.label} is a strong place to start. Unique finds rotate frequently, so check back if something sells.`,
              `For ${cat.label.toLowerCase()}, head to that collection. Quick View lets you inspect before you add to cart.`,
            ],
            []
          ),
          links: [cat, { label: 'All collections', href: '/sections/shop' }],
          confidence: 'high',
        }
      }
    }
  }
  return null
}

function followUpHint(query: string, history: string[]): XavyrResponse | null {
  const q = query.toLowerCase()
  const isFollowUp = /^(and|also|more|that|this|it|those|them|same|another|else)\b/i.test(q) || q.length < 20
  if (!isFollowUp || history.length === 0) return null

  const last = history[history.length - 1]?.toLowerCase() ?? ''
  if (last.includes('checkout') || last.includes('order')) {
    return {
      content: pickVaried(
        [
          'For checkout: open Cart, tap Checkout, fill name, email, phone, and address, pick Kampala or Outside Kampala, then confirm.',
          'Next step is usually the Cart page. From there, Checkout collects delivery details and shows your total.',
        ],
        []
      ),
      links: [
        { label: 'Cart', href: '/cart' },
        { label: 'Checkout', href: '/checkout' },
      ],
      confidence: 'medium',
    }
  }
  if (last.includes('deliver') || last.includes('kampala')) {
    return {
      content:
        'Kampala delivery is free. Outside Kampala adds a transport fee you see before confirming. Enter your area clearly at checkout.',
      confidence: 'medium',
    }
  }
  return null
}

export function respondToQuery(
  query: string,
  recentAssistantTexts: string[] = [],
  history: string[] = []
): XavyrResponse {
  const trimmed = query.trim()
  if (!trimmed) {
    return {
      content: 'Ask me anything about shopping, collections, or navigating MysticalPIECES.',
      suggestions: DEFAULT_SUGGESTIONS,
      confidence: 'medium',
    }
  }

  if (isSensitiveQuery(trimmed)) {
    return { ...guardrailResponse(trimmed, recentAssistantTexts), confidence: 'high' }
  }

  const conversational = pickConversationResponse(trimmed, recentAssistantTexts)
  if (conversational) {
    return {
      content: conversational.content,
      links: conversational.links,
      suggestions: conversational.suggestions,
      confidence: 'high',
    }
  }

  const followUp = followUpHint(trimmed, history)
  if (followUp) return followUp

  const tokens = meaningfulTokens(trimmed)
  const scored = KNOWLEDGE.map((entry) => ({
    entry,
    score: scoreEntry(trimmed, tokens, entry.keywords),
  }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)

  const best = scored[0]
  const second = scored[1]

  if (best && best.score >= 5) {
    return {
      content: pickKnowledgeAnswer(best.entry, recentAssistantTexts),
      links: best.entry.links,
      suggestions: best.entry.suggestions,
      confidence: 'high',
    }
  }

  const cat = categoryHint(trimmed)
  if (cat) return cat

  if (best && best.score >= 3) {
    return {
      content: pickKnowledgeAnswer(best.entry, recentAssistantTexts),
      links: best.entry.links,
      suggestions: best.entry.suggestions ?? DEFAULT_SUGGESTIONS,
      confidence: 'medium',
    }
  }

  if (best && second && best.score >= 2 && second.score >= 2) {
    const combined = `${pickKnowledgeAnswer(best.entry, recentAssistantTexts)} ${pickKnowledgeAnswer(second.entry, recentAssistantTexts)}`
    return {
      content: combined.length > 420 ? pickKnowledgeAnswer(best.entry, recentAssistantTexts) : combined,
      links: [...(best.entry.links ?? []), ...(second.entry.links ?? [])].slice(0, 4),
      suggestions: best.entry.suggestions ?? DEFAULT_SUGGESTIONS,
      confidence: 'medium',
    }
  }

  if (best && best.score >= 2) {
    return {
      content: pickKnowledgeAnswer(best.entry, recentAssistantTexts),
      links: best.entry.links,
      suggestions: best.entry.suggestions ?? DEFAULT_SUGGESTIONS,
      confidence: 'medium',
    }
  }

  if (tokens.length >= 2) {
    return {
      content: pickVaried(FALLBACK_RESPONSES, recentAssistantTexts),
      suggestions: DEFAULT_SUGGESTIONS,
      confidence: 'low',
    }
  }

  return {
    content: pickVaried(FALLBACK_RESPONSES, recentAssistantTexts),
    suggestions: DEFAULT_SUGGESTIONS,
    confidence: 'low',
  }
}
