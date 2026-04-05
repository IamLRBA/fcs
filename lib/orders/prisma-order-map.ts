import type { Order, CartItem } from '@/lib/cart'
import type { Order as PrismaOrder, OrderItem as PrismaOrderItem } from '@prisma/client'

export type PrismaOrderWithItems = PrismaOrder & { items: PrismaOrderItem[] }

export function prismaOrderToClientOrder(row: PrismaOrderWithItems): Order {
  const items: CartItem[] = row.items.map((i) => ({
    id: i.id,
    productId: i.productId ?? i.id,
    name: i.productName,
    price: i.priceUgx,
    size: i.size ?? undefined,
    color: i.color ?? undefined,
    quantity: i.quantity,
    image: i.imageUrl ?? '/assets/images/placeholder.jpg',
    sku: i.sku,
  }))

  return {
    id: row.id,
    timestamp: row.createdAt.toISOString(),
    customer: {
      fullName: row.customerFullName,
      email: row.customerEmail,
      phone: row.customerPhone,
      address: {
        street: row.addressStreet,
        city: row.addressCity,
      },
    },
    items,
    subtotal: row.subtotalUgx,
    deliveryFee: row.deliveryFeeUgx,
    total: row.totalUgx,
    deliveryOption: row.deliveryOption === 'kampala' ? 'kampala' : 'outside',
    notes: row.notes ?? undefined,
    status: row.status as Order['status'],
  }
}
