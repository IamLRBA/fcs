'use client'

import HorizontalScrollAffordance from '@/components/ui/HorizontalScrollAffordance'

function cx(...parts: (string | boolean | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  static?: boolean
}

/** Base block – light/dark via globals .skeleton */
export function Skeleton({ className, static: staticBlock, ...props }: SkeletonProps) {
  return (
    <div
      className={cx('skeleton', staticBlock && 'animate-none', staticBlock && '[&::after]:hidden', className)}
      aria-hidden
      {...props}
    />
  )
}

/**
 * Home – mirrors first hero: logo area, title, divider, tagline, two CTAs.
 * Few blocks, centered, min-h-screen feel.
 */
export function SkeletonHomeHero() {
  return (
    <main className="min-h-screen bg-unified relative overflow-hidden flex items-center justify-center pt-20 pb-16 px-4">
      <div className="relative z-10 flex flex-col items-center text-center gap-5 max-w-4xl w-full">
        <Skeleton className="w-40 h-40 sm:w-48 sm:h-48 rounded-full shrink-0" />
        <Skeleton className="h-10 w-56 sm:w-72 rounded-lg mx-auto" />
        <Skeleton className="h-1 w-20 rounded-full mx-auto opacity-80" />
        <Skeleton className="h-4 w-full max-w-xl rounded-lg mx-auto" />
        <div className="flex flex-col sm:flex-row gap-3 justify-center w-full mt-2">
          <Skeleton className="h-12 w-full sm:w-40 rounded-xl" />
          <Skeleton className="h-12 w-full sm:w-44 rounded-xl" />
        </div>
      </div>
    </main>
  )
}

/**
 * About – mirrors AboutUs first section: section title, subtitle, wide banner strip.
 */
export function SkeletonAboutFirst() {
  return (
    <section className="min-h-screen bg-unified relative overflow-hidden pt-24 pb-16 px-4">
      <div className="container-custom max-w-4xl mx-auto text-center">
        <Skeleton className="h-12 w-52 mx-auto mb-6 rounded-lg" />
        <Skeleton className="h-5 w-full max-w-2xl mx-auto mb-12 rounded-lg" />
        <Skeleton className="h-40 sm:h-56 w-full max-w-5xl mx-auto rounded-2xl" />
      </div>
    </section>
  )
}

/**
 * Product category – mirrors hero only: glass image left, title right (stacked on mobile), quote block, pill row.
 */
export function SkeletonProductCategory() {
  return (
    <div className="min-h-screen bg-unified relative overflow-hidden pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
          <Skeleton className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl shrink-0" />
          <Skeleton className="h-14 w-full max-w-xs sm:max-w-md rounded-lg" />
        </div>
        <Skeleton className="h-16 max-w-2xl mx-auto rounded-lg mb-8" />
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/** Account – first block only: avatar + name line + one content card */
export function SkeletonAccountPage() {
  return (
    <div className="min-h-screen bg-unified relative overflow-hidden pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="hero-glass-frame relative rounded-2xl backdrop-blur-lg">
          <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden />
          <div className="glass-inner-panel flex flex-col items-center gap-4 rounded-2xl p-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="mt-2 h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Admin – stats row only (4 compact blocks) */
export function SkeletonAdminDashboard() {
  return (
    <div className="min-h-screen bg-unified relative overflow-hidden pt-24 pb-16 px-4">
      <div className="container-custom max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48 mx-auto mb-8 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl skeleton-panel p-4 space-y-2">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-7 w-12 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SkeletonFeaturedCollectionsRow({
  isFirstRow,
  accentBottomLeft = false,
}: {
  isFirstRow: boolean
  accentBottomLeft?: boolean
}) {
  return (
    <HorizontalScrollAffordance
      showEdgeFades={false}
      syncScrollEdgeLines
      hideScrollbar
      className={`max-w-6xl mx-auto -mx-4 px-4 sm:mx-auto sm:px-0 sm:mb-7 ${isFirstRow ? 'mt-10 mb-6' : 'mt-0 mb-6'}`}
      scrollClassName="pt-6 pb-8"
      scrollAriaLabel="Featured collections loading"
      keyboardFocusable={false}
    >
      <div className="contents md:flex md:w-full md:min-w-0 md:justify-center">
        <div className="flex min-h-[1px] w-full min-w-0 flex-row justify-center gap-2.5 px-2.5 sm:gap-3 sm:px-5 md:w-max md:shrink-0 md:justify-start md:gap-4 lg:gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative w-[min(180px,calc(100vw-2.25rem))] flex-shrink-0 sm:w-[min(204px,calc((min(72rem,100vw)-6.5rem)/2))] md:w-[min(220px,calc((min(72rem,100vw)-9rem)/3))]"
            >
              <div
                className={`hero-glass-frame relative w-full backdrop-blur-md${accentBottomLeft ? ' featured-card-bl-accent' : ''}`}
              >
                <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0" aria-hidden />
                <div
                  className={`glass-inner-panel flex flex-col gap-1.5 overflow-hidden border border-primary-500/30 p-1.5 sm:gap-1.5 sm:p-2${accentBottomLeft ? '' : ' rounded-md'}`}
                >
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <div className="space-y-1 px-0.5 pb-0.5 sm:px-1">
                    <Skeleton className="mx-auto h-3 w-4/5 rounded sm:h-3.5" />
                    <Skeleton className="mx-auto h-2.5 w-1/2 rounded sm:h-3" />
                    <Skeleton
                      className={`h-6 rounded-md sm:h-7 ${accentBottomLeft ? 'ml-auto w-[42%]' : 'w-full'}`}
                    />
                  </div>
                </div>
                <Skeleton
                  className="absolute right-0 top-0 z-10 h-8 w-8 shrink-0 translate-x-[calc(var(--hero-frame-padding)*0.42)] -translate-y-[calc(var(--hero-frame-padding)*0.42)] rounded-full sm:h-9 sm:w-9"
                  aria-hidden
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </HorizontalScrollAffordance>
  )
}

/** Featured collections – four card strips (matches loaded layout) */
export function SkeletonFeaturedCollections() {
  return (
    <>
      {[0, 1, 2, 3].map((row) => (
        <SkeletonFeaturedCollectionsRow
          key={row}
          isFirstRow={row === 0}
          accentBottomLeft={row < 2}
        />
      ))}
    </>
  )
}

/** Video overlay – unchanged, on dark video area */
export function SkeletonVideo({ className }: { className?: string }) {
  return (
    <div
      className={cx('absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40', className)}
      aria-busy
      aria-label="Loading video"
    >
      <Skeleton className="w-full h-full rounded-none opacity-60" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-16 h-16 rounded-full skeleton opacity-80" />
      </div>
    </div>
  )
}

/**
 * Default route loading – use home hero shape (most visits land on home).
 * For routes with their own loading.tsx, those take precedence.
 */
export function SkeletonPageShell() {
  return <SkeletonHomeHero />
}
