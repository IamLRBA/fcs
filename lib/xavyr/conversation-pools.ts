import type { ConversationMatch, XavyrLink } from '@/lib/xavyr/types'
import { DEFAULT_SUGGESTIONS } from '@/lib/xavyr/knowledge'
import { BANTER_POOLS } from '@/lib/xavyr/conversation-banter'

export type { ConversationMatch } from '@/lib/xavyr/types'

function pickFromPool(responses: string[], recent: string[]): string {
  const recentSet = new Set(recent.map((r) => r.trim().toLowerCase()))
  const available = responses.filter((r) => !recentSet.has(r.trim().toLowerCase()))
  const pool = available.length > 0 ? available : responses
  return pool[Math.floor(Math.random() * pool.length)]
}

export function pickConversationResponse(
  query: string,
  recentAssistantTexts: string[] = []
): { id: string; content: string; links?: XavyrLink[]; suggestions?: string[] } | null {
  const q = query.trim()
  if (!q) return null

  let best: { match: ConversationMatch; priority: number } | null = null

  for (const match of ALL_CONVERSATION_POOLS) {
    if (match.patterns.some((re) => re.test(q))) {
      const priority = match.priority ?? 0
      if (!best || priority > best.priority) {
        best = { match, priority }
      }
    }
  }

  if (!best) return null

  return {
    id: best.match.id,
    content: pickFromPool(best.match.responses, recentAssistantTexts),
    links: best.match.links,
    suggestions: best.match.suggestions,
  }
}

