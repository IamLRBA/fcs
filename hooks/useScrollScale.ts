'use client'

import { useRef, useEffect, useState, type RefObject } from 'react'
import {
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
  type MotionStyle,
} from 'framer-motion'
import {
  SCROLL_SCALE_OFFSETS,
  SCROLL_SCALE_PEAK,
  HERO_EXIT_MIN_SCALE,
  HERO_EXIT_Y,
  type ScrollScaleVariant,
  type ScrollScaleIntensity,
} from '@/lib/motion/scroll-scale'

export interface UseScrollScaleOptions {
  variant?: ScrollScaleVariant
  intensity?: ScrollScaleIntensity
  offset?: readonly [string, string]
  /** Hero exit: disable scroll-linked motion below md */
  disableOnMobile?: boolean
  heroMinScale?: number
  heroExitY?: number
}

export interface ScrollScaleMotionResult {
  ref: RefObject<HTMLElement | null>
  style: MotionStyle | undefined
  scrollYProgress: MotionValue<number>
  enabled: boolean
}

export function useScrollScale(options: UseScrollScaleOptions = {}): ScrollScaleMotionResult {
  const {
    variant = 'centerPeak',
    intensity = 'normal',
    offset,
    disableOnMobile = false,
    heroMinScale = HERO_EXIT_MIN_SCALE,
    heroExitY = HERO_EXIT_Y,
  } = options

  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const [mobileDisabled, setMobileDisabled] = useState(false)

  useEffect(() => {
    if (!disableOnMobile || typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 768px)')
    const sync = () => setMobileDisabled(!mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [disableOnMobile])

  const enabled = !reduceMotion && !mobileDisabled
  const resolvedOffset = offset ?? SCROLL_SCALE_OFFSETS[variant]

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: resolvedOffset as ['start end', 'end start'],
  })

  const peak = SCROLL_SCALE_PEAK[intensity]

  const scale = useTransform(
    scrollYProgress,
    variant === 'centerPeak' ? [0, 0.5, 1] : [0, 1],
    variant === 'centerPeak' ? [1, peak, 1] : [1, heroMinScale]
  )

  const y = useTransform(scrollYProgress, [0, 1], [0, heroExitY])

  const style: MotionStyle | undefined = enabled
    ? variant === 'heroExit'
      ? { scale, y, transformOrigin: 'center center' }
      : { scale, transformOrigin: 'center center' }
    : undefined

  return { ref, style, scrollYProgress, enabled }
}
