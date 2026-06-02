const actionBtnBase =
  'justify-center gap-1 py-1 text-[11px] font-medium sm:gap-1 sm:py-1.5 sm:text-xs'

export type FeaturedCardAccent = 'none' | 'bottom-left' | 'bottom-right'
export type FeaturedCardDetailsAlign = 'start' | 'center' | 'end'

type FeaturedProductCardLayout = {
  glassFrameClass: string
  innerPanelRoundedClass: string
  detailsWrapClass: string
  priceRowClass: string
  inventoryChipsAlign: FeaturedCardDetailsAlign
  actionWrapClass: string
  actionBtnClass: string
  multiBtnClass: string
  quickViewBtnClass: string
  accentActionWrapClass: string
  collectionLinkBtnClass: string
}

/** Shared layout classes for featured / subcategory product cards with optional corner accent. */
export function featuredProductCardLayout(accent: FeaturedCardAccent = 'none'): FeaturedProductCardLayout {
  const accentBottomLeft = accent === 'bottom-left'
  const accentBottomRight = accent === 'bottom-right'
  const hasAccent = accentBottomLeft || accentBottomRight
  const inventoryChipsAlign: FeaturedCardDetailsAlign = accentBottomLeft
    ? 'end'
    : accentBottomRight
      ? 'start'
      : 'center'

  return {
    glassFrameClass: accentBottomLeft
      ? ' featured-card-bl-accent'
      : accentBottomRight
        ? ' featured-card-br-accent'
        : '',
    innerPanelRoundedClass: hasAccent ? '' : ' rounded-md',
    detailsWrapClass: accentBottomLeft
      ? 'flex min-h-0 flex-1 flex-col items-end px-0.5 pb-0.5 pt-0 text-right sm:px-1'
      : accentBottomRight
        ? 'flex min-h-0 flex-1 flex-col items-start px-0.5 pb-0.5 pt-0 text-left sm:px-1'
        : 'flex min-h-0 flex-1 flex-col px-0.5 pb-0.5 pt-0 text-center sm:px-1',
    priceRowClass: accentBottomLeft
      ? 'mb-1 mt-px flex flex-wrap items-center justify-end gap-x-1 gap-y-0'
      : accentBottomRight
        ? 'mb-1 mt-px flex flex-wrap items-center justify-start gap-x-1 gap-y-0'
        : 'mb-1 mt-px flex flex-wrap items-center justify-center gap-x-1 gap-y-0',
    inventoryChipsAlign,
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
    collectionLinkBtnClass: accentBottomLeft
      ? 'focus-ring-none absolute left-0 top-0 z-30 shrink-0 -translate-x-[calc(var(--hero-frame-padding)*0.42)] -translate-y-[calc(var(--hero-frame-padding)*0.42)]'
      : 'focus-ring-none absolute right-0 top-0 z-30 shrink-0 translate-x-[calc(var(--hero-frame-padding)*0.42)] -translate-y-[calc(var(--hero-frame-padding)*0.42)]',
  }
}
