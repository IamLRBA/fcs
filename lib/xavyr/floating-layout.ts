/** Shared bottom offsets for Xavyr FAB, intro bubble, and panel (right stack above Back to Top). */

export const SCROLL_SHOW_BACK_TO_TOP = 300

/** Matches BackToTop `bottom-8` */
export const FAB_BOTTOM_REST = '2rem'

/** Above Back to Top when it is visible */
export const FAB_BOTTOM_SCROLLED = '5.5rem'

const FAB_HEIGHT_REM = 3
const GAP_REM = 0.5

export function stackBottomAboveFab(fabBottomRem: number): string {
  return `${fabBottomRem + FAB_HEIGHT_REM + GAP_REM}rem`
}

export function fabBottomCss(scrolled: boolean): string {
  return scrolled ? FAB_BOTTOM_SCROLLED : FAB_BOTTOM_REST
}

export function introOrPanelBottomCss(scrolled: boolean): string {
  const fabRem = scrolled ? 5.5 : 2
  return stackBottomAboveFab(fabRem)
}
