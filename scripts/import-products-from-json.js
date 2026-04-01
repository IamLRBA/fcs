/**
 * One-time product import:
 * - Reads data/products.json
 * - Upserts products by SKU
 * - Replaces product images on each run (idempotent)
 *
 * Usage:
 *   node scripts/import-products-from-json.js
 */

const fs = require('fs')
const path = require('path')
const { loadEnvConfig } = require('@next/env')
loadEnvConfig(process.cwd())
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function loadProductsJson() {
  const jsonPath = path.join(process.cwd(), 'data', 'products.json')
  const raw = fs.readFileSync(jsonPath, 'utf-8')
  return JSON.parse(raw)
}

function flattenProducts(data) {
  const out = []
  const categories = data?.products || {}
  for (const [category, categoryData] of Object.entries(categories)) {
    const sub = categoryData?.subcategories || {}
    for (const [section, items] of Object.entries(sub)) {
      for (const item of items || []) {
        out.push({
          id: item.id,
          name: item.name || '',
          brand: item.brand || '',
          category: item.category || category,
          section: item.section || section,
          priceUgx: Number(item.price_ugx || 0),
          originalPriceUgx: item.original_price ? Number(item.original_price) : null,
          sizes: Array.isArray(item.sizes) ? item.sizes : [],
          colors: Array.isArray(item.colors) ? item.colors : [],
          images: Array.isArray(item.images) ? item.images : [],
          description: item.description || '',
          condition: item.condition || 'Like New',
          sku: item.sku || `${category}-${section}-${item.id || Date.now()}`,
          stockQty: Number(item.stock_qty || 0),
          isActive: item.isActive !== false,
        })
      }
    }
  }
  return out
}

async function upsertProduct(product) {
  await prisma.product.upsert({
    where: { sku: product.sku },
    update: {
      name: product.name,
      brand: product.brand,
      category: product.category,
      section: product.section,
      description: product.description,
      condition: product.condition,
      priceUgx: product.priceUgx,
      originalPriceUgx: product.originalPriceUgx,
      stockQty: product.stockQty,
      sizes: product.sizes,
      colors: product.colors,
      isActive: product.isActive,
      images: {
        deleteMany: {},
        create: product.images.map((url, index) => ({ url, sortOrder: index })),
      },
    },
    create: {
      name: product.name,
      brand: product.brand,
      category: product.category,
      section: product.section,
      description: product.description,
      condition: product.condition,
      sku: product.sku,
      priceUgx: product.priceUgx,
      originalPriceUgx: product.originalPriceUgx,
      stockQty: product.stockQty,
      sizes: product.sizes,
      colors: product.colors,
      isActive: product.isActive,
      images: {
        create: product.images.map((url, index) => ({ url, sortOrder: index })),
      },
    },
  })
}

async function main() {
  const data = loadProductsJson()
  const products = flattenProducts(data)

  let success = 0
  for (const p of products) {
    await upsertProduct(p)
    success += 1
  }

  console.log(`Imported ${success} products from data/products.json`)
}

main()
  .catch((error) => {
    console.error('Import failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
