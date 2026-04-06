import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { prismaOrderToClientOrder } from '@/lib/orders/prisma-order-map'
import { notifyOrderDelivered, notifyOrderReady } from '@/lib/orders/notify-customer-order'
import type { OrderStatus } from '@prisma/client'

type PatchBody = {
  action: 'start_progress' | 'mark_ready' | 'delivered' | 'cancel_order'
}

const STEPS: Record<
  Exclude<PatchBody['action'], 'cancel_order'>,
  { from: OrderStatus; to: OrderStatus; notify: boolean }
> = {
  start_progress: { from: 'pending', to: 'confirmed', notify: false },
  mark_ready: { from: 'confirmed', to: 'dispatched', notify: true },
  delivered: { from: 'dispatched', to: 'delivered', notify: true },
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = (await request.json()) as PatchBody
    const action = body?.action

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (action === 'cancel_order') {
      if (existing.status !== 'pending') {
        return NextResponse.json(
          { error: 'Only pending orders can be cancelled' },
          { status: 409 }
        )
      }
      const updated = await prisma.order.update({
        where: { id },
        data: { status: 'cancelled' },
        include: { items: { orderBy: { createdAt: 'asc' } } },
      })
      const order = prismaOrderToClientOrder(updated)
      const res = NextResponse.json(order)
      res.headers.set('Cache-Control', 'no-store')
      return res
    }

    const step = action ? STEPS[action as Exclude<PatchBody['action'], 'cancel_order'>] : undefined
    if (!step) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (existing.status !== step.from) {
      return NextResponse.json(
        { error: `Order is not in the expected state (${step.from})` },
        { status: 409 }
      )
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: step.to },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    })

    const order = prismaOrderToClientOrder(updated)

    if (step.notify) {
      try {
        if (step.to === 'dispatched') {
          await notifyOrderReady(order)
        } else if (step.to === 'delivered') {
          await notifyOrderDelivered(order)
        }
      } catch (notifyErr) {
        console.error('[api/orders] notify failed', notifyErr)
      }
    }

    const res = NextResponse.json(order)
    res.headers.set('Cache-Control', 'no-store')
    return res
  } catch (e) {
    console.error('[api/orders] PATCH', e)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
