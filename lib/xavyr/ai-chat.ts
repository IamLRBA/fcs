export type ChatTurn = { role: 'user' | 'assistant'; content: string }

export { sanitizeXavyrReply, chatWithOptionalAi } from '@/lib/xavyr/ai-providers'
