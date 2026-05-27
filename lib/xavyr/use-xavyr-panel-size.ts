'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'xavyr-panel-size'

export type PanelSize = { width: number; height: number }

export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

import { introOrPanelBottomCss } from '@/lib/xavyr/floating-layout'

/** Panel stacks above FAB; use scrolled offset for max-height safety */
export const XAVYR_PANEL_BOTTOM_OFFSET = introOrPanelBottomCss(true)

function getDefaultSize(): PanelSize {
  if (typeof window === 'undefined') return { width: 352, height: 480 }
  const vw = window.innerWidth
  const vh = window.innerHeight
  const reservedBottom = 9 * 16 + 16
  return {
    width: Math.min(352, vw - 32),
    height: Math.min(480, vh - reservedBottom),
  }
}

function getLimits(): { minW: number; maxW: number; minH: number; maxH: number } {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 400
  const vh = typeof window !== 'undefined' ? window.innerHeight : 700
  const reservedBottom = 9 * 16 + 24
  return {
    minW: Math.min(260, vw - 24),
    maxW: Math.min(vw < 640 ? vw - 20 : 560, vw - 16),
    minH: 280,
    maxH: Math.min(vh < 640 ? vh - reservedBottom : 680, vh - reservedBottom),
  }
}

function clampSize(size: PanelSize): PanelSize {
  const { minW, maxW, minH, maxH } = getLimits()
  return {
    width: Math.min(maxW, Math.max(minW, size.width)),
    height: Math.min(maxH, Math.max(minH, size.height)),
  }
}

export function useXavyrPanelSize(open: boolean) {
  const [size, setSize] = useState<PanelSize>(getDefaultSize)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as PanelSize
        if (parsed?.width && parsed?.height) {
          setSize(clampSize(parsed))
        }
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onResize = () => setSize((s) => clampSize(s))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [open])

  const persistSize = useCallback((next: PanelSize) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }, [])

  const startResize = useCallback(
    (edge: ResizeEdge, clientX: number, clientY: number) => {
      const startW = size.width
      const startH = size.height
      const startX = clientX
      const startY = clientY

      const onMove = (e: PointerEvent) => {
        let w = startW
        let h = startH
        const dx = e.clientX - startX
        const dy = e.clientY - startY

        if (edge.includes('e')) w = startW + dx
        if (edge.includes('w')) w = startW - dx
        if (edge.includes('s')) h = startH + dy
        if (edge.includes('n')) h = startH - dy

        const next = clampSize({ width: w, height: h })
        setSize(next)
      }

      const onUp = () => {
        setSize((s) => {
          persistSize(s)
          return s
        })
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [persistSize, size.height, size.width]
  )

  return { size, startResize }
}

export const RESIZE_CURSOR: Record<ResizeEdge, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
  sw: 'nesw-resize',
}
