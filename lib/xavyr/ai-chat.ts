import { buildXavyrSystemPrompt } from '@/lib/xavyr/build-system-prompt'

export type ChatTurn = { role: 'user' | 'assistant'; content: string }

export async function chatWithOpenAI(
  query: string,
  history: ChatTurn[]
): Promise<string | null> {
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
  const text = data.choices?.[0]?.message?.content?.trim()
  return text || null
}

/** Strip em dashes per brand voice */
export function sanitizeXavyrReply(text: string): string {
  return text.replace(/\u2014/g, ',').replace(/\s+,/g, ',').trim()
}
