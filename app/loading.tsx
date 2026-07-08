'use client'

import { useEffect, useState } from 'react'
import { SkeletonHomeHero } from '@/components/ui/Skeleton'

const VISITED_KEY = 'mysticalpieces-visited'


export default function Loading() {
  const [showSkeleton, setShowSkeleton] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // After mount, if they've already been here, skeleton is appropriate when navigating back
    setShowSkeleton(!!localStorage.getItem(VISITED_KEY))
  }, [])

  if (!showSkeleton) {
    return (
      <div className="min-h-screen bg-unified relative overflow-hidden" aria-hidden />
    )
  }

  return <SkeletonHomeHero />
}
