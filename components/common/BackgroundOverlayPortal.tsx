'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import BlurredImageBackground from './BlurredImageBackground'

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

/**
 * Static gradient accents (no infinite motion, no blur-3xl) to cut compositor cost.
 */
export default function BackgroundOverlayPortal() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || typeof document === 'undefined') {
    return null
  }

  const overlayStyle: React.CSSProperties = {
    ...fullBleedStyle,
    zIndex: 1,
    pointerEvents: 'none',
    backgroundColor: 'var(--color-bg-page-overlay)',
    display: 'block',
  }

  return createPortal(
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div style={{ ...fullBleedStyle, zIndex: 0, overflow: 'hidden' }}>
        <BlurredImageBackground />
      </div>
      <span aria-hidden style={overlayStyle} />
      <div
        aria-hidden
        className="block dark:hidden"
        style={{ ...fullBleedStyle, zIndex: 2, pointerEvents: 'none', overflow: 'hidden' }}
      >
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-accent-200/25 to-accent-400/20 opacity-90" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-primary-300/20 to-primary-500/20 opacity-90" />
      </div>
      <div
        aria-hidden
        className="hidden dark:block"
        style={{ ...fullBleedStyle, zIndex: 2, pointerEvents: 'none', overflow: 'hidden' }}
      >
        <div className="absolute -top-40 -right-40 w-72 h-72 rounded-full bg-gradient-to-br from-accent-200/20 to-accent-400/15 opacity-90" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-primary-300/18 to-primary-500/18 opacity-90" />
      </div>
    </div>,
    document.body
  )
}