export const CONVERSATION_POOLS: ConversationMatch[] = [
  {
    id: 'name',
    priority: 14,
    patterns: [
      /^what('?s|\s+is)\s+your\s+name[\s!.?]*$/i,
      /^your\s+name[\s!.?]*$/i,
      /^what\s+is\s+ur\s+name[\s!.?]*$/i,
      /^who\s+are\s+you\s+called[\s!.?]*$/i,
    ],
    responses: [
      'My name is Xavyr.',
      'Xavyr.',
      'I am Xavyr, your MysticalPIECES site guide.',
      'Xavyr here. How can I help?',
    ],
    suggestions: DEFAULT_SUGGESTIONS,
  },
  {
    id: 'where-located',
    priority: 14,
    patterns: [
      /\bwhere\s+are\s+you\s+(located|based)\b/i,
      /\bwhere\s+are\s+you\s+guys\s+(located|based)\b/i,
      /\bwhere\s+can\s+i\s+find\s+you\b/i,
      /\bwhere\s+can\s+i\s+find\s+you\s+guys\b/i,
      /\bwhere\s+do\s+i\s+find\s+you\b/i,
      /\bwhere\s+are\s+you\s+found\b/i,
      /\byour\s+location\b/i,
      /\baddress\b/i,
      /\bcontact\s+you\b/i,
      /\bhow\s+can\s+i\s+reach\s+you\b/i,
    ],
    responses: [
      'MysticalPIECES is based in Kampala, Uganda. You can also reach the team via the Contact section, WhatsApp, or email.',
      'We operate from Kampala, Uganda. If you want to reach us quickly, use the Contact section or WhatsApp.',
      'You can find contact options on the home page Contact section. We are based in Kampala, Uganda.',
      'Kampala, Uganda. For direct help, use WhatsApp or email from the Contact section.',
    ],
    links: [
      { label: 'Contact', href: '/#contact' },
      { label: 'About Us', href: '/about-us' },
    ],
    suggestions: ['Contact the store', 'Delivery & payment', 'Browse collections'],
  },
  {
    id: 'catalog-what-products',
    priority: 13,
    patterns: [
      /\bwhat\s+products\s+do\s+you\s+(have|sell|stock)\b/i,
      /\bwhat\s+do\s+you\s+sell\b/i,
      /\bwhat\s+do\s+you\s+have\b/i,
      /\bwhat\s+kind\s+of\s+(clothes|items)\s+do\s+you\s+have\b/i,
      /\bwhat\s+collections\s+do\s+you\s+have\b/i,
    ],
    responses: [
      'We sell curated thrift fashion across Shirts, Tees, Outerwear, Bottoms, Footwear, and Accessories. Want a link to a category?',
      'Main collections are Shirts, Tees, Outerwear, Bottoms, Footwear, and Accessories. Most pieces are unique, so stock rotates often.',
      'You can browse six core collections: Shirts, Tees, Outerwear, Bottoms, Footwear, and Accessories. Tell me what you want and I will point you there.',
      'We stock curated thrift pieces in Shirts, Tees, Outerwear, Bottoms, Footwear, and Accessories. Start with Shop if you want the full view.',
    ],
    links: [
      { label: 'Shop portal', href: '/sections/shop' },
      { label: 'Shirts', href: '/products/shirts' },
      { label: 'Tees', href: '/products/tees' },
      { label: 'Outerwear', href: '/products/coats' },
    ],
    suggestions: ['Browse collections', 'Shirts', 'Footwear', 'Accessories'],
  },
  {
    id: 'purchase-suggestions',
    priority: 13,
    patterns: [
      /\bwhat\s+can\s+you\s+suggest\s+(for\s+me\s+to\s+purchase|i\s+buy)\b/i,
      /\bwhat\s+should\s+i\s+(buy|purchase)\b/i,
      /\brecommend\s+me\s+(something|a\s+product|an\s+item)\b/i,
      /\bsuggest\s+me\s+(something|a\s+piece|an\s+item)\b/i,
      /\bhelp\s+me\s+choose\b/i,
    ],
    responses: [
      'Tell me your vibe (street, vintage, minimal) and your size, and I will suggest which collection to browse first. If you want a quick start, check Featured on Home.',
      'I can recommend a direction. Are you shopping for Tees, Footwear, Outerwear, or Accessories today?',
      'Best way is to start with one statement piece. Tell me the occasion and I will point you to a category to explore.',
      'If you want something easy to style, start with Tees or Accessories. If you want impact, start with Outerwear or Footwear.',
    ],
    links: [
      { label: 'Home (Featured)', href: '/' },
      { label: 'Shop portal', href: '/sections/shop' },
    ],
    suggestions: ['Browse collections', 'Tees', 'Outerwear', 'Footwear'],
  },
  {
    id: 'greeting',
    priority: 10,
    patterns: [
      /^(hi|hey|hello|hiya|howdy|yo|sup|good\s+(morning|afternoon|evening|day))[\s!.?]*$/i,
      /^(hi|hey|hello)\s+xavyr/i,
    ],
    responses: [
      'Hello! Good to see you here. What can I help you find on MysticalPIECES today?',
      'Hi there. I am Xavyr, your site guide. Ask me about collections, checkout, or where to go next.',
      'Hey! Welcome in. Tell me what you are looking for and I will point you the right way.',
      'Hello and welcome. Ready when you are: shopping, delivery questions, or finding a page.',
      'Hi! I am here to make the site easier to navigate. What would you like to explore?',
      'Good to meet you. Browse, chat, or ask how something works. I am flexible.',
      'Welcome to the boutique side of the internet. Where should we start?',
      'Hey there. Collections, cart, policies, or just a conversation: all fair game.',
    ],
    suggestions: DEFAULT_SUGGESTIONS,
  },
  {
    id: 'how-are-you',
    priority: 9,
    patterns: [/how are you/i, /how('s| is) it going/i, /you good/i, /how do you do/i],
    responses: [
      'I am well, thank you for asking. More importantly, how can I help you shop today?',
      'Doing great on my end. What can I look up for you on MysticalPIECES?',
      'All good here. Tell me what you need and we will get you sorted.',
      'I am here and ready to help. What brings you to the site today?',
      'Well, thanks! Let me know if you want directions, collections, or checkout help.',
    ],
    suggestions: DEFAULT_SUGGESTIONS,
  },
  {
    id: 'thanks',
    priority: 9,
    patterns: [/thank(s| you| u)/i, /appreciate it/i, /cheers/i, /much obliged/i],
    responses: [
      'You are very welcome. Happy to help anytime.',
      'Glad that helped. Reach out again if anything else comes up.',
      'My pleasure. Enjoy browsing MysticalPIECES.',
      'Anytime. Wishing you a great find in the catalog.',
      'Happy to assist. I am here if you need another hand.',
    ],
    suggestions: ['Browse collections', 'Contact the store'],
  },
  {
    id: 'sorry',
    priority: 9,
    patterns: [/^(sorry|my bad|apologies|apologize|oops)[\s!.?]*$/i, /didn('t| not) mean/i],
    responses: [
      'No worries at all. How can I help you now?',
      'It is completely fine. What would you like to do next?',
      'No problem. Feel free to ask anything about the site.',
      'All good. Let us pick up where you left off.',
      'Nothing to apologize for. What can I clarify for you?',
    ],
    suggestions: DEFAULT_SUGGESTIONS,
  },
  {
    id: 'please',
    priority: 8,
    patterns: [/^(please|pls|kindly)[\s!.?]*$/i, /can you please/i, /please help/i],
    responses: [
      'Of course. Tell me what you need and I will do my best.',
      'Absolutely. What should we look at first?',
      'Happy to help. What is the question?',
      'Sure thing. Give me a bit more detail and I will guide you.',
      'Yes, go ahead. What would you like to know about the site?',
    ],
    suggestions: DEFAULT_SUGGESTIONS,
  },
  {
    id: 'continue',
    priority: 8,
    patterns: [/^(continue|go on|keep going|tell me more|and\??)[\s!.?]*$/i, /more (info|information|details|context)/i],
    responses: [
      'Sure. What part would you like me to expand on: shop, cart, checkout, or delivery?',
      'Happy to continue. Pick a topic below or ask something specific.',
      'Let us keep going. Which area of the site are you curious about?',
      'I can go deeper. Are you asking about products, orders, or your account?',
      'Tell me which step you are on and I will walk you through the rest.',
    ],
    suggestions: DEFAULT_SUGGESTIONS,
  },
  {
    id: 'vague',
    priority: 7,
    patterns: [/^(help|hmm|um+|idk|i don('t| not) know)[\s!.?]*$/i, /^(what|huh|confused)[\s!.?]*$/i, /^\.{2,}$/],
    responses: [
      'No problem. Are you trying to shop, track an order, or find a specific page?',
      'I can narrow it down. Try asking about a collection, checkout, or delivery.',
      'Let us start simple: do you want to browse, buy, or contact the store?',
      'Happy to help if you share a little more. What were you hoping to do here?',
      'Pick one of the suggestions below, or describe what you are looking for in a few words.',
    ],
    suggestions: DEFAULT_SUGGESTIONS,
  },
  {
    id: 'what',
    priority: 6,
    patterns: [/^what(\s|$|\?)/i, /what is this/i, /what can you do/i],
    responses: [
      'I can help you navigate MysticalPIECES, explain how shopping works, and point you to the right pages.',
      'This is MysticalPIECES, a curated thrift boutique online. I guide you through collections, cart, and checkout.',
      'I answer public questions about the site: where to shop, how orders work, delivery, and policies.',
      'Think of me as your store guide. Ask what you want to find or how something works.',
      'I help with anything shoppers need to know here. What specifically are you wondering about?',
    ],
    suggestions: DEFAULT_SUGGESTIONS,
  },
  {
    id: 'where',
    priority: 6,
    patterns: [/^where(\s|$|\?)/i, /where (is|are|can|do)/i],
    responses: [
      'Tell me what you are looking for and I will link you to the right page.',
      'I can point you there. Are you looking for a category, your cart, or contact info?',
      'Let me help with directions. What page or section do you want to reach?',
      'Share the destination and I will show you the link.',
    ],
    suggestions: ['Browse collections', 'View Cart', 'Contact the store'],
  },
  {
    id: 'how',
    priority: 6,
    patterns: [/^how(\s|$|\?)/i, /how do i/i, /how can i/i],
    responses: [
      'Good question. Tell me the goal (order, delivery, account) and I will walk you through it.',
      'I can explain step by step. What are you trying to do on the site?',
      'Happy to break it down. Shopping, checkout, and delivery are the most common topics.',
      'Let us figure it out together. What process do you need help with?',
      'Ask about a specific task and I will keep it simple and clear.',
    ],
    suggestions: ['How do I order?', 'Delivery & payment', 'Sign in / Register'],
  },
  {
    id: 'why',
    priority: 6,
    patterns: [/^why(\s|$|\?)/i],
    responses: [
      'I can explain how things work on MysticalPIECES. What policy or step are you curious about?',
      'Tell me what seems unclear and I will explain the reasoning in plain language.',
      'Good question. Is this about thrift pieces, delivery, or how checkout works?',
      'I will do my best to clarify. What specifically are you asking why about?',
      'Happy to explain. Most shoppers ask about unique pieces, cash on delivery, or sizing.',
    ],
    suggestions: DEFAULT_SUGGESTIONS,
  },
  {
    id: 'when',
    priority: 6,
    patterns: [/^when(\s|$|\?)/i, /how long/i, /how soon/i],
    responses: [
      'Timing depends on your order stage. After checkout you get email updates as we process and deliver.',
      'Delivery usually follows after dispatch. Exact timing varies by location in or outside Kampala.',
      'If you already ordered, check your email or account for status. New orders start at checkout.',
      'For delivery windows, the team confirms when your order is ready and on the way.',
      'Tell me if you mean delivery time or when a product restocks. Most thrift pieces do not restock once sold.',
    ],
    suggestions: ['How do I order?', 'Contact the store'],
  },
  {
    id: 'abusive',
    priority: 20,
    patterns: [
      /\b(stupid|idiot|dumb|useless|trash|garbage|scam|fraud|liar|hate you|shut up|kill|die)\b/i,
      /\b(fuck|shit|bitch|asshole|bastard)\b/i,
    ],
    responses: [
      'I am here to help with shopping and site questions in a respectful way. How can I assist you with MysticalPIECES?',
      'Let us keep things constructive. I can help with collections, orders, or finding a page.',
      'I want to stay useful. If something went wrong with an order, contact the store team and I can share how.',
      'I will do my best to help if you have a store-related question.',
      'If you need support, I can point you to contact options or explain how shopping works here.',
    ],
    suggestions: ['Contact the store', 'How do I order?'],
  },
  {
    id: 'off-topic',
    priority: 5,
    patterns: [
      /\b(weather|football|politics|bitcoin|crypto|homework|recipe|joke|sing|poem)\b/i,
      /tell me a story/i,
      /who is the president/i,
    ],
    responses: [
      'I stick to MysticalPIECES and shopping topics. Want help finding a collection or checking out?',
      'That is a bit outside my lane. I focus on this site: shop, cart, delivery, and policies.',
      'I am best at store guidance. Try asking about products, orders, or navigation.',
      'I cannot help with that, but I can point you around the boutique online.',
      'Let us get back to the store. What would you like to browse or learn about here?',
    ],
    suggestions: DEFAULT_SUGGESTIONS,
  },
  {
    id: 'bye',
    priority: 8,
    patterns: [/^(bye|goodbye|see you|later|cya|good night)[\s!.?]*$/i, /take care/i],
    responses: [
      'Goodbye! Come back anytime you need a hand on the site.',
      'Take care. Happy thrifting with MysticalPIECES.',
      'See you soon. The shop is always here when you are ready.',
      'Bye for now. Wishing you a great find next visit.',
      'Until next time. I will be here if you need directions again.',
    ],
  },
]

export const ADMIN_GUARDRAIL_RESPONSES = [
  'I cannot help with admin or back-office access. I am here for public shopping guidance on the site.',
  'Admin areas are separate from what I cover. I can help with collections, checkout, delivery, or finding a page.',
  'That is outside my role as a shopper guide. Ask me about products, orders, or navigation instead.',
  'I do not have admin access. For store shopping questions, I am happy to help.',
]

export const GENERAL_GUARDRAIL_RESPONSES = [
  'That is outside what I am allowed to discuss. Ask me about collections, checkout, delivery, or site pages.',
  'I do not have access to private store systems. For shopping help, I am right here.',
  'I keep customer-facing guidance only. Try a question about products, orders, or navigation.',
  'Sensitive store details stay private. How can I help you shop or explore the site?',
  'I cannot help with that kind of request. What would you like to know about shopping here?',
]

/** @deprecated use ADMIN or GENERAL pools via guardrailResponse */
export const GUARDRAIL_RESPONSES = [...GENERAL_GUARDRAIL_RESPONSES, ...ADMIN_GUARDRAIL_RESPONSES]

export const FALLBACK_RESPONSES = [
  'I might not have caught that. Try asking about shop, cart, checkout, delivery, or your account.',
  'Could you rephrase? I am strongest on navigation, collections, and how orders work.',
  'Not sure yet. Pick a suggestion below or name what you want to do on the site.',
  'Let me help another way. Are you trying to buy something, find a page, or contact the team?',
  'I want to get you the right answer. What part of MysticalPIECES are you asking about?',
  'Hmm, new one for me. Try a category name, a page like Shop or Cart, or ask how ordering works.',
  'I am still learning how you think. Give me a hint: browse, buy, deliver, or contact?',
  'Say it another way if you can. Or tap a chip below and we will go from there.',
  'No stress. Most people ask about collections, checkout, or where something lives on the site.',
  'We can keep chatting. If you want store facts, mention shop, payment, or account.',
]

/** Core + casual pools merged for matching */
export const ALL_CONVERSATION_POOLS: ConversationMatch[] = [...CONVERSATION_POOLS, ...BANTER_POOLS]
