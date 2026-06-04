'use client'

import React, {
  forwardRef,
  type ReactNode,
  type Ref,
} from 'react'
import { motion } from 'framer-motion'
import { useScrollScale, type UseScrollScaleOptions } from '@/hooks/useScrollScale'

type MotionTag = 'section' | 'div' | 'article' | 'main'

const motionComponents = {
  section: motion.section,
  div: motion.div,
  article: motion.article,
  main: motion.main,
} as const

export type ScrollScaleProps = UseScrollScaleOptions & {
  as?: MotionTag
  children: ReactNode
  className?: string
  id?: string
  'aria-label'?: string
  /** Apply scroll scale to an inner wrapper instead of the root element (hero content). */
  scaleChildren?: boolean
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

function ScrollScaleInner(
  {
    as = 'div',
    children,
    className,
    id,
    'aria-label': ariaLabel,
    variant,
    intensity,
    offset,
    disableOnMobile,
    heroMinScale,
    heroExitY,
    scaleChildren = false,
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

  const MotionComponent = motionComponents[as]

  if (scaleChildren) {
    const Outer = as
    return (
      <Outer
        ref={mergeRefs(ref, forwardedRef)}
        className={className}
        id={id}
        aria-label={ariaLabel}
      >
        <motion.div style={style}>{children}</motion.div>
      </Outer>
    )
  }

  return (
    <MotionComponent
      ref={mergeRefs(ref, forwardedRef)}
      className={className}
      style={style}
      id={id}
      aria-label={ariaLabel}
    >
      {children}
    </MotionComponent>
  )
}

const ScrollScale = forwardRef(ScrollScaleInner)

export default ScrollScale
