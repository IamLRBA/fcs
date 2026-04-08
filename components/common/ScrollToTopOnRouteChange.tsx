'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function ScrollToTopOnRouteChange() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const run = () => {
      const hash = window.location.hash?.replace('#', '')
      if (hash) {
        const target = document.getElementById(hash)
        if (target) {
          target.scrollIntoView({ behavior: 'auto', block: 'start' })
          return
        }
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }

    requestAnimationFrame(run)
  }, [pathname, searchParams])

  return null
}
