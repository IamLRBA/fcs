import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/** Admin-facing counts of catalog removals by reason (e.g. sold via delivered orders). */
export async function GET() {
  try {
    const rows = await prisma.productRemoval.groupBy({
      by: ['reason'],
      _count: { _all: true },
    })
    const byReason = Object.fromEntries(rows.map((r) => [r.reason, r._count._all])) as Record<string, number>
    const res = NextResponse.json({
      PRODUCT_BOUGHT: byReason.PRODUCT_BOUGHT ?? 0,
      MISTAKENLY_POSTED: byReason.MISTAKENLY_POSTED ?? 0,
      DISCONTINUED: byReason.DISCONTINUED ?? 0,
    })
    res.headers.set('Cache-Control', 'private, no-store, must-revalidate')
    return res
  } catch (e) {
    console.error('[api/product-removals/summary] GET', e)
    return NextResponse.json({ error: 'Failed to load removal summary' }, { status: 503 })
  }
}
