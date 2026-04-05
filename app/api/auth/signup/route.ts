import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/password'

export async function POST(request: Request) {
  const body = await request.json()
  const email = String(body.email || '').trim().toLowerCase()
  const fullName = String(body.fullName || '').trim()
  const phone = String(body.phone || '').trim()
  const password = String(body.password || '')
  const profileImageUrl = body.profileImageUrl ? String(body.profileImageUrl) : null

  if (!email || !fullName || !phone || password.length < 6) {
    const bad = NextResponse.json({ error: 'Invalid signup payload' }, { status: 400 })
    bad.headers.set('Cache-Control', 'no-store')
    return bad
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    const conflict = NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    conflict.headers.set('Cache-Control', 'no-store')
    return conflict
  }

  const created = await prisma.user.create({
    data: {
      email,
      fullName,
      phone,
      profileImageUrl,
      passwordHash: hashPassword(password),
      isActive: true,
    },
  })

  const res = NextResponse.json({
    user: {
      id: created.id,
      email: created.email,
      fullName: created.fullName,
      phone: created.phone,
      createdAt: created.createdAt.toISOString(),
      profileImage: created.profileImageUrl ?? undefined,
      isActive: created.isActive,
      lastViewedItems: created.lastViewedProductIds ?? [],
      reviews: [],
    },
  })
  res.headers.set('Cache-Control', 'no-store')
  return res
}
