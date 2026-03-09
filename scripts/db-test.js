/**
 * Prisma connectivity smoke test.
 *
 * Usage:
 * 1) Ensure .env has DATABASE_URL and DB is reachable
 * 2) Run migrations: npx prisma migrate dev --name init
 * 3) (Optional) seed products
 * 4) Run: node scripts/db-test.js
 */

const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const products = await prisma.product.findMany({ take: 5 })
    console.log(`Connected. Found ${products.length} product(s).`)
    console.log(products.map((p) => ({ id: p.id, sku: p.sku, name: p.name, stockQty: p.stockQty })))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('DB test failed:', err)
  process.exitCode = 1
})

