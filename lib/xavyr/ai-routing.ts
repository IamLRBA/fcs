import { isComplexFashionQuery, isGeneralKnowledgeQuery } from '@/lib/xavyr/query-normalize'
import type { XavyrResponse } from '@/lib/xavyr/types'

export function shouldUseAiBoost(query: string, local: XavyrResponse): boolean {
  if (local.confidence === 'low') return true
  if (isGeneralKnowledgeQuery(query)) return true
  if (isComplexFashionQuery(query)) return true
  if (local.confidence === 'medium' && query.trim().split(/\s+/).length >= 3) return true
  return false
}
