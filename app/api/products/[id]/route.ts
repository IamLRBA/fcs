import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { RemovalReason } from '@prisma/client'

function toCatalogProduct(product: any) {
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
    images: (product.images ?? []).map((img: any) => img.url),
    description: product.description ?? '',
    condition: product.condition ?? 'Perfect',
    sku: product.sku ?? '',
    stock_qty: product.stockQty,
    isActive: product.isActive,
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const updated = await prisma.product.update({
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
      stockQty: Number(body.stock_qty ?? 0),
      sizes: body.sizes ?? [],
      colors: body.colors ?? [],
      isActive: body.isActive !== false,
      images: {
        deleteMany: {},
        create: (body.images ?? []).map((url: string, index: number) => ({
          url,
          sortOrder: index,
        })),
      },
    },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
    },
  })

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
    include: { images: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
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
        } as object,
      },
    })
    await tx.product.delete({ where: { id } })
  })

  const res = NextResponse.json({ ok: true })
  res.headers.set('Cache-Control', 'private, no-store, must-revalidate')
  return res
}
