const actionBtnBase =
  'justify-center gap-1 py-1 text-[11px] font-medium sm:gap-1 sm:py-1.5 sm:text-xs'

export type FeaturedCardAccent = 'none' | 'bottom-left' | 'bottom-right'

/** Shared layout classes for featured / subcategory product cards with optional corner accent. */
export function featuredProductCardLayout(accent: FeaturedCardAccent = 'none') {
  const accentBottomLeft = accent === 'bottom-left'
  const accentBottomRight = accent === 'bottom-right'
  const hasAccent = accentBottomLeft || accentBottomRight

  return {
    glassFrameClass: accentBottomLeft
      ? ' featured-card-bl-accent'
      : accentBottomRight
        ? ' featured-card-br-accent'
        : '',
    innerPanelRoundedClass: hasAccent ? '' : ' rounded-md',
    actionWrapClass: accentBottomLeft
      ? 'mt-0.5 flex w-full flex-col items-end gap-1'
      : accentBottomRight
        ? 'mt-0.5 flex w-full flex-col items-start gap-1'
        : 'mt-0.5 flex w-full flex-col gap-1',
    actionBtnClass: accentBottomLeft
      ? `ml-auto w-auto min-w-[3.75rem] shrink-0 px-2.5 sm:px-3 ${actionBtnBase}`
      : accentBottomRight
        ? `mr-auto w-auto min-w-[3.75rem] shrink-0 px-2.5 sm:px-3 ${actionBtnBase}`
        : `w-full ${actionBtnBase}`,
    multiBtnClass: accentBottomLeft
      ? `ml-auto w-auto max-w-[88%] shrink-0 px-2 sm:px-2.5 ${actionBtnBase}`
      : accentBottomRight
        ? `mr-auto w-auto max-w-[88%] shrink-0 px-2 sm:px-2.5 ${actionBtnBase}`
        : `w-full ${actionBtnBase}`,
    quickViewBtnClass: accentBottomLeft
      ? `ml-auto w-auto max-w-[72%] shrink-0 px-2.5 sm:px-3 ${actionBtnBase}`
      : accentBottomRight
        ? `mr-auto w-auto max-w-[72%] shrink-0 px-2.5 sm:px-3 ${actionBtnBase}`
        : `flex-1 ${actionBtnBase}`,
    accentActionWrapClass: accentBottomLeft
      ? 'ml-auto w-auto shrink-0'
      : accentBottomRight
        ? 'mr-auto w-auto shrink-0'
        : '',
  }
}
