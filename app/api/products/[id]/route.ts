import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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
    condition: product.condition ?? 'Like New',
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
      condition: body.condition ?? 'Like New',
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

  return NextResponse.json(toCatalogProduct(updated))
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
