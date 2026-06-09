'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import {
  getHeroEntranceMotion,
  type HeroEntranceRole,
  type HeroEntranceVariant,
} from '@/lib/motion/hero-entrance'

type HeroEntranceContextValue = {
  variant: HeroEntranceVariant
  started: boolean
  instant: boolean
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
}

export function HeroEntrance({ variant, children, className, ready = true }: HeroEntranceProps) {
  const reduceMotion = useReducedMotion()
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!ready) {
      setStarted(false)
      return
    }
    setStarted(true)
  }, [ready])

  return (
    <HeroEntranceContext.Provider
      value={{ variant, started, instant: Boolean(reduceMotion) }}
    >
      <div className={className}>{children}</div>
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
  const { variant, started, instant } = useHeroEntranceContext()
  const motionProps = getHeroEntranceMotion(variant, role, { started, instant, index })

  return (
    <motion.div className={className} {...motionProps} {...rest}>
      {children}
    </motion.div>
  )
}

HeroEntrance.Piece = HeroEntrancePiece
