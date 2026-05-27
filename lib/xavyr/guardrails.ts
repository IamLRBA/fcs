import { ADMIN_GUARDRAIL_RESPONSES, GENERAL_GUARDRAIL_RESPONSES } from '@/lib/xavyr/conversation-pools'

const ADMIN_PATTERNS = [
  /\badmin\b/i,
  /\badministrator\b/i,
  /\/admin/i,
  /\blogin as admin\b/i,
  /\badmin panel\b/i,
  /\badmin dashboard\b/i,
  /\bback[\s-]?office\b/i,
]

const SENSITIVE_PATTERNS = [
  ...ADMIN_PATTERNS,
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
  /\bIamMYSTICAL\b/i,
  /\bMystic@l/i,
]

export function isAdminQuery(query: string): boolean {
  const q = query.trim()
  if (!q) return false
  return ADMIN_PATTERNS.some((re) => re.test(q))
}

export function isSensitiveQuery(query: string): boolean {
  const q = query.trim()
  if (!q) return false
  return SENSITIVE_PATTERNS.some((re) => re.test(q))
}

export function guardrailResponse(
  query: string,
  recent: string[] = []
): { content: string; suggestions: string[] } {
  const pool = isAdminQuery(query) ? ADMIN_GUARDRAIL_RESPONSES : GENERAL_GUARDRAIL_RESPONSES
  const recentSet = new Set(recent.map((r) => r.trim().toLowerCase()))
  const available = pool.filter((r) => !recentSet.has(r.trim().toLowerCase()))
  const list = available.length ? available : pool
  return {
    content: list[Math.floor(Math.random() * list.length)],
    suggestions: ['Browse the shop', 'How checkout works', 'Contact the store'],
  }
}
