import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function applyProductCacheHeaders(res: NextResponse, opts: { privateNoStore: boolean }) {
  if (opts.privateNoStore) {
    res.headers.set('Cache-Control', 'private, no-store, must-revalidate')
  } else {
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  }
  return res
}

type CatalogProduct = {
  id: string
  name: string
  brand: string
  category: string
  section: string
  price_ugx: number
  original_price?: number
  sizes: string[]
  colors: string[]
  images: string[]
  description: string
  condition: string
  sku: string
  stock_qty: number
  isActive: boolean
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

function toCatalogProduct(product: any): CatalogProduct {
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

  const privateNoStore = includeInactive

  const where = {
    ...(category ? { category } : {}),
    ...(section ? { section } : {}),
    ...(includeInactive ? {} : { isActive: true }),
  }

  const orderBy = [{ category: 'asc' as const }, { section: 'asc' as const }, { createdAt: 'desc' as const }]

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
      condition: p.condition ?? 'Like New',
      sku: p.sku ?? '',
      stock_qty: p.stockQty,
      isActive: p.isActive,
    }))
    return applyProductCacheHeaders(NextResponse.json(normalized), { privateNoStore })
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy,
  })

  const normalized = products.map(toCatalogProduct)

  if (featured) {
    const byCategory = new Map<string, CatalogProduct>()
    for (const product of normalized) {
      if (!byCategory.has(product.category) && product.isActive) {
        byCategory.set(product.category, product)
      }
    }
    const featuredProducts = Array.from(byCategory.entries()).map(([slug, product]) => ({
      product,
      categoryName: CATEGORY_META[slug]?.title ?? slug,
      categorySlug: slug,
    }))
    return applyProductCacheHeaders(NextResponse.json(featuredProducts), { privateNoStore })
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

  return applyProductCacheHeaders(NextResponse.json({ products: groupedProducts }), { privateNoStore })
}

export async function POST(request: Request) {
  const body = await request.json()

  const created = await prisma.product.create({
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

  const res = NextResponse.json(toCatalogProduct(created), { status: 201 })
  res.headers.set('Cache-Control', 'no-store')
  return res
}
