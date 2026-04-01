'use client'

import { useEffect } from 'react'

let lockCount = 0
let savedScrollY = 0

function lockBodyScroll() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  if (lockCount === 0) {
    savedScrollY = window.scrollY
    const body = document.body
    body.style.position = 'fixed'
    body.style.top = `-${savedScrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'
  }

  lockCount += 1
}

function unlockBodyScroll() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  lockCount = Math.max(0, lockCount - 1)
  if (lockCount > 0) return

  const body = document.body
  const scrollY = savedScrollY
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  body.style.overflow = ''
  body.style.overscrollBehavior = ''
  window.scrollTo(0, savedScrollY)
}

export default function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    return
  }, [locked])
}
