'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollToTopOnRouteChange() {
  const pathname = usePathname()

  useEffect(() => {
    const run = (behavior: ScrollBehavior = 'auto') => {
      const hash = window.location.hash?.replace('#', '')
      if (hash) {
        const target = document.getElementById(hash)
        if (target) {
          target.scrollIntoView({ behavior, block: 'start' })
          return
        }
      }
      window.scrollTo({ top: 0, left: 0, behavior })
    }

    const rafId = window.requestAnimationFrame(() => run('auto'))
    const onHashChange = () => run('smooth')
    window.addEventListener('hashchange', onHashChange)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [pathname])

  return null
}
