import type { OrderItem, Prisma } from '@prisma/client'
import { isMultiInventory, normalizeVariantKey, sumVariantStock } from '@/lib/inventory'

/**
 * On delivery: unique pieces are removed from catalog; multi-inventory products
 * only have variant stock reduced and stay listed (out of stock when zero).
 */
export async function fulfillDeliveredOrderItems(
  tx: Prisma.TransactionClient,
  items: OrderItem[],
  orderId: string
) {
  const byProduct = new Map<string, OrderItem[]>()
  for (const item of items) {
    if (!item.productId) continue
    const list = byProduct.get(item.productId) ?? []
    list.push(item)
    byProduct.set(item.productId, list)
  }

  for (const [productId, lines] of Array.from(byProduct.entries())) {
    const p = await tx.product.findUnique({
      where: { id: productId },
      include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true },
    })
    if (!p) continue

    if (isMultiInventory(p.inventoryMode)) {
      for (const line of lines) {
        const { size, color } = normalizeVariantKey(line.size ?? '', line.color ?? '')
        if (!size || !color) continue
        const qty = Math.max(1, line.quantity)
        const variant = await tx.productVariant.findUnique({
          where: { productId_size_color: { productId, size, color } },
        })
        if (!variant) continue
        const next = Math.max(0, variant.stockQty - qty)
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stockQty: next },
        })
      }
      const refreshed = await tx.productVariant.findMany({ where: { productId } })
      const total = sumVariantStock(refreshed)
      await tx.product.update({
        where: { id: productId },
        data: {
          stockQty: total,
          isActive: total > 0 ? p.isActive : false,
        },
      })
      continue
    }

    await tx.productRemoval.create({
      data: {
        productId,
        reason: 'PRODUCT_BOUGHT',
        productSnapshot: {
          source: 'ORDER_DELIVERED',
          orderId,
          name: p.name,
          brand: p.brand,
          sku: p.sku,
          category: p.category,
          section: p.section,
          priceUgx: p.priceUgx,
          imageUrls: p.images.map((img) => img.url),
        } as object,
      },
    })
    await tx.product.delete({ where: { id: productId } })
  }
}
