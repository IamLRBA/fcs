import type { HeroEntranceRole } from './hero-entrance'

/** Lag intensity — lower tiers trail more behind the hero lead on scroll. */
export type HeroScrollLagTier = 'trail' | 'drag' | 'anchor'

export const LAG_SPRING: Record<HeroScrollLagTier, { stiffness: number; damping: number; mass: number }> = {
  trail: { stiffness: 78, damping: 17, mass: 1.05 },
  drag: { stiffness: 48, damping: 14, mass: 1.45 },
  anchor: { stiffness: 34, damping: 11, mass: 1.85 },
}

export const LAG_TRAVEL: Record<HeroScrollLagTier, number> = {
  trail: 100,
  drag: 155,
  anchor: 195,
}

export const STRETCH_GAIN: Record<HeroScrollLagTier, number> = {
  trail: 0.5,
  drag: 0.62,
  anchor: 0.38,
}

/** Roles that trail behind lead content (media, title, icon) on scroll. */
export function getHeroRoleLagTier(role: HeroEntranceRole): HeroScrollLagTier | null {
  switch (role) {
    case 'subtitle':
    case 'divider':
    case 'body':
      return 'trail'
    case 'actions':
      return 'drag'
    case 'meta':
      return 'anchor'
    default:
      return null
  }
}
