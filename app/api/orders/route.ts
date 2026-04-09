import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { prismaOrderToClientOrder } from '@/lib/orders/prisma-order-map'
import { notifyNewOrderPlaced } from '@/lib/orders/notify-new-order'

export async function GET() {
  try {
    const rows = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: { orderBy: { createdAt: 'asc' } },
      },
    })
    const orders = rows.map(prismaOrderToClientOrder)
    const res = NextResponse.json(orders)
    res.headers.set('Cache-Control', 'private, no-store, must-revalidate')
    return res
  } catch (e) {
    console.error('[api/orders] GET', e)
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 503 })
  }
}

type PostBody = {
  userId?: string | null
  customer: {
    fullName: string
    email: string
    phone: string
    address: { street: string; city: string }
  }
  items: Array<{
    productId?: string
    name: string
    price: number
    size?: string
    color?: string
    quantity: number
    image?: string
    sku: string
  }>
  subtotal: number
  deliveryFee: number
  total: number
  deliveryOption: 'kampala' | 'outside'
  notes?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PostBody
    if (
      !body.customer?.fullName ||
      !body.customer?.email ||
      !body.customer?.phone ||
      !body.customer?.address?.street ||
      !body.customer?.address?.city ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 })
    }

    const deliveryOption = body.deliveryOption === 'outside' ? 'outside' : 'kampala'

    const created = await prisma.order.create({
      data: {
        userId: body.userId || null,
        status: 'pending',
        deliveryOption,
        subtotalUgx: Math.round(Number(body.subtotal)),
        deliveryFeeUgx: Math.round(Number(body.deliveryFee)),
        totalUgx: Math.round(Number(body.total)),
        notes: body.notes?.trim() || null,
        customerFullName: body.customer.fullName.trim(),
        customerEmail: body.customer.email.trim(),
        customerPhone: body.customer.phone.trim(),
        addressStreet: body.customer.address.street.trim(),
        addressCity: body.customer.address.city.trim(),
        items: {
          create: body.items.map((item) => ({
            productId: item.productId || null,
            productName: item.name,
            sku: item.sku,
            size: item.size?.trim() || null,
            color: item.color?.trim() || null,
            quantity: Math.max(1, Math.round(Number(item.quantity))),
            priceUgx: Math.round(Number(item.price)),
            imageUrl: item.image?.trim() || null,
          })),
        },
      },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    })

    const order = prismaOrderToClientOrder(created)
    void notifyNewOrderPlaced(order)
    const res = NextResponse.json(order, { status: 201 })
    res.headers.set('Cache-Control', 'no-store')
    return res
  } catch (e) {
    console.error('[api/orders] POST', e)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
