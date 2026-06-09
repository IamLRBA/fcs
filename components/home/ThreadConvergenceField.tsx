'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

/** Curved thread paths converging on the hero center (viewBox 0 0 100 100). */
const THREAD_PATHS = [
  'M -2 8 C 18 22, 32 38, 50 50',
  'M 102 12 C 82 26, 68 40, 50 50',
  'M -2 92 C 20 78, 34 62, 50 50',
  'M 102 88 C 80 74, 66 58, 50 50',
  'M 8 -2 C 22 18, 36 34, 50 50',
  'M 92 -2 C 78 18, 64 34, 50 50',
  'M 8 102 C 24 82, 38 66, 50 50',
  'M 92 102 C 76 82, 62 66, 50 50',
  'M 50 -4 C 50 18, 50 34, 50 50',
  'M 50 104 C 50 82, 50 66, 50 50',
] as const

type ThreadConvergenceFieldProps = {
  active: boolean
}

export default function ThreadConvergenceField({ active }: ThreadConvergenceFieldProps) {
  const reduceMotion = useReducedMotion()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!active || reduceMotion) {
      setShow(false)
      return
    }
    setShow(true)
    const hide = window.setTimeout(() => setShow(false), 2800)
    return () => window.clearTimeout(hide)
  }, [active, reduceMotion])

  if (reduceMotion || !show) return null

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 2.8, times: [0, 0.08, 0.72, 1], ease: 'easeInOut' }}
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <radialGradient id="loom-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-accent-400)" stopOpacity="0.35" />
            <stop offset="55%" stopColor="var(--color-primary-400)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {THREAD_PATHS.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            strokeWidth={0.22}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.85, 0.55] }}
            transition={{
              pathLength: { duration: 1.1, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 1.4, delay: i * 0.05 },
            }}
            style={{
              stroke: i % 2 === 0 ? 'var(--color-primary-500)' : 'var(--color-accent-500)',
              opacity: 0.45,
            }}
          />
        ))}

        <motion.circle
          cx="50"
          cy="50"
          r="0"
          fill="url(#loom-glow)"
          initial={{ r: 0, opacity: 0 }}
          animate={{ r: [0, 14, 22, 0], opacity: [0, 0.9, 0.5, 0] }}
          transition={{ duration: 1.6, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      {/* Golden thread sparks where paths meet */}
      {[...Array(6)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-[42%] h-1 w-1 rounded-full bg-accent-400/80 dark:bg-accent-300/70"
          initial={{ opacity: 0, scale: 0, x: '-50%', y: '-50%' }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.4, 0],
            x: `calc(-50% + ${Math.cos((i / 6) * Math.PI * 2) * 48}px)`,
            y: `calc(-50% + ${Math.sin((i / 6) * Math.PI * 2) * 32}px)`,
          }}
          transition={{ duration: 0.9, delay: 0.95 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </motion.div>
  )
}
