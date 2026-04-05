import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/password'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const newPassword = String(body.newPassword || '')
  if (newPassword.length < 6) {
    const bad = NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    bad.headers.set('Cache-Control', 'private, no-store, must-revalidate')
    return bad
  }

  await prisma.user.update({
    where: { id },
    data: { passwordHash: hashPassword(newPassword) },
  })

  const res = NextResponse.json({ ok: true })
  res.headers.set('Cache-Control', 'private, no-store, must-revalidate')
  return res
}
