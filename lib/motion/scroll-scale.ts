export type ScrollScaleVariant = 'centerPeak' | 'heroExit'
export type ScrollScaleIntensity = 'subtle' | 'normal' | 'emphasis'

/** Scroll offsets keyed by animation variant */
export const SCROLL_SCALE_OFFSETS = {
  centerPeak: ['start end', 'end start'],
  heroExit: ['start start', 'end start'],
} as const satisfies Record<ScrollScaleVariant, readonly [string, string]>

/** Minimum scale at section edges (entry/exit). Center of scroll range stays at 1 — never magnifies. */
export const SCROLL_SCALE_EDGE_MIN: Record<ScrollScaleIntensity, number> = {
  subtle: 0.97,
  normal: 0.95,
  emphasis: 0.92,
}

export const HERO_EXIT_MIN_SCALE = 0.8
export const HERO_EXIT_Y = -100
