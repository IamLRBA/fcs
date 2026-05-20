/** UTC day index — advances every 24 hours; same value worldwide for a given calendar UTC day. */
export function getFeaturedDayIndex(now = Date.now()): number {
  return Math.floor(now / 86_400_000)
}

/** Pick one item per rank for featured rows; cycles through `pool` by day + rank. */
export function pickFeaturedByDay<T>(pool: T[], rank: number, dayIndex: number): T | null {
  if (pool.length === 0) return null
  return pool[(dayIndex + rank) % pool.length]
}

/** Cache featured API until next UTC midnight so all clients see the same daily set. */
export function getFeaturedCacheMaxAgeSec(now = Date.now()): number {
  const nextUtcDayMs = (Math.floor(now / 86_400_000) + 1) * 86_400_000
  return Math.max(60, Math.floor((nextUtcDayMs - now) / 1000))
}
