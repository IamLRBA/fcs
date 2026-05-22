import type { InventoryMode, Product, ProductVariant } from '@prisma/client'
import { inventoryModeToClient, variantsToClient } from '@/lib/inventory'
import type { CatalogProduct } from '@/lib/catalog/types'

type ProductWithRelations = Product & {
  images?: Array<{ url: string; sortOrder?: number }>
  variants?: ProductVariant[]
}

export function toCatalogProduct(product: ProductWithRelations): CatalogProduct {
  const variants = product.variants?.length ? variantsToClient(product.variants) : undefined
  return {
    id: product.id,
    name: product.name,
    brand: product.brand ?? '',
    category: product.category,
    section: product.section,
    price_ugx: product.priceUgx,
    original_price: product.originalPriceUgx ?? undefined,
    sizes: product.sizes ?? [],
    colors: product.colors ?? [],
    images: (product.images ?? []).map((img) => img.url),
    description: product.description ?? '',
    condition: product.condition ?? 'Perfect',
    sku: product.sku ?? '',
    stock_qty: product.stockQty,
    inventory_mode: inventoryModeToClient(product.inventoryMode as InventoryMode),
    variants,
    isActive: product.isActive,
  }
}

export const productIncludeVariants = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: { orderBy: [{ size: 'asc' as const }, { color: 'asc' as const }] },
}
