'use client'

import { useRef, useEffect, useState, type RefObject } from 'react'
import {
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  type MotionValue,
  type MotionStyle,
} from 'framer-motion'
import {
  SCROLL_SCALE_OFFSETS,
  SCROLL_SCALE_PEAK,
  SCROLL_SCALE_REST_MIN,
  HERO_EXIT_MIN_SCALE,
  HERO_EXIT_Y,
  type ScrollScaleVariant,
  type ScrollScaleIntensity,
  type ScrollScaleMode,
} from '@/lib/motion/scroll-scale'

export interface UseScrollScaleOptions {
  variant?: ScrollScaleVariant
  intensity?: ScrollScaleIntensity
  /** peak: 1 → peak → 1; rest: min → 1 → min (never larger than natural layout) */
  scaleMode?: ScrollScaleMode
  offset?: readonly [string, string]
  /** Hero exit: disable scroll-linked motion below md */
  disableOnMobile?: boolean
  /** Spring-smooth scroll progress for less choppy scale updates */
  smooth?: boolean
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
    scaleMode = 'peak',
    offset,
    disableOnMobile = false,
    smooth = false,
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

  const springProgress = useSpring(scrollYProgress, {
    stiffness: smooth ? 90 : 1000,
    damping: smooth ? 28 : 100,
    restDelta: 0.0005,
  })
  const progress = smooth ? springProgress : scrollYProgress

  const peak = SCROLL_SCALE_PEAK[intensity]
  const restMin = SCROLL_SCALE_REST_MIN[intensity]

  const peakScale = useTransform(
    progress,
    variant === 'centerPeak' ? [0, 0.5, 1] : [0, 1],
    variant === 'centerPeak' ? [1, peak, 1] : [1, heroMinScale]
  )
  const restScale = useTransform(progress, [0, 0.5, 1], [restMin, 1, restMin])
  const scale =
    variant === 'centerPeak' && scaleMode === 'rest' ? restScale : peakScale

  const y = useTransform(progress, [0, 1], [0, heroExitY])

  const style: MotionStyle | undefined = enabled
    ? variant === 'heroExit'
      ? { scale, y, transformOrigin: 'center center' }
      : { scale, transformOrigin: 'center center' }
    : undefined

  return { ref, style, scrollYProgress, enabled }
}
