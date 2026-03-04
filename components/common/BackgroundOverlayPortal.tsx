'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import BlurredImageBackground from './BlurredImageBackground'

/**
 * Shared full-bleed style for both background and overlay so they have identical edges,
 * stay fixed to the viewport (no scroll), and cover the entire screen with no gaps.
 * Small overshoot (2px each side) eliminates sub-pixel gaps at screen edges.
 */
const fullBleedStyle: React.CSSProperties = {
  position: 'fixed',
  top: -2,
  left: -2,
  right: -2,
  bottom: -2,
  width: 'calc(100% + 4px)',
  height: 'calc(100% + 4px)',
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
  minWidth: 'calc(100% + 4px)',
  minHeight: 'calc(100% + 4px)',
}

export default function BackgroundOverlayPortal() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <>
      <div style={{ ...fullBleedStyle, zIndex: 0, overflow: 'hidden' }}>
        <BlurredImageBackground />
      </div>
      <div
        aria-hidden
        style={{
          ...fullBleedStyle,
          zIndex: 1,
          pointerEvents: 'none',
          backgroundColor: 'var(--color-bg-page-overlay)',
        }}
      />
      {/* Dark mode only: corner glows on top of overlay (same as home page) */}
      <div
        aria-hidden
        className="hidden dark:block"
        style={{
          ...fullBleedStyle,
          zIndex: 2,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-48 -right-48 w-[28rem] h-[28rem] bg-gradient-to-br from-accent-200/40 to-accent-400/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-48 -left-48 w-[32rem] h-[32rem] bg-gradient-to-br from-primary-300/40 to-primary-500/40 rounded-full blur-3xl"
        />
      </div>
    </>,
    document.body
  )
}
