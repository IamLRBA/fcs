'use client'

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  type KeyboardEvent,
} from 'react'
import Button from '@/components/ui/Button'
import { SLIDER_SYNC_EDGE_LINE_CLASS } from '@/lib/constants/slider-edge'

type HorizontalScrollAffordanceProps = {
  children: ReactNode
  /** Outer wrapper (positioning, max-width, negative margins) */
  className?: string
  /** Classes on the scrollable element */
  scrollClassName?: string
  /**
   * Reverse horizontal scroll semantics so drag/arrows match “slide left‑to‑right” vs default “right‑to‑left”.
   * Implemented via RTL scrollport + inner LTR content so layout stays unchanged.
   */
  reverseSlideDirection?: boolean
  /** Accessible name for the scroll region */
  scrollAriaLabel: string
  /** When false, no focus ring / keyboard (e.g. loading skeleton) */
  keyboardFocusable?: boolean
  /** Edge gradient fades (default true). Set false when using border treatments instead. */
  showEdgeFades?: boolean
  /** Straight vertical rails; visibility matches left/right scroll arrows. */
  syncScrollEdgeLines?: boolean
  /** Use scrollbar-hide instead of a visible horizontal scrollbar */
  hideScrollbar?: boolean
  /** Rail bar colour class (default: same hues as company marquee — globals.css). */
  syncScrollEdgeLineClassName?: string
}

/**
 * Horizontal strip with edge fades and chevrons when content overflows.
 */
export default function HorizontalScrollAffordance({
  children,
  className = '',
  scrollClassName = '',
  reverseSlideDirection = false,
  scrollAriaLabel,
  keyboardFocusable = true,
  showEdgeFades = true,
  syncScrollEdgeLines = false,
  hideScrollbar = false,
  syncScrollEdgeLineClassName,
}: HorizontalScrollAffordanceProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const maxScroll = scrollWidth - clientWidth
    const epsilon = 2
    if (reverseSlideDirection) {
      /**
       * RTL scrollports: Blink/WebKit typically use scrollLeft ≤ 0 (0 at one end, −maxScroll at the other).
       * Safari may use positive scrollLeft; handle both.
       */
      if (scrollLeft <= 0) {
        const maxNeg = -maxScroll
        setCanLeft(scrollLeft > maxNeg + epsilon)
        setCanRight(scrollLeft < -epsilon)
      } else {
        setCanLeft(scrollLeft < maxScroll - epsilon)
        setCanRight(scrollLeft > epsilon)
      }
    } else {
      setCanLeft(scrollLeft > epsilon)
      setCanRight(scrollLeft < maxScroll - epsilon)
    }
  }, [reverseSlideDirection])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    updateEdges()
    el.addEventListener('scroll', updateEdges, { passive: true })
    window.addEventListener('resize', updateEdges)

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(updateEdges)
    })
    ro.observe(el)
    const inner = el.firstElementChild as HTMLElement | null
    if (inner) ro.observe(inner)

    return () => {
      el.removeEventListener('scroll', updateEdges)
      window.removeEventListener('resize', updateEdges)
      ro.disconnect()
    }
  }, [updateEdges])

  /** Same semantic “toward strip start” (-1) / “toward strip end” (+1); adapts under RTL scrollport */
  const scrollByViewport = (direction: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    const base = Math.max(160, el.clientWidth * 0.75)
    const delta = reverseSlideDirection ? -base * direction : base * direction
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!keyboardFocusable) return
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scrollByViewport(reverseSlideDirection ? 1 : -1)
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      scrollByViewport(reverseSlideDirection ? -1 : 1)
    }
  }

  const railBarClass =
    (syncScrollEdgeLineClassName && syncScrollEdgeLineClassName.trim()) || SLIDER_SYNC_EDGE_LINE_CLASS

  /* When keyboardFocusable, avoid focus-ring-none (it uses shadow !important). When false, need it so globals *:focus / .dark *:focus do not draw a ring on the region. */
  const scrollerClassName = [
    'overflow-x-auto overflow-y-hidden scroll-smooth overscroll-x-contain rounded-lg outline-none',
    ...(keyboardFocusable
      ? [
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:focus-visible:outline-primary-400',
        ]
      : ['focus-ring-none']),
    hideScrollbar ? 'scrollbar-hide' : '[scrollbar-width:thin]',
    scrollClassName,
  ]
    .filter(Boolean)
    .join(' ')

  const arrowLeftClass = syncScrollEdgeLines
    ? 'focus-ring-none absolute left-2 top-1/2 z-[6] -translate-y-1/2 sm:left-3'
    : 'focus-ring-none absolute left-0.5 top-1/2 z-[2] -translate-y-1/2 sm:left-1'

  const arrowRightClass = syncScrollEdgeLines
    ? 'focus-ring-none absolute right-2 top-1/2 z-[6] -translate-y-1/2 sm:right-3'
    : 'focus-ring-none absolute right-0.5 top-1/2 z-[2] -translate-y-1/2 sm:right-1'

  return (
    <div className={className}>
      {/*
        Inner positioning root only wraps the scrollport + overlays so absolute lines share
        the same box as overflow clipping (outer className often adds horizontal padding).
      */}
      <div className="relative w-full min-w-0">
        <div
          ref={scrollerRef}
          role="region"
          aria-label={scrollAriaLabel}
          tabIndex={keyboardFocusable ? 0 : -1}
          onKeyDown={onKeyDown}
          dir={reverseSlideDirection ? 'rtl' : 'ltr'}
          className={scrollerClassName}
        >
          <div dir="ltr" className="min-w-max">
            {children}
          </div>
        </div>

        {showEdgeFades && (
          <>
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-y-2 left-0 z-[2] w-8 sm:w-12 rounded-l-lg bg-gradient-to-r from-black/[0.08] via-black/[0.04] to-transparent transition-opacity duration-200 dark:from-black/45 dark:via-black/20 ${
                canLeft ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-y-2 right-0 z-[2] w-8 sm:w-12 rounded-r-lg bg-gradient-to-l from-black/[0.08] via-black/[0.04] to-transparent transition-opacity duration-200 dark:from-black/45 dark:via-black/20 ${
                canRight ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        )}

        {syncScrollEdgeLines && (
          <>
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-y-0 left-0 z-[5] rounded-none ${railBarClass} transition-opacity duration-200 ${
                canLeft ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-y-0 right-0 z-[5] rounded-none ${railBarClass} transition-opacity duration-200 ${
                canRight ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        )}

        {(reverseSlideDirection ? canRight : canLeft) && (
          <Button
            variant="circle"
            aria-label={`Scroll ${scrollAriaLabel} left`}
            onClick={() => scrollByViewport(reverseSlideDirection ? 1 : -1)}
            className={arrowLeftClass}
          >
            <span className="relative z-10 text-lg font-medium leading-none inline-block" aria-hidden>
              ⟸
            </span>
          </Button>
        )}
        {(reverseSlideDirection ? canLeft : canRight) && (
          <Button
            variant="circle"
            aria-label={`Scroll ${scrollAriaLabel} right`}
            onClick={() => scrollByViewport(reverseSlideDirection ? -1 : 1)}
            className={arrowRightClass}
          >
            <span className="relative z-10 text-lg font-medium leading-none inline-block" aria-hidden>
              ⟹
            </span>
          </Button>
        )}
      </div>
    </div>
  )
}
