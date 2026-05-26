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

export function guardrailResponse(): { content: string; suggestions: string[] } {
  return {
    content:
      "I can't share admin, internal, or confidential information. I'm here for public shopping help — browsing the catalog, cart, checkout, delivery, and general site questions.",
    suggestions: ['Browse the shop', 'How checkout works', 'Contact the store'],
  }
}
