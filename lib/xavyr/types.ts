export type XavyrLink = {
  label: string
  href: string
}

export type XavyrMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  links?: XavyrLink[]
  timestamp: number
}

export type XavyrResponse = {
  content: string
  links?: XavyrLink[]
  suggestions?: string[]
  /** Used by route to decide if optional AI should run */
  confidence?: 'high' | 'medium' | 'low'
}

export type ConversationMatch = {
  id: string
  patterns: RegExp[]
  responses: string[]
  links?: XavyrLink[]
  suggestions?: string[]
  /** Higher priority wins when multiple pools match */
  priority?: number
}
