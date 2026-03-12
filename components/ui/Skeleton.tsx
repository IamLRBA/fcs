'use client'

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
        <div className="hero-glass-frame rounded-2xl p-6 flex flex-col items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-24 w-full rounded-xl mt-2" />
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

/** Featured collections – single row of 3 cards (not 6) */
export function SkeletonFeaturedCollections() {
  return (
    <div className="min-h-[280px] bg-unified relative overflow-hidden py-10 px-4">
      <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full max-w-[240px] rounded-2xl overflow-hidden skeleton-panel">
            <Skeleton className="aspect-square w-full rounded-none rounded-t-2xl" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
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
