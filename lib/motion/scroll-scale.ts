export type ScrollScaleVariant = 'centerPeak' | 'heroExit'
export type ScrollScaleIntensity = 'subtle' | 'normal' | 'emphasis'
/** peak: grows above 1 at center; rest: shrinks below 1 at edges, returns to exactly 1 at center */
export type ScrollScaleMode = 'peak' | 'rest'

/** Scroll offsets keyed by animation variant */
export const SCROLL_SCALE_OFFSETS = {
  centerPeak: ['start end', 'end start'],
  heroExit: ['start start', 'end start'],
} as const satisfies Record<ScrollScaleVariant, readonly [string, string]>

/** Peak scale when a section is centered (Enter Shop style: 1 → peak → 1) */
export const SCROLL_SCALE_PEAK: Record<ScrollScaleIntensity, number> = {
  subtle: 1.05,
  normal: 1.08,
  emphasis: 1.1,
}

/** Minimum scale at edges when mode is `rest` (1 at center, never above natural size) */
export const SCROLL_SCALE_REST_MIN: Record<ScrollScaleIntensity, number> = {
  subtle: 0.96,
  normal: 0.94,
  emphasis: 0.92,
}

export const HERO_EXIT_MIN_SCALE = 0.8
export const HERO_EXIT_Y = -100
