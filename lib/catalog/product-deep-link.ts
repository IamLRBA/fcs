/** Build category page URL with optional subcategory hash and featured-product highlight. */
export function buildProductCategoryHref(
  categorySlug: string,
  options?: { section?: string; productId?: string }
): string {
  const base = `/products/${encodeURIComponent(categorySlug)}`
  const params = new URLSearchParams()
  if (options?.productId) params.set('product', options.productId)
  const qs = params.toString()
  const hash = options?.section ? `#${options.section}` : ''
  return `${base}${qs ? `?${qs}` : ''}${hash}`
}

export function parseCategorySectionFromHash(hash: string): string {
  return hash.replace(/^#/, '').trim()
}

export function getCategoryProductIdFromSearch(search: string | URLSearchParams | null): string | null {
  if (!search) return null
  const params = typeof search === 'string' ? new URLSearchParams(search) : search
  const id = params.get('product')?.trim()
  return id || null
}

/** Scroll a child element to the horizontal center of its overflow-x ancestor. */
export function scrollElementInHorizontalStrip(
  el: HTMLElement,
  behavior: ScrollBehavior = 'smooth'
): boolean {
  let parent: HTMLElement | null = el.parentElement
  while (parent) {
    const ox = getComputedStyle(parent).overflowX
    if (ox === 'auto' || ox === 'scroll' || ox === 'overlay') {
      const elRect = el.getBoundingClientRect()
      const parentRect = parent.getBoundingClientRect()
      const targetLeft =
        parent.scrollLeft + (elRect.left - parentRect.left) - (parentRect.width - elRect.width) / 2
      parent.scrollTo({ left: Math.max(0, targetLeft), behavior })
      return true
    }
    parent = parent.parentElement
  }
  el.scrollIntoView({ behavior, inline: 'center', block: 'nearest' })
  return false
}

/** Fast eased scroll to an element's document position (shorter than default smooth). */
export function scrollToElementFast(el: HTMLElement, durationMs = 380): void {
  const target =
    el.getBoundingClientRect().top + window.scrollY - parseFloat(getComputedStyle(el).scrollMarginTop || '0')
  const start = window.scrollY
  const distance = target - start
  if (Math.abs(distance) < 2) return

  const startTime = performance.now()
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

  const step = (now: number) => {
    const elapsed = now - startTime
    const t = Math.min(1, elapsed / durationMs)
    window.scrollTo(0, start + distance * easeOutCubic(t))
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

export function scrollSegmentPillIntoView(sectionId: string): void {
  const btn = document.querySelector<HTMLElement>(`[data-segment-id="${sectionId}"]`)
  if (!btn) return
  btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
}
