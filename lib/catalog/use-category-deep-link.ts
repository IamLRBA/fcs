'use client'

import { useEffect, useRef, useState } from 'react'
import {
  getCategoryProductIdFromSearch,
  parseCategorySectionFromHash,
  scrollElementInHorizontalStrip,
  scrollSegmentPillIntoView,
  scrollToElementFast,
} from '@/lib/catalog/product-deep-link'

type Options = {
  loading: boolean
  categoryKey: string
  sectionKeys: string[]
  /** ms between section scroll and product strip scroll */
  productScrollDelay?: number
}

/**
 * On arrival from Featured Collections / Shop: select subcategory pill, scroll page to section,
 * then center the highlighted product in the horizontal strip.
 */
export function useCategoryDeepLink({
  loading,
  categoryKey,
  sectionKeys,
  productScrollDelay = 160,
}: Options) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [highlightProductId, setHighlightProductId] = useState<string | null>(null)
  const handledKeyRef = useRef<string | null>(null)

  useEffect(() => {
    handledKeyRef.current = null
  }, [categoryKey])

  useEffect(() => {
    if (!categoryKey || sectionKeys.length === 0) {
      setSelectedSection(null)
      return
    }

    const hash = typeof window !== 'undefined' ? parseCategorySectionFromHash(window.location.hash) : ''
    const productId =
      typeof window !== 'undefined'
        ? getCategoryProductIdFromSearch(window.location.search)
        : null

    if (hash && sectionKeys.includes(hash)) {
      setSelectedSection(hash)
    } else {
      setSelectedSection(sectionKeys[0])
    }

    if (!productId) setHighlightProductId(null)
  }, [categoryKey, sectionKeys.join('|')])

  useEffect(() => {
    if (loading || sectionKeys.length === 0) return

    const hash = parseCategorySectionFromHash(window.location.hash)
    const productId = getCategoryProductIdFromSearch(window.location.search)
    const runKey = `${categoryKey}|${hash}|${productId ?? ''}`
    if (handledKeyRef.current === runKey) return
    if (!hash || !sectionKeys.includes(hash)) {
      if (!productId) handledKeyRef.current = runKey
      return
    }

    handledKeyRef.current = runKey
    setSelectedSection(hash)

    let cancelled = false
    let highlightTimer: number | undefined
    let clearHighlightTimer: number | undefined

    const run = () => {
      if (cancelled) return
      scrollSegmentPillIntoView(hash)
      const sectionEl = document.getElementById(hash)
      if (sectionEl) scrollToElementFast(sectionEl, 360)

      if (productId) {
        highlightTimer = window.setTimeout(() => {
          if (cancelled) return
          const card = document.querySelector<HTMLElement>(
            `[data-section="${hash}"] [data-product-id="${productId}"]`
          )
          if (card) {
            scrollElementInHorizontalStrip(card, 'smooth')
            setHighlightProductId(productId)
            clearHighlightTimer = window.setTimeout(() => setHighlightProductId(null), 2200)
          }
          const url = new URL(window.location.href)
          url.searchParams.delete('product')
          window.history.replaceState(null, '', `${url.pathname}${url.hash}`)
        }, productScrollDelay)
      }
    }

    const raf = requestAnimationFrame(() => requestAnimationFrame(run))
    const fallback = window.setTimeout(run, 120)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.clearTimeout(fallback)
      if (highlightTimer) window.clearTimeout(highlightTimer)
      if (clearHighlightTimer) window.clearTimeout(clearHighlightTimer)
    }
  }, [loading, categoryKey, sectionKeys, productScrollDelay])

  useEffect(() => {
    if (sectionKeys.length === 0) return

    const onHash = () => {
      const hash = parseCategorySectionFromHash(window.location.hash)
      if (!hash || !sectionKeys.includes(hash)) return
      setSelectedSection(hash)
      requestAnimationFrame(() => {
        scrollSegmentPillIntoView(hash)
        const el = document.getElementById(hash)
        if (el) scrollToElementFast(el, 320)
      })
    }

    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [sectionKeys])

  const scrollToSection = (section: string) => {
    setSelectedSection(section)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${section}`)
    }
    requestAnimationFrame(() => {
      scrollSegmentPillIntoView(section)
      const el = document.getElementById(section)
      if (el) scrollToElementFast(el, 320)
    })
  }

  return {
    selectedSection,
    setSelectedSection,
    highlightProductId,
    scrollToSection,
  }
}
