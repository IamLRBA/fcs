'use client'

import { motion, useSpring, useTransform, useReducedMotion, type MotionValue } from 'framer-motion'
import type { ReactNode } from 'react'
import {
  LAG_SPRING,
  LAG_TRAVEL,
  STRETCH_GAIN,
  type HeroScrollLagTier,
} from '@/lib/motion/hero-scroll-lag'

type HeroScrollLagLayerProps = {
  tier: HeroScrollLagTier
  scrollYProgress: MotionValue<number>
  children: ReactNode
  className?: string
}

/**
 * Scroll-linked elastic lag: when the hero scrolls, this layer stays slightly
 * behind then springs forward to catch up (rubber-band stretch on the way).
 */
export default function HeroScrollLagLayer({
  tier,
  scrollYProgress,
  children,
  className,
}: HeroScrollLagLayerProps) {
  const reduceMotion = useReducedMotion()
  const springConfig = LAG_SPRING[tier]

  const laggedProgress = useSpring(scrollYProgress, {
    stiffness: springConfig.stiffness,
    damping: springConfig.damping,
    mass: springConfig.mass,
    restDelta: 0.0008,
  })

  const lagY = useTransform(
    [scrollYProgress, laggedProgress],
    ([fast, slow]) => (Number(fast) - Number(slow)) * LAG_TRAVEL[tier]
  )

  const scaleY = useTransform([scrollYProgress, laggedProgress], ([fast, slow]) => {
    const diff = Number(fast) - Number(slow)
    const gain = STRETCH_GAIN[tier]
    return 1 + Math.min(0.16, Math.max(-0.05, diff * gain))
  })

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      style={{
        y: lagY,
        scaleY,
        transformOrigin: 'center top',
      }}
    >
      {children}
    </motion.div>
  )
}
