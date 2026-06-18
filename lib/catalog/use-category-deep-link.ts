'use client'

import { useEffect, useRef, useState } from 'react'
import {
  getCategoryProductIdFromSearch,
  parseCategorySectionFromHash,
  scrollSegmentPillIntoView,
  scrollToElementFast,
} from '@/lib/catalog/product-deep-link'

type Options = {
  loading: boolean
  categoryKey: string
  sectionKeys: string[]
  /** ms after section scroll before centering product in strip */
  productScrollDelay?: number
}

const MAX_ATTEMPTS = 80
const RETRY_MS = 50

function waitForSectionId(
  sectionId: string,
  onFound: (el: HTMLElement) => void,
  signal: { cancelled: boolean },
  attempt = 0
): void {
  if (signal.cancelled) return
  const el = document.getElementById(sectionId)
  if (el) {
    onFound(el)
    return
  }
  if (attempt >= MAX_ATTEMPTS) return
  window.setTimeout(() => waitForSectionId(sectionId, onFound, signal, attempt + 1), RETRY_MS)
}

/**
 * On arrival from Featured Collections / Shop: select subcategory pill, scroll page to section,
 * then center the highlighted product in the horizontal strip.
 */
export function useCategoryDeepLink({
  loading,
  categoryKey,
  sectionKeys,
  productScrollDelay = 280,
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

    const hash =
      typeof window !== 'undefined' ? parseCategorySectionFromHash(window.location.hash) : ''
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

    const signal = { cancelled: false }
    let clearHighlightTimer: number | undefined

    waitForSectionId(
      hash,
      (sectionEl) => {
        if (signal.cancelled) return
        scrollSegmentPillIntoView(hash)
        scrollToElementFast(sectionEl, 420)
        if (productId) {
          window.setTimeout(() => {
            if (signal.cancelled) return
            setHighlightProductId(productId)
            clearHighlightTimer = window.setTimeout(() => setHighlightProductId(null), 2200)
            const url = new URL(window.location.href)
            url.searchParams.delete('product')
            window.history.replaceState(null, '', `${url.pathname}${url.hash}`)
          }, productScrollDelay)
        }
      },
      signal
    )

    return () => {
      signal.cancelled = true
      if (clearHighlightTimer) window.clearTimeout(clearHighlightTimer)
    }
  }, [loading, categoryKey, sectionKeys, productScrollDelay])

  useEffect(() => {
    if (sectionKeys.length === 0) return

    const onHash = () => {
      const hash = parseCategorySectionFromHash(window.location.hash)
      if (!hash || !sectionKeys.includes(hash)) return
      setSelectedSection(hash)
      waitForSectionId(hash, (el) => {
        scrollSegmentPillIntoView(hash)
        scrollToElementFast(el, 320)
      }, { cancelled: false })
    }

    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [sectionKeys])

  const scrollToSection = (section: string) => {
    setSelectedSection(section)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${section}`)
    }
    waitForSectionId(section, (el) => {
      scrollSegmentPillIntoView(section)
      scrollToElementFast(el, 320)
    }, { cancelled: false })
  }

  return {
    selectedSection,
    setSelectedSection,
    highlightProductId,
    scrollToSection,
  }
}
