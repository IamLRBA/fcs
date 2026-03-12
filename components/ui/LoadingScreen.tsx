'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onComplete: () => void
}

/**
 * First-visit loading – matches Home page light/dark: bg-unified + same accent/primary
 * atmosphere as main; tagline and status use hero subtitle–style colors.
 */
export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isComplete, setIsComplete] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true)
      setTimeout(() => {
        try {
          sessionStorage.setItem('mysticalpieces-home-reveal', '1')
        } catch (_) {}
        onComplete()
      }, 800)
    }, 3000)
    return () => clearTimeout(timer)
  }, [onComplete])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const update = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[60] bg-unified flex items-center justify-center overflow-hidden"
    >
      {/* Same atmospheric layer as Home (pointer-events-none) – light/dark via Tailwind */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-accent-200/30 to-accent-400/30 dark:from-accent-500/15 dark:to-accent-600/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-primary-300/30 to-primary-500/30 dark:from-primary-700/20 dark:to-primary-900/25 rounded-full blur-3xl"
        />
        {/* Subtle particles – visible in both modes */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                x: [0, 400, 0],
                y: [0, 300, 0],
                opacity: [0, 0.5, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 6 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.25,
                ease: 'easeInOut',
              }}
              className="absolute w-2 h-2 rounded-full bg-accent-400/50 dark:bg-accent-400/35"
              style={{
                left: `${(i * 7) % 100}%`,
                top: `${(i * 11) % 100}%`,
              }}
            />
          ))}
        </div>
        {/* Geometric accents like Home */}
        <motion.div
          animate={{ rotate: [0, 360], scale: [1, 1.15, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 left-1/4 w-16 h-16 border-2 border-primary-500/25 dark:border-primary-500/15 rounded-lg rotate-12"
        />
        <motion.div
          animate={{ rotate: [360, 0], scale: [1.15, 1, 1.15] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 right-1/4 w-20 h-20 border-2 border-accent-500/25 dark:border-accent-500/15 rounded-lg -rotate-12"
        />
      </div>

      {/* Content – z-10 so above atmosphere; text matches Home hero subtitle + headings */}
      <div className="relative z-10 text-center w-full max-w-lg px-6">
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="skeleton h-20 w-20 rounded-2xl opacity-90 dark:opacity-80" aria-hidden />
          <div className="space-y-3 w-full max-w-xs mx-auto">
            <div className="skeleton h-8 w-full rounded-lg opacity-80 dark:opacity-70" />
            <div className="skeleton h-4 w-[80%] mx-auto rounded opacity-70 dark:opacity-60" />
          </div>
        </div>

        {/* Tagline – light: lighter weight + softer color to blend; dark: muted darker so it recedes */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg md:text-xl font-extralight mb-8 max-w-md mx-auto leading-relaxed text-primary-600/90 dark:text-primary-500/75"
        >
          Wear the unseen... Feel the divine in every thread.
        </motion.p>

        {/* Progress track – light: soft; dark: darker/muted track + border so bar blends */}
        <div className="w-full max-w-xs h-2 rounded-full overflow-hidden mx-auto mb-6 bg-primary-200/60 border border-primary-300/35 dark:bg-neutral-900/70 dark:border-neutral-700/60">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: isComplete ? '100%' : '85%' }}
            transition={
              isComplete
                ? { duration: 0.4, ease: 'easeOut' }
                : { duration: 2.8, ease: 'easeInOut' }
            }
            className="h-full rounded-full skeleton opacity-90 dark:opacity-75 dark:[&::after]:opacity-50"
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-primary-600/85 dark:text-primary-500/55"
        >
          {isComplete ? 'Ready' : 'Loading…'}
        </motion.p>

        {/* Floating dots – readable on both backgrounds */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: dimensions.width > 0 ? (dimensions.width * (0.1 + i * 0.18)) % dimensions.width : 0,
                y: dimensions.height > 0 ? (dimensions.height * 0.3 + i * 40) % dimensions.height : 0,
                opacity: 0,
              }}
              animate={{
                opacity: dimensions.width > 0 ? [0.2, 0.45, 0.2] : 0,
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeInOut',
              }}
              className="absolute w-3 h-3 rounded-full bg-primary-600/25 dark:bg-primary-400/20"
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
