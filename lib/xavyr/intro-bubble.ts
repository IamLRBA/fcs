export const XAVYR_FULL_INTRO_BUBBLE =
  "Hi, I'm Xavyr. Let's chat if you need any assistance"

/** Short page-entry hints — used on all pages; full intro is home-only. */
export const XAVYR_SHORT_INTRO_BUBBLES = [
  'Need a hand?',
  'Ask me anything.',
  'Stuck? I can help.',
  'Questions? Tap to chat.',
  'Here if you need me.',
  'Looking for something?',
] as const

const HOME_FIRST_VISIT_KEY = 'xavyr-home-full-intro-seen'

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/** Message for the floating intro bubble when entering a route. */
export function pickIntroBubbleMessage(pathname: string): string {
  const isHome = pathname === '/'

  if (isHome) {
    if (typeof window !== 'undefined' && !localStorage.getItem(HOME_FIRST_VISIT_KEY)) {
      localStorage.setItem(HOME_FIRST_VISIT_KEY, '1')
      return XAVYR_FULL_INTRO_BUBBLE
    }
    return pickRandom([XAVYR_FULL_INTRO_BUBBLE, ...XAVYR_SHORT_INTRO_BUBBLES])
  }

  return pickRandom(XAVYR_SHORT_INTRO_BUBBLES)
}
