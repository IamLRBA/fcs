import type { CatalogProduct } from '@/lib/catalog/types'
import { getFeaturedDayIndex, pickFeaturedByDay } from '@/lib/featured-rotation'

/** Number of horizontal featured rows on the home page. */
export const FEATURED_ROW_COUNT = 4

/** Row 0 = "New & refreshed" — most recently updated item per category. */
export const FEATURED_SPOTLIGHT_ROW = 0

export type FeaturedCatalogProduct = CatalogProduct & {
  updatedAtMs: number
  createdAtMs: number
}

export type FeaturedRowItem = {
  product: CatalogProduct
  categoryName: string
  categorySlug: string
}

export type FeaturedCategoryMeta = Record<string, { title: string }>

/**
 * Build four featured rows:
 * - Row 0: newest/updated in-stock piece per category (new & edited listings always show here).
 * - Rows 1–3: daily rotation through remaining catalog (changes every 24h UTC).
 */
export function buildFeaturedRows(
  products: FeaturedCatalogProduct[],
  categoryMeta: FeaturedCategoryMeta,
  dayIndex = getFeaturedDayIndex()
): FeaturedRowItem[][] {
  const byCategory = groupActiveInStockByCategory(products)
  const categorySlugs = sortCategorySlugs(Array.from(byCategory.keys()))

  const usedProductIds = new Set<string>()
  const rows: FeaturedRowItem[][] = []

  for (let rank = 0; rank < FEATURED_ROW_COUNT; rank++) {
    const row: FeaturedRowItem[] = []

    for (const slug of categorySlugs) {
      const pool = byCategory.get(slug)
      if (!pool?.length) continue

      const pick =
        rank === FEATURED_SPOTLIGHT_ROW
          ? pickSpotlightProduct(pool)
          : pickRotatedProduct(pool, rank, dayIndex, usedProductIds)

      if (!pick) continue

      usedProductIds.add(pick.id)
      row.push({
        product: stripFeaturedMeta(pick),
        categoryName: categoryMeta[slug]?.title ?? slug,
        categorySlug: slug,
      })
    }

    if (row.length > 0) rows.push(row)
  }

  return rows
}

/** Latest catalog change — used to shorten cache when something was added/edited today. */
export function getLatestCatalogActivityMs(products: FeaturedCatalogProduct[]): number {
  return products.reduce((max, p) => Math.max(max, p.updatedAtMs, p.createdAtMs), 0)
}

export function groupActiveInStockByCategory(
  products: FeaturedCatalogProduct[]
): Map<string, FeaturedCatalogProduct[]> {
  const byCategory = new Map<string, FeaturedCatalogProduct[]>()

  for (const product of products) {
    if (!product.isActive || product.stock_qty <= 0) continue
    const list = byCategory.get(product.category) ?? []
    list.push(product)
    byCategory.set(product.category, list)
  }

  for (const slug of Array.from(byCategory.keys())) {
    const list = byCategory.get(slug)!
    list.sort((a, b) => {
      if (b.updatedAtMs !== a.updatedAtMs) return b.updatedAtMs - a.updatedAtMs
      return b.createdAtMs - a.createdAtMs
    })
    byCategory.set(slug, list)
  }

  return byCategory
}

function sortCategorySlugs(slugs: string[]): string[] {
  const preferred = ['shirts', 'tees', 'coats', 'pants-and-shorts', 'footwear', 'accessories']
  return [...slugs].sort((a, b) => {
    const ai = preferred.indexOf(a)
    const bi = preferred.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

/** Freshest listing in the category — surfaces new and recently edited products. */
function pickSpotlightProduct(pool: FeaturedCatalogProduct[]): FeaturedCatalogProduct | null {
  return pool[0] ?? null
}

/**
 * Daily rotation for rows 1–3. Skips products already placed in earlier rows when possible.
 */
function pickRotatedProduct(
  pool: FeaturedCatalogProduct[],
  rank: number,
  dayIndex: number,
  usedProductIds: Set<string>
): FeaturedCatalogProduct | null {
  const unused = pool.filter((p) => !usedProductIds.has(p.id))
  const rotationPool = unused.length > 0 ? unused : pool
  const picked = pickFeaturedByDay(rotationPool, rank, dayIndex)
  return picked ?? null
}

function stripFeaturedMeta(product: FeaturedCatalogProduct): CatalogProduct {
  const { updatedAtMs: _u, createdAtMs: _c, ...catalog } = product
  return catalog
}
