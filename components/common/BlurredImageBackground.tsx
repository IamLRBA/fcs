'use client'

import { useTheme } from '@/components/layout/ThemeProvider'
import Image from 'next/image'

const LIGHT_IMAGE = '/assets/images/bg-light.png'
const DARK_IMAGE = '/assets/images/bg-dark.png'

export interface BlurredImageBackgroundProps {
  imageOpacity?: number
  /** @deprecated Blur removed for performance; kept for API compatibility */
  blur?: number
  brightness?: number
  contrast?: number
  saturate?: number
  scale?: number
  imageOpacityDark?: number
  blurDark?: number
  brightnessDark?: number
  contrastDark?: number
  saturateDark?: number
  scaleDark?: number
}

const defaultsLight = {
  imageOpacity: 0.72,
  brightness: 1,
  contrast: 1.04,
  saturate: 0.96,
  scale: 1.08,
}

const defaultsDark = {
  imageOpacityDark: 0.85,
  brightnessDark: 1.12,
  contrastDark: 1.08,
  saturateDark: 1,
  scaleDark: 1.08,
}

/**
 * Full-viewport background: no CSS filter:blur() (expensive). Soft look via image opacity + gradient scrim.
 */
export default function BlurredImageBackground({
  imageOpacity = defaultsLight.imageOpacity,
  brightness = defaultsLight.brightness,
  contrast = defaultsLight.contrast,
  saturate = defaultsLight.saturate,
  scale = defaultsLight.scale,
  imageOpacityDark = defaultsDark.imageOpacityDark,
  brightnessDark = defaultsDark.brightnessDark,
  contrastDark = defaultsDark.contrastDark,
  saturateDark = defaultsDark.saturateDark,
  scaleDark = defaultsDark.scaleDark,
}: BlurredImageBackgroundProps) {
  const { mounted } = useTheme()

  if (!mounted) {
    return (
      <div
        className="absolute inset-0 z-0"
        aria-hidden
        style={{ backgroundColor: 'var(--color-bg-primary)', width: '100%', height: '100%' }}
      />
    )
  }

  const filterLight = [`brightness(${brightness})`, `contrast(${contrast})`, `saturate(${saturate})`].join(' ')
  const filterDark = [`brightness(${brightnessDark})`, `contrast(${contrastDark})`, `saturate(${saturateDark})`].join(' ')

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden"
      aria-hidden
      style={{
        isolation: 'isolate',
        width: '100%',
        height: '100%',
        minWidth: '100%',
        minHeight: '100%',
      }}
    >
      <div className="absolute inset-0 dark:hidden min-w-full min-h-full" style={{ opacity: imageOpacity, filter: filterLight }}>
        <Image
          src={LIGHT_IMAGE}
          alt=""
          fill
          className="object-cover min-w-full min-h-full"
          style={{ transform: `scale(${scale})`, objectPosition: 'center' }}
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/25 via-transparent to-[var(--color-bg-primary)]/40 dark:from-transparent"
          aria-hidden
        />
      </div>

      <div className="absolute inset-0 hidden dark:block min-w-full min-h-full" style={{ opacity: imageOpacityDark, filter: filterDark }}>
        <Image
          src={DARK_IMAGE}
          alt=""
          fill
          className="object-cover min-w-full min-h-full"
          style={{ transform: `scale(${scaleDark})`, objectPosition: 'center' }}
          sizes="100vw"
          loading="lazy"
        />
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-[var(--color-bg-primary)]/55"
          aria-hidden
        />
      </div>
    </div>
  )
}
