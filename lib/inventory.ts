import type { InventoryMode } from '@prisma/client'
import type { InventoryModeClient, ProductVariantStock } from '@/lib/catalog/types'

export type VariantInput = { size: string; color: string; stock_qty: number }

export function inventoryModeToClient(mode: InventoryMode): InventoryModeClient {
  return mode === 'MULTI' ? 'multi' : 'unique'
}

export function inventoryModeFromClient(mode: unknown): InventoryMode {
  return mode === 'multi' || mode === 'MULTI' ? 'MULTI' : 'UNIQUE'
}

export function isMultiInventory(mode: InventoryMode | InventoryModeClient): boolean {
  return mode === 'MULTI' || mode === 'multi'
}

export function normalizeVariantKey(size: string, color: string): { size: string; color: string } {
  return { size: size.trim(), color: color.trim() }
}

export function parseVariantInputs(raw: unknown): VariantInput[] {
  if (!Array.isArray(raw)) return []
  const out: VariantInput[] = []
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue
    const r = row as Record<string, unknown>
    const { size, color } = normalizeVariantKey(String(r.size ?? ''), String(r.color ?? ''))
    const stock_qty = Math.max(0, Math.round(Number(r.stock_qty ?? r.stockQty ?? 0)))
    if (!size || !color || stock_qty <= 0) continue
    out.push({ size, color, stock_qty })
  }
  return out
}

export function mergeVariantInputs(rows: VariantInput[]): VariantInput[] {
  const map = new Map<string, VariantInput>()
  for (const row of rows) {
    const key = `${row.size}::${row.color}`
    const existing = map.get(key)
    if (existing) {
      existing.stock_qty += row.stock_qty
    } else {
      map.set(key, { ...row })
    }
  }
  return Array.from(map.values())
}

export function deriveSizesAndColors(variants: VariantInput[]): { sizes: string[]; colors: string[] } {
  const sizeSet = new Set<string>()
  const colorSet = new Set<string>()
  for (const v of variants) {
    sizeSet.add(v.size)
    colorSet.add(v.color)
  }
  return {
    sizes: Array.from(sizeSet),
    colors: Array.from(colorSet),
  }
}

export function sumVariantStock(variants: Array<{ stock_qty?: number; stockQty?: number }>): number {
  return variants.reduce((sum, v) => sum + Math.max(0, Number(v.stock_qty ?? v.stockQty ?? 0)), 0)
}

export function variantsToClient(rows: Array<{ size: string; color: string; stockQty: number }>): ProductVariantStock[] {
  return rows.map((v) => ({
    size: v.size,
    color: v.color,
    stock_qty: v.stockQty,
  }))
}

export function getVariantStock(variants: ProductVariantStock[], size: string, color: string): number {
  const { size: s, color: c } = normalizeVariantKey(size, color)
  const found = variants.find((v) => v.size === s && v.color === c)
  return found?.stock_qty ?? 0
}

export function cartLineId(
  productId: string,
  inventoryMode: InventoryModeClient,
  size?: string,
  color?: string
): string {
  if (!isMultiInventory(inventoryMode)) return productId
  const { size: s, color: c } = normalizeVariantKey(size ?? '', color ?? '')
  return `${productId}::${s}::${c}`
}

export function canDeleteMultiProduct(totalStock: number): boolean {
  return totalStock <= 0
}
