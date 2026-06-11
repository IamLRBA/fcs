'use client'

import React, {
  forwardRef,
  type ReactNode,
  type Ref,
} from 'react'
import { motion } from 'framer-motion'
import { useScrollScale, type UseScrollScaleOptions } from '@/hooks/useScrollScale'
import type { ScrollScaleMode } from '@/lib/motion/scroll-scale'

type MotionTag = 'section' | 'div' | 'article' | 'main'

export type ScrollScaleProps = UseScrollScaleOptions & {
  as?: MotionTag
  children: ReactNode
  className?: string
  id?: string
  'aria-label'?: string
  /** Class on the inner scaled wrapper */
  innerClassName?: string
  /** Clip scale overflow and keep content within max-w-6xl margins (default true) */
  contain?: boolean
  /** Allow scaled content to extend toward viewport edges (e.g. testimonials) */
  edgeToEdge?: boolean
  scaleMode?: ScrollScaleMode
  smooth?: boolean
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') ref(node)
      else (ref as React.MutableRefObject<T | null>).current = node
    }
  }
}

/**
 * Per-section scroll animation (Home hero + Enter Shop style).
 * The outer element tracks scroll; only the inner wrapper is transformed.
 */
function ScrollScaleInner(
  {
    as = 'section',
    children,
    className,
    innerClassName,
    id,
    'aria-label': ariaLabel,
    variant,
    intensity,
    offset,
    disableOnMobile,
    heroMinScale,
    heroExitY,
    scaleMode,
    smooth,
    contain = true,
    edgeToEdge = false,
  }: ScrollScaleProps,
  forwardedRef: Ref<HTMLElement>
) {
  const { ref, style } = useScrollScale({
    variant,
    intensity,
    scaleMode,
    offset,
    disableOnMobile,
    smooth,
    heroMinScale,
    heroExitY,
  })

  const Outer = as
  const shouldContain = contain && !edgeToEdge
  const outerClassName = [className, shouldContain ? 'overflow-x-clip' : null].filter(Boolean).join(' ')
  const scaledClassName = [
    innerClassName,
    shouldContain ? 'w-full max-w-6xl mx-auto' : 'w-full',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Outer
      ref={mergeRefs(ref, forwardedRef)}
      className={outerClassName || undefined}
      id={id}
      aria-label={ariaLabel}
    >
      <motion.div style={style} className={scaledClassName || undefined}>
        {children}
      </motion.div>
    </Outer>
  )
}

const ScrollScale = forwardRef(ScrollScaleInner)

export default ScrollScale
