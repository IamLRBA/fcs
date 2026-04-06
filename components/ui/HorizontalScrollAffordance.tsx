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

type HorizontalScrollAffordanceProps = {
  children: ReactNode
  /** Outer wrapper (positioning, max-width, negative margins) */
  className?: string
  /** Classes on the scrollable element */
  scrollClassName?: string
  /** Accessible name for the scroll region */
  scrollAriaLabel: string
  /** When false, no focus ring / keyboard (e.g. loading skeleton) */
  keyboardFocusable?: boolean
  /** Edge gradient fades (default true). Set false when using border treatments instead. */
  showEdgeFades?: boolean
  /**
   * Vertical edge lines (Companies slider style). Opacity follows the same rules as nav arrows:
   * left line when can scroll left, right line when can scroll right.
   */
  syncScrollEdgeLines?: boolean
  /** Use scrollbar-hide instead of a visible horizontal scrollbar */
  hideScrollbar?: boolean
}

/**
 * Horizontal strip with edge fades and chevrons when content overflows.
 */
export default function HorizontalScrollAffordance({
  children,
  className = '',
  scrollClassName = '',
  scrollAriaLabel,
  keyboardFocusable = true,
  showEdgeFades = true,
  syncScrollEdgeLines = false,
  hideScrollbar = false,
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
    setCanLeft(scrollLeft > epsilon)
    setCanRight(scrollLeft < maxScroll - epsilon)
  }, [])

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

  const scrollByViewport = (direction: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    const delta = Math.max(160, el.clientWidth * 0.75) * direction
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!keyboardFocusable) return
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scrollByViewport(-1)
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      scrollByViewport(1)
    }
  }

  /** Same surface as FeaturedCollections card inner panel (title/price/buttons sit on this). */
  const edgeLineSurface =
    'bg-gradient-to-b from-primary-800/30 to-primary-600/30 dark:from-neutral-800 dark:to-neutral-700'

  const scrollerClassName = `focus-ring-none overflow-x-auto overflow-y-hidden scroll-smooth overscroll-x-contain rounded-lg outline-none ${hideScrollbar ? 'scrollbar-hide' : '[scrollbar-width:thin]'} ${scrollClassName}`

  /** w-1 line (4px) + gap before arrow when vertical edge lines are shown */
  const arrowLeftClass = syncScrollEdgeLines
    ? 'focus-ring-none absolute left-3 top-1/2 z-[2] -translate-y-1/2 sm:left-3.5'
    : 'focus-ring-none absolute left-0.5 top-1/2 z-[2] -translate-y-1/2 sm:left-1'

  const arrowRightClass = syncScrollEdgeLines
    ? 'focus-ring-none absolute right-3 top-1/2 z-[2] -translate-y-1/2 sm:right-3.5'
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
          className={scrollerClassName}
        >
          {children}
        </div>

        {syncScrollEdgeLines && (
          <>
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-y-0 left-0 z-[1] w-1 ${edgeLineSurface} transition-opacity duration-200 ${canLeft ? 'opacity-100' : 'opacity-0'}`}
            />
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-y-0 right-0 z-[1] w-1 ${edgeLineSurface} transition-opacity duration-200 ${canRight ? 'opacity-100' : 'opacity-0'}`}
            />
          </>
        )}

        {showEdgeFades && (
          <>
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-y-2 left-0 z-[1] w-8 sm:w-12 rounded-l-lg bg-gradient-to-r from-black/[0.08] via-black/[0.04] to-transparent transition-opacity duration-200 dark:from-black/45 dark:via-black/20 ${
                canLeft ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-y-2 right-0 z-[1] w-8 sm:w-12 rounded-r-lg bg-gradient-to-l from-black/[0.08] via-black/[0.04] to-transparent transition-opacity duration-200 dark:from-black/45 dark:via-black/20 ${
                canRight ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        )}

        {canLeft && (
          <Button
            variant="circle"
            aria-label={`Scroll ${scrollAriaLabel} left`}
            onClick={() => scrollByViewport(-1)}
            className={arrowLeftClass}
          >
            <span className="relative z-10 text-lg font-medium leading-none inline-block" aria-hidden>
              ⟸
            </span>
          </Button>
        )}
        {canRight && (
          <Button
            variant="circle"
            aria-label={`Scroll ${scrollAriaLabel} right`}
            onClick={() => scrollByViewport(1)}
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
