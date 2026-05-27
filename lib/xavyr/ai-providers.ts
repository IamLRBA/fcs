import { buildXavyrSystemPrompt } from '@/lib/xavyr/build-system-prompt'
import type { ChatTurn } from '@/lib/xavyr/ai-chat'

/** Strip em dashes per brand voice */
export function sanitizeXavyrReply(text: string): string {
  return text.replace(/\u2014/g, ',').replace(/\s+,/g, ',').trim()
}

async function chatWithOpenAI(query: string, history: ChatTurn[]): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) return null

  const model = process.env.XAVYR_OPENAI_MODEL?.trim() || 'gpt-4o-mini'
  const system = buildXavyrSystemPrompt()

  const messages = [
    { role: 'system' as const, content: system },
    ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: query },
  ]

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 400,
      temperature: 0.65,
    }),
  })

  if (!res.ok) {
    console.error('[xavyr/ai] OpenAI error', res.status, await res.text().catch(() => ''))
    return null
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  return data.choices?.[0]?.message?.content?.trim() || null
}

/** Google AI Studio free tier — https://aistudio.google.com/apikey */
async function chatWithGemini(query: string, history: ChatTurn[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return null

  const model = process.env.XAVYR_GEMINI_MODEL?.trim() || 'gemini-2.0-flash'
  const system = buildXavyrSystemPrompt()

  const contents = [
    ...history.slice(-8).map((m) => ({
      role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: m.content }],
    })),
    { role: 'user' as const, parts: [{ text: query }] },
  ]

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { maxOutputTokens: 400, temperature: 0.65 },
      }),
    }
  )

  if (!res.ok) {
    console.error('[xavyr/ai] Gemini error', res.status, await res.text().catch(() => ''))
    return null
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
}

/** Groq free tier — https://console.groq.com */
async function chatWithGroq(query: string, history: ChatTurn[]): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) return null

  const model = process.env.XAVYR_GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile'
  const system = buildXavyrSystemPrompt()

  const messages = [
    { role: 'system' as const, content: system },
    ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: query },
  ]

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 400,
      temperature: 0.65,
    }),
  })

  if (!res.ok) {
    console.error('[xavyr/ai] Groq error', res.status, await res.text().catch(() => ''))
    return null
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  return data.choices?.[0]?.message?.content?.trim() || null
}

export type AiProvider = 'gemini' | 'groq' | 'openai'

/**
 * Optional cloud AI — only runs when local guide confidence is low.
 * Tries free providers (Gemini, Groq) before paid OpenAI (requires XAVYR_USE_OPENAI=1).
 */
export async function chatWithOptionalAi(
  query: string,
  history: ChatTurn[]
): Promise<{ text: string | null; provider: AiProvider | null }> {
  const tryOpenAI = process.env.XAVYR_USE_OPENAI === '1' && Boolean(process.env.OPENAI_API_KEY?.trim())
  const order: Array<{ id: AiProvider; fn: () => Promise<string | null> }> = [
    { id: 'gemini', fn: () => chatWithGemini(query, history) },
    { id: 'groq', fn: () => chatWithGroq(query, history) },
  ]
  if (tryOpenAI) {
    order.push({ id: 'openai', fn: () => chatWithOpenAI(query, history) })
  }

  for (const { id, fn } of order) {
    const text = await fn()
    if (text) return { text: sanitizeXavyrReply(text), provider: id }
  }

  return { text: null, provider: null }
}
