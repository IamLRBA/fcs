'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/** Product category pages handle hash + product query after catalog load. */
function isProductCategoryDeepLink(pathname: string, hash: string): boolean {
  return Boolean(hash && pathname.startsWith('/products/'))
}

export default function ScrollToTopOnRouteChange() {
  const pathname = usePathname()

  useEffect(() => {
    const hash = window.location.hash?.replace('#', '')?.trim()

    if (isProductCategoryDeepLink(pathname, hash)) {
      return
    }

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let attempt = 0

    const run = (behavior: ScrollBehavior): boolean => {
      if (hash) {
        const target = document.getElementById(hash)
        if (target) {
          target.scrollIntoView({ behavior, block: 'start' })
          return true
        }
        return false
      }
      window.scrollTo({ top: 0, left: 0, behavior })
      return true
    }

    const tick = () => {
      if (cancelled) return
      if (run(attempt === 0 ? 'auto' : 'smooth')) return
      if (hash && attempt++ < 60) {
        timer = setTimeout(tick, 50)
      }
    }

    const rafId = window.requestAnimationFrame(tick)
    const onHashChange = () => {
      attempt = 0
      tick()
    }
    window.addEventListener('hashchange', onHashChange)

    return () => {
      cancelled = true
      window.cancelAnimationFrame(rafId)
      if (timer) clearTimeout(timer)
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [pathname])

  return null
}
