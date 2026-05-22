import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { RemovalReason } from '@prisma/client'
import { toCatalogProduct, productIncludeVariants } from '@/lib/catalog/product-map'
import { canDeleteMultiProduct, isMultiInventory, sumVariantStock } from '@/lib/inventory'
import { replaceProductVariants, resolveInventoryFromBody } from '@/lib/catalog/product-persist'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: productIncludeVariants,
  })
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }
  const res = NextResponse.json(toCatalogProduct(product))
  res.headers.set('Cache-Control', 'private, no-store, must-revalidate')
  return res
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const inv = resolveInventoryFromBody(body)

  const updated = await prisma.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id },
      data: {
        name: body.name,
        brand: body.brand ?? '',
        category: body.category,
        section: body.section,
        description: body.description ?? '',
        condition: body.condition ?? 'Perfect',
        sku: body.sku || null,
        priceUgx: Number(body.price_ugx),
        originalPriceUgx: body.original_price ? Number(body.original_price) : null,
        inventoryMode: inv.inventoryMode,
        stockQty: inv.stockQty,
        sizes: inv.sizes,
        colors: inv.colors,
        isActive: body.isActive !== false,
        images: {
          deleteMany: {},
          create: (body.images ?? []).map((url: string, index: number) => ({
            url,
            sortOrder: index,
          })),
        },
      },
    })
    await replaceProductVariants(tx, id, inv.variants)
    return tx.product.findUnique({
      where: { id: product.id },
      include: productIncludeVariants,
    })
  })

  if (!updated) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const res = NextResponse.json(toCatalogProduct(updated))
  res.headers.set('Cache-Control', 'private, no-store, must-revalidate')
  return res
}

const VALID_REMOVAL_REASONS: RemovalReason[] = ['PRODUCT_BOUGHT', 'MISTAKENLY_POSTED', 'DISCONTINUED']

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let reason: RemovalReason = 'MISTAKENLY_POSTED'
  try {
    const body = await request.json().catch(() => ({}))
    const r = (body as { reason?: string })?.reason
    if (r && VALID_REMOVAL_REASONS.includes(r as RemovalReason)) {
      reason = r as RemovalReason
    }
  } catch {
    /* empty body ok */
  }

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { images: true, variants: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  if (isMultiInventory(existing.inventoryMode)) {
    const total = sumVariantStock(existing.variants)
    if (!canDeleteMultiProduct(total)) {
      return NextResponse.json(
        {
          error:
            'This product still has stock. It can only be removed from the catalog after all sizes and colors are sold out.',
          stock_remaining: total,
        },
        { status: 409 }
      )
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.productRemoval.create({
      data: {
        productId: id,
        reason,
        productSnapshot: {
          name: existing.name,
          sku: existing.sku,
          category: existing.category,
          section: existing.section,
          inventoryMode: existing.inventoryMode,
        } as object,
      },
    })
    await tx.product.delete({ where: { id } })
  })

  const res = NextResponse.json({ ok: true })
  res.headers.set('Cache-Control', 'private, no-store, must-revalidate')
  return res
}
