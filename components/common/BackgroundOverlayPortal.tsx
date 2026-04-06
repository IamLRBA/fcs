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

/** Full-viewport blurred image background + optional page overlay tint. */
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
    </div>,
    document.body
  )
}
