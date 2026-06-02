const actionBtnBase =
  'justify-center gap-1 py-1 text-[11px] font-medium sm:gap-1 sm:py-1.5 sm:text-xs'

/** Shared layout classes for featured / subcategory product cards with optional bottom-left accent. */
export function featuredProductCardLayout(accentBottomLeft: boolean) {
  return {
    glassFrameClass: accentBottomLeft ? ' featured-card-bl-accent' : '',
    innerPanelRoundedClass: accentBottomLeft ? '' : ' rounded-md',
    actionWrapClass: accentBottomLeft
      ? 'mt-0.5 flex w-full flex-col items-end gap-1'
      : 'mt-0.5 flex w-full flex-col gap-1',
    actionBtnClass: accentBottomLeft
      ? `ml-auto w-auto min-w-[3.75rem] shrink-0 px-2.5 sm:px-3 ${actionBtnBase}`
      : `w-full ${actionBtnBase}`,
    multiBtnClass: accentBottomLeft
      ? `ml-auto w-auto max-w-[88%] shrink-0 px-2 sm:px-2.5 ${actionBtnBase}`
      : `w-full ${actionBtnBase}`,
    quickViewBtnClass: accentBottomLeft
      ? `ml-auto w-auto max-w-[72%] shrink-0 px-2.5 sm:px-3 ${actionBtnBase}`
      : `flex-1 ${actionBtnBase}`,
  }
}
