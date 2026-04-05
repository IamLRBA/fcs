import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      createdAt: true,
      isActive: true,
      profileImageUrl: true,
      _count: { select: { orders: true, reviews: true } },
    },
  })

  const res = NextResponse.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone,
      createdAt: u.createdAt.toISOString(),
      isActive: u.isActive,
      profileImage: u.profileImageUrl ?? undefined,
      ordersCount: u._count.orders,
      reviewsCount: u._count.reviews,
    }))
  )
  res.headers.set('Cache-Control', 'private, no-store, must-revalidate')
  return res
}
