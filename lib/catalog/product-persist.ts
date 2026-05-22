import type { InventoryMode, Prisma } from '@prisma/client'
import {
  deriveSizesAndColors,
  inventoryModeFromClient,
  mergeVariantInputs,
  parseVariantInputs,
  sumVariantStock,
  type VariantInput,
} from '@/lib/inventory'

export type ProductPersistBody = {
  inventory_mode?: unknown
  variants?: unknown
  sizes?: string[]
  colors?: string[]
  stock_qty?: number
}

export function resolveInventoryFromBody(body: ProductPersistBody): {
  inventoryMode: InventoryMode
  variants: VariantInput[]
  sizes: string[]
  colors: string[]
  stockQty: number
} {
  const inventoryMode = inventoryModeFromClient(body.inventory_mode)

  if (inventoryMode === 'MULTI') {
    const variants = mergeVariantInputs(parseVariantInputs(body.variants))
    const { sizes, colors } = deriveSizesAndColors(variants)
    const stockQty = sumVariantStock(variants)
    return { inventoryMode, variants, sizes, colors, stockQty }
  }

  const stockQty = Math.max(0, Math.round(Number(body.stock_qty ?? 1))) || 1
  return {
    inventoryMode: 'UNIQUE',
    variants: [],
    sizes: body.sizes ?? [],
    colors: body.colors ?? [],
    stockQty: stockQty > 0 ? 1 : 0,
  }
}

export async function replaceProductVariants(
  tx: Prisma.TransactionClient,
  productId: string,
  variants: VariantInput[]
) {
  await tx.productVariant.deleteMany({ where: { productId } })
  if (variants.length === 0) return
  await tx.productVariant.createMany({
    data: variants.map((v) => ({
      productId,
      size: v.size,
      color: v.color,
      stockQty: v.stock_qty,
    })),
  })
}
