import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/password'

export async function POST(request: Request) {
  const body = await request.json()
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')

  const invalid = NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  invalid.headers.set('Cache-Control', 'no-store')

  if (!email || !password) return invalid

  const user = await prisma.user.findUnique({
    where: { email },
    include: { reviews: { orderBy: { createdAt: 'desc' } } },
  })
  if (!user) return invalid
  if (!verifyPassword(password, user.passwordHash)) return invalid
  if (!user.isActive) {
    const blocked = NextResponse.json({ error: 'Account is deactivated. Contact support.' }, { status: 403 })
    blocked.headers.set('Cache-Control', 'no-store')
    return blocked
  }

  const res = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      createdAt: user.createdAt.toISOString(),
      profileImage: user.profileImageUrl ?? undefined,
      isActive: user.isActive,
      lastViewedItems: user.lastViewedProductIds ?? [],
      reviews: user.reviews.map((r) => ({
        id: r.id,
        text: r.text,
        rating: r.rating,
        createdAt: r.createdAt.toISOString(),
        productId: r.productId ?? undefined,
        productName: r.productName ?? undefined,
      })),
    },
  })
  res.headers.set('Cache-Control', 'no-store')
  return res
}
