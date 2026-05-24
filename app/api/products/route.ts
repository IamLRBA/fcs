import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CATEGORY_SUBCATEGORY_SLUGS } from '@/lib/catalog/category-subcategories'
import { toCatalogProduct, productIncludeVariants } from '@/lib/catalog/product-map'
import type { CatalogProduct } from '@/lib/catalog/types'
import { inventoryModeToClient } from '@/lib/inventory'
import { replaceProductVariants, resolveInventoryFromBody } from '@/lib/catalog/product-persist'
import { getFeaturedCacheMaxAgeSecForCatalog } from '@/lib/featured-rotation'
import { buildFeaturedRows, getLatestCatalogActivityMs, type FeaturedCatalogProduct } from '@/lib/featured-selection'

function applyProductCacheHeaders(res: NextResponse, opts: { privateNoStore: boolean }) {
  if (opts.privateNoStore) {
    res.headers.set('Cache-Control', 'private, no-store, must-revalidate')
  } else {
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  }
  return res
}

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  shirts: {
    title: 'Shirts',
    description: 'Discover our collection of elegant and versatile shirts, from classic button-downs to modern casual styles.',
  },
  tees: {
    title: 'Tees',
    description: 'Comfortable and stylish t-shirts in various designs, materials, and fits.',
  },
  coats: {
    title: 'OuterWear',
    description: 'Stylish outerwear to keep you warm and fashionable.',
  },
  'pants-and-shorts': {
    title: 'Bottoms',
    description: 'Complete your look with our selection of pants and shorts.',
  },
  footwear: {
    title: 'FootWear',
    description: 'Step out in style with our curated footwear collection.',
  },
  accessories: {
    title: 'Accessories',
    description: 'Add the perfect finishing touches with our range of accessories.',
  },
}

export async function GET(request: Request) {
  try {
    return await handleProductsGet(request)
  } catch (err) {
    console.error('[api/products] GET failed:', err)
    return NextResponse.json(
      { error: 'Database unavailable or query failed' },
      { status: 503 }
    )
  }
}

async function handleProductsGet(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const section = searchParams.get('section')
  const includeInactive = searchParams.get('includeInactive') === '1'
  const grouped = searchParams.get('grouped') === '1'
  const featured = searchParams.get('featured') === '1'
  const lite = searchParams.get('lite') === '1'
  /** Admin table: one image per row to avoid loading huge base64 blobs for every gallery image. */
  const firstImageOnly =
    searchParams.get('firstImageOnly') === '1' && includeInactive && !grouped && !featured && !lite
  /** Storefront grouped/featured lists only need a cover image; full gallery loads on demand (e.g. quick view). */
  const storefrontCatalogOneImage =
    !includeInactive && !lite && (grouped || featured)
  const takeOneProductImage = firstImageOnly || storefrontCatalogOneImage

  const privateNoStore = includeInactive

  const where = {
    ...(category ? { category } : {}),
    ...(section ? { section } : {}),
    ...(includeInactive ? {} : { isActive: true }),
  }

  const orderBy = [{ category: 'asc' as const }, { updatedAt: 'desc' as const }]

  if (lite && !grouped && !featured) {
    const rows = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        brand: true,
        category: true,
        section: true,
        sku: true,
        description: true,
        priceUgx: true,
        originalPriceUgx: true,
        stockQty: true,
        inventoryMode: true,
        sizes: true,
        colors: true,
        condition: true,
        isActive: true,
      },
      orderBy,
    })
    const normalized: CatalogProduct[] = rows.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand ?? '',
      category: p.category,
      section: p.section,
      price_ugx: p.priceUgx,
      original_price: p.originalPriceUgx ?? undefined,
      sizes: p.sizes ?? [],
      colors: p.colors ?? [],
      images: [],
      description: p.description ?? '',
      condition: p.condition ?? 'Perfect',
      sku: p.sku ?? '',
      stock_qty: p.stockQty,
      inventory_mode: inventoryModeToClient(p.inventoryMode),
      isActive: p.isActive,
    }))
    return applyProductCacheHeaders(NextResponse.json(normalized), { privateNoStore })
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      ...productIncludeVariants,
      images: {
        orderBy: { sortOrder: 'asc' },
        ...(takeOneProductImage ? { take: 1 } : {}),
      },
    },
    orderBy,
  })

  const normalized = products.map(toCatalogProduct)

  if (featured) {
    const featuredInput: FeaturedCatalogProduct[] = products.map((p) => ({
      ...toCatalogProduct(p),
      updatedAtMs: p.updatedAt.getTime(),
      createdAtMs: p.createdAt.getTime(),
    }))

    const rows = buildFeaturedRows(featuredInput, CATEGORY_META)
    const latestActivity = getLatestCatalogActivityMs(featuredInput)
    const maxAge = getFeaturedCacheMaxAgeSecForCatalog(latestActivity)

    const res = NextResponse.json({ rows })
    res.headers.set(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=300`
    )
    return res
  }

  if (!grouped) {
    return applyProductCacheHeaders(NextResponse.json(normalized), { privateNoStore })
  }

  const groupedProducts: Record<string, any> = {}

  for (const product of normalized) {
    if (!groupedProducts[product.category]) {
      groupedProducts[product.category] = {
        title: CATEGORY_META[product.category]?.title ?? product.category,
        description: CATEGORY_META[product.category]?.description ?? '',
        subcategories: {},
      }
    }
    if (!groupedProducts[product.category].subcategories[product.section]) {
      groupedProducts[product.category].subcategories[product.section] = []
    }
    groupedProducts[product.category].subcategories[product.section].push(product)
  }

  const mergeKnownSubcategories = (catKey: string) => {
    const meta = CATEGORY_META[catKey]
    if (!meta) return
    if (!groupedProducts[catKey]) {
      groupedProducts[catKey] = {
        title: meta.title,
        description: meta.description,
        subcategories: {},
      }
    }
    const subs = CATEGORY_SUBCATEGORY_SLUGS[catKey]
    if (!subs?.length) return
    const ordered: Record<string, CatalogProduct[]> = {}
    for (const s of subs) {
      ordered[s] = groupedProducts[catKey].subcategories[s] ?? []
    }
    for (const k of Object.keys(groupedProducts[catKey].subcategories)) {
      if (ordered[k] === undefined) {
        ordered[k] = groupedProducts[catKey].subcategories[k]
      }
    }
    groupedProducts[catKey].subcategories = ordered
  }

  if (category && CATEGORY_META[category]) {
    mergeKnownSubcategories(category)
  } else {
    for (const catKey of Object.keys(groupedProducts)) {
      mergeKnownSubcategories(catKey)
    }
  }

  return applyProductCacheHeaders(NextResponse.json({ products: groupedProducts }), { privateNoStore })
}

export async function POST(request: Request) {
  const body = await request.json()
  const inv = resolveInventoryFromBody(body)

  const created = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        ...(body.id ? { id: String(body.id) } : {}),
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
          create: (body.images ?? []).map((url: string, index: number) => ({
            url,
            sortOrder: index,
          })),
        },
      },
    })
    await replaceProductVariants(tx, product.id, inv.variants)
    return tx.product.findUnique({
      where: { id: product.id },
      include: productIncludeVariants,
    })
  })

  if (!created) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }

  const res = NextResponse.json(toCatalogProduct(created), { status: 201 })
  res.headers.set('Cache-Control', 'no-store')
  return res
}
