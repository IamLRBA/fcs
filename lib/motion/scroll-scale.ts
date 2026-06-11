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

/** Matches container-custom horizontal padding (px-4 / sm:px-6 / lg:px-8). */
export const SCROLL_SCALE_MAX_WIDTH = 1152 // max-w-6xl (72rem)

export function getScrollScaleGutter(viewportWidth: number): number {
  if (viewportWidth < 640) return 32
  if (viewportWidth < 1024) return 48
  return 64
}

/** Cap peak scale so scaled content never exceeds the universal side margins. */
export function capScrollScalePeak(desiredPeak: number, viewportWidth: number): number {
  if (viewportWidth <= 0 || desiredPeak <= 1) return 1

  const gutter = getScrollScaleGutter(viewportWidth)
  const contentWidth = Math.min(viewportWidth - gutter, SCROLL_SCALE_MAX_WIDTH)
  if (contentWidth <= 0) return 1

  const sideGutter = (viewportWidth - contentWidth) / 2
  const maxPeak = 1 + (2 * sideGutter) / contentWidth
  return Math.min(desiredPeak, maxPeak)
}
