import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const data: {
    fullName?: string
    phone?: string
    profileImageUrl?: string | null
    isActive?: boolean
  } = {}

  if (typeof body.fullName === 'string') data.fullName = body.fullName.trim()
  if (typeof body.phone === 'string') data.phone = body.phone.trim()
  if (typeof body.isActive === 'boolean') data.isActive = body.isActive
  if ('profileImageUrl' in body) data.profileImageUrl = body.profileImageUrl ? String(body.profileImageUrl) : null

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      createdAt: true,
      isActive: true,
      profileImageUrl: true,
    },
  })

  const res = NextResponse.json({
    id: updated.id,
    email: updated.email,
    fullName: updated.fullName,
    phone: updated.phone,
    createdAt: updated.createdAt.toISOString(),
    isActive: updated.isActive,
    profileImage: updated.profileImageUrl ?? undefined,
  })
  res.headers.set('Cache-Control', 'private, no-store, must-revalidate')
  return res
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.user.delete({ where: { id } })
  const res = NextResponse.json({ ok: true })
  res.headers.set('Cache-Control', 'private, no-store, must-revalidate')
  return res
}
