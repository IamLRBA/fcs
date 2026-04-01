'use client'

import Image from 'next/image'
import { useTheme } from '@/components/layout/ThemeProvider'

type LogoMarkProps = {
  className?: string
  animated?: boolean
  size?: number
}

const LIGHT_LOGO_SRC = '/assets/images/branding/logo-light.png'
const DARK_LOGO_SRC = '/assets/images/branding/logo-dark.png'

/** Renders both theme logos and uses CSS dark:hidden / dark:block so the logo switches in sync with the document theme (same as BlurredImageBackground). */
export default function LogoMark({ className, animated = false, size = 120 }: LogoMarkProps) {
  const { mounted } = useTheme()
  const classes = ['logo-mark', animated ? 'logo-mark--animated' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      aria-hidden="true"
    >
      {/* Light logo – hidden in dark mode via wrapper so only one logo ever renders visibly */}
      <Image
        src={LIGHT_LOGO_SRC}
        alt="Mystical PIECES® logo"
        width={size}
        height={size}
        draggable={false}
        className={mounted ? 'dark:hidden' : ''}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
        sizes={`${size}px`}
        priority
      />
      {/* Dark logo – wrapper is display:none in light so the dark image never paints in light mode */}
      <span className={mounted ? 'hidden dark:block absolute inset-0 w-full h-full' : 'hidden'}>
        <Image
          src={DARK_LOGO_SRC}
          alt=""
          width={size}
          height={size}
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
          sizes={`${size}px`}
          priority
          aria-hidden
        />
      </span>
    </div>
  )
}

