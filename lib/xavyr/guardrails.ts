import { GUARDRAIL_RESPONSES } from '@/lib/xavyr/conversation-pools'

const SENSITIVE_PATTERNS = [
  /\badmin\b/i,
  /\badministrator\b/i,
  /\bpassword\b/i,
  /\bcredential/i,
  /\bapi[\s_-]?key/i,
  /\bsecret/i,
  /\bdatabase\b/i,
  /\bprisma\b/i,
  /\benvironment variable/i,
  /\.env\b/i,
  /\bsendgrid\b/i,
  /\bsmtp\b/i,
  /\binternal\b/i,
  /\bconfidential\b/i,
  /\bclassified\b/i,
  /\bemployee\b/i,
  /\bstaff only\b/i,
  /\bwholesale cost\b/i,
  /\bprofit margin\b/i,
  /\bsupplier\b/i,
  /\/admin/i,
  /\blogin as admin\b/i,
  /\bIamMYSTICAL\b/i,
  /\bMystic@l/i,
]

export function isSensitiveQuery(query: string): boolean {
  const q = query.trim()
  if (!q) return false
  return SENSITIVE_PATTERNS.some((re) => re.test(q))
}

export function guardrailResponse(recent: string[] = []): { content: string; suggestions: string[] } {
  const recentSet = new Set(recent.map((r) => r.trim().toLowerCase()))
  const available = GUARDRAIL_RESPONSES.filter((r) => !recentSet.has(r.trim().toLowerCase()))
  const pool = available.length ? available : GUARDRAIL_RESPONSES
  return {
    content: pool[Math.floor(Math.random() * pool.length)],
    suggestions: ['Browse the shop', 'How checkout works', 'Contact the store'],
  }
}
