'use client'

import { useRef, type RefObject } from 'react'
import {
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionStyle,
  type MotionValue,
} from 'framer-motion'
import { HERO_EXIT_MIN_SCALE, HERO_EXIT_Y } from '@/lib/motion/scroll-scale'

export function useHeroScroll<T extends HTMLElement = HTMLElement>(
  externalRef?: RefObject<T | null>
): {
  sectionRef: RefObject<T | null>
  scrollYProgress: MotionValue<number>
  heroExitStyle: MotionStyle | undefined
} {
  const internalRef = useRef<T | null>(null)
  const sectionRef = externalRef ?? internalRef
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, HERO_EXIT_MIN_SCALE])
  const y = useTransform(scrollYProgress, [0, 1], [0, HERO_EXIT_Y])

  const heroExitStyle: MotionStyle | undefined = reduceMotion
    ? undefined
    : { scale, y, transformOrigin: 'center center' }

  return { sectionRef, scrollYProgress, heroExitStyle }
}
