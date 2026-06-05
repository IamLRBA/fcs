'use client'

import React, {
  forwardRef,
  type ReactNode,
  type Ref,
} from 'react'
import { motion } from 'framer-motion'
import { useScrollScale, type UseScrollScaleOptions } from '@/hooks/useScrollScale'

type MotionTag = 'section' | 'div' | 'article' | 'main'

export type ScrollScaleProps = UseScrollScaleOptions & {
  as?: MotionTag
  children: ReactNode
  className?: string
  id?: string
  'aria-label'?: string
  /** Class on the inner scaled wrapper */
  innerClassName?: string
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
  }: ScrollScaleProps,
  forwardedRef: Ref<HTMLElement>
) {
  const { ref, style } = useScrollScale({
    variant,
    intensity,
    offset,
    disableOnMobile,
    heroMinScale,
    heroExitY,
  })

  const Outer = as

  return (
    <Outer
      ref={mergeRefs(ref, forwardedRef)}
      className={className}
      id={id}
      aria-label={ariaLabel}
    >
      <motion.div style={style} className={innerClassName}>
        {children}
      </motion.div>
    </Outer>
  )
}

const ScrollScale = forwardRef(ScrollScaleInner)

export default ScrollScale
