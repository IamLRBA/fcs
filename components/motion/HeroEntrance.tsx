'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useReducedMotion, type HTMLMotionProps, type MotionValue } from 'framer-motion'
import {
  getHeroEntranceMotion,
  type HeroEntranceRole,
  type HeroEntranceVariant,
} from '@/lib/motion/hero-entrance'
import { getHeroRoleLagTier } from '@/lib/motion/hero-scroll-lag'
import HeroScrollLagLayer from './HeroScrollLagLayer'
import { useHeroScroll } from '@/hooks/useHeroScroll'

type HeroEntranceContextValue = {
  variant: HeroEntranceVariant
  started: boolean
  instant: boolean
  scrollLag: boolean
  scrollYProgress: MotionValue<number>
}

const HeroEntranceContext = createContext<HeroEntranceContextValue | null>(null)

function useHeroEntranceContext() {
  const ctx = useContext(HeroEntranceContext)
  if (!ctx) {
    throw new Error('HeroEntrance.Piece must be used within HeroEntrance')
  }
  return ctx
}

export type HeroEntranceProps = {
  variant: HeroEntranceVariant
  children: ReactNode
  className?: string
  /** When false, entrance waits (e.g. first-visit loader). Defaults to true. */
  ready?: boolean
  /** Scroll-linked elastic lag on lower hero pieces. Defaults to true. */
  scrollLag?: boolean
}

export function HeroEntrance({
  variant,
  children,
  className,
  ready = true,
  scrollLag = true,
}: HeroEntranceProps) {
  const reduceMotion = useReducedMotion()
  const [started, setStarted] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useHeroScroll(sectionRef)
  const lagActive = scrollLag && !reduceMotion

  useEffect(() => {
    if (!ready) {
      setStarted(false)
      return
    }
    setStarted(true)
  }, [ready])

  return (
    <HeroEntranceContext.Provider
      value={{
        variant,
        started,
        instant: Boolean(reduceMotion),
        scrollLag: lagActive,
        scrollYProgress,
      }}
    >
      <div ref={sectionRef} className={className}>
        {children}
      </div>
    </HeroEntranceContext.Provider>
  )
}

type HeroEntrancePieceProps = {
  role: HeroEntranceRole
  index?: number
  children?: ReactNode
  className?: string
} & Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'transition'>

export function HeroEntrancePiece({
  role,
  index = 0,
  children,
  className,
  ...rest
}: HeroEntrancePieceProps) {
  const { variant, started, instant, scrollLag, scrollYProgress } = useHeroEntranceContext()
  const motionProps = getHeroEntranceMotion(variant, role, { started, instant, index })
  const lagTier = scrollLag ? getHeroRoleLagTier(role) : null

  const piece = (
    <motion.div className={lagTier ? undefined : className} {...motionProps} {...rest}>
      {children}
    </motion.div>
  )

  if (!lagTier) {
    return piece
  }

  return (
    <HeroScrollLagLayer tier={lagTier} scrollYProgress={scrollYProgress} className={className}>
      {piece}
    </HeroScrollLagLayer>
  )
}

HeroEntrance.Piece = HeroEntrancePiece
