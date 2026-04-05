import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const KEYLEN = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const digest = scryptSync(password, salt, KEYLEN).toString('hex')
  return `${salt}:${digest}`
}

export function verifyPassword(password: string, encoded: string): boolean {
  const [salt, storedDigest] = encoded.split(':')
  if (!salt || !storedDigest) return false
  const digest = scryptSync(password, salt, KEYLEN)
  const stored = Buffer.from(storedDigest, 'hex')
  if (digest.length !== stored.length) return false
  return timingSafeEqual(digest, stored)
}
