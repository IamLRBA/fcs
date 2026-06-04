export type ScrollScaleVariant = 'centerPeak' | 'heroExit'
export type ScrollScaleIntensity = 'subtle' | 'normal' | 'emphasis'

/** Scroll offsets keyed by animation variant */
export const SCROLL_SCALE_OFFSETS = {
  centerPeak: ['start end', 'end start'],
  heroExit: ['start start', 'end start'],
} as const satisfies Record<ScrollScaleVariant, readonly [string, string]>

/** Peak scale when a section is centered in the viewport */
export const SCROLL_SCALE_PEAK: Record<ScrollScaleIntensity, number> = {
  subtle: 1.05,
  normal: 1.08,
  emphasis: 1.1,
}

export const HERO_EXIT_MIN_SCALE = 0.8
export const HERO_EXIT_Y = -100
