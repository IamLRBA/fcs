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
}
