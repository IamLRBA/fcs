import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Public aggregate for marketing stats (no PII).
 * Matches admin dashboard "Items Sold": sum of quantities on delivered orders.
 */
export async function GET() {
  try {
    const agg = await prisma.orderItem.aggregate({
      _sum: { quantity: true },
      where: { order: { status: 'delivered' } },
    })
    const deliveredLineItemsQty = agg._sum.quantity ?? 0
    const res = NextResponse.json({ deliveredLineItemsQty })
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    return res
  } catch (e) {
    console.error('[api/stats/public]', e)
    const res = NextResponse.json({ deliveredLineItemsQty: 0 })
    res.headers.set('Cache-Control', 'no-store')
    return res
  }
}
