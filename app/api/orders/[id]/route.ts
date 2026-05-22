import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { fulfillDeliveredOrderItems } from '@/lib/catalog/fulfill-order'
import { prismaOrderToClientOrder } from '@/lib/orders/prisma-order-map'
import {
  notifyOrderDelivered,
  notifyOrderProcessing,
  notifyOrderReady,
} from '@/lib/orders/notify-customer-order'
import type { OrderStatus, RemovalReason } from '@prisma/client'

const CANCELLABLE: OrderStatus[] = ['pending', 'confirmed', 'dispatched']
const VALID_CANCEL_REASONS: RemovalReason[] = [
  'PRODUCT_BOUGHT',
  'MISTAKENLY_POSTED',
  'DISCONTINUED',
]

type PatchBody = {
  action: 'start_progress' | 'mark_ready' | 'delivered' | 'cancel_order' | 'undo_cancel'
  /** Required when action is cancel_order; same enum as product removal reasons. */
  reason?: RemovalReason | string
}

const STEPS: Record<
  Exclude<PatchBody['action'], 'cancel_order' | 'undo_cancel'>,
  { from: OrderStatus; to: OrderStatus; notify: boolean }
> = {
  start_progress: { from: 'pending', to: 'confirmed', notify: true },
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
      if (!CANCELLABLE.includes(existing.status)) {
        return NextResponse.json(
          { error: 'Only orders not yet delivered can be deleted' },
          { status: 409 }
        )
      }
      const r = body?.reason
      if (!r || !VALID_CANCEL_REASONS.includes(r as RemovalReason)) {
        return NextResponse.json({ error: 'A valid reason is required' }, { status: 400 })
      }
      const reason = r as RemovalReason
      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: 'cancelled',
          statusBeforeCancel: existing.status,
          cancellationReason: reason,
        },
        include: { items: { orderBy: { createdAt: 'asc' } } },
      })
      const order = prismaOrderToClientOrder(updated)
      const res = NextResponse.json(order)
      res.headers.set('Cache-Control', 'no-store')
      return res
    }

    if (action === 'undo_cancel') {
      if (existing.status !== 'cancelled') {
        return NextResponse.json(
          { error: 'Only cancelled orders can be restored' },
          { status: 409 }
        )
      }
      const back = existing.statusBeforeCancel ?? 'pending'
      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: back,
          statusBeforeCancel: null,
          cancellationReason: null,
        },
        include: { items: { orderBy: { createdAt: 'asc' } } },
      })
      const order = prismaOrderToClientOrder(updated)
      const res = NextResponse.json(order)
      res.headers.set('Cache-Control', 'no-store')
      return res
    }

    const step = action
      ? STEPS[action as Exclude<PatchBody['action'], 'cancel_order' | 'undo_cancel'>]
      : undefined
    if (!step) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (existing.status !== step.from) {
      return NextResponse.json(
        { error: `Order is not in the expected state (${step.from})` },
        { status: 409 }
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.order.update({
        where: { id },
        data: { status: step.to },
        include: { items: { orderBy: { createdAt: 'asc' } } },
      })

      if (step.to === 'delivered') {
        await fulfillDeliveredOrderItems(tx, u.items, u.id)
      }

      return u
    })

    const orderRow =
      step.to === 'delivered'
        ? await prisma.order.findUniqueOrThrow({
            where: { id },
            include: { items: { orderBy: { createdAt: 'asc' } } },
          })
        : updated

    const order = prismaOrderToClientOrder(orderRow)

    if (step.notify) {
      try {
        if (step.to === 'confirmed') {
          await notifyOrderProcessing(order)
        } else if (step.to === 'dispatched') {
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
