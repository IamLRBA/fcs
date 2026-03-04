'use client'

import { useTheme } from '@/components/layout/ThemeProvider'
import Image from 'next/image'

const LIGHT_IMAGE = '/assets/images/bg-light.png'
const DARK_IMAGE = '/assets/images/bg-dark.png'

export interface BlurredImageBackgroundProps {
  /** Light mode: opacity of the image layer (0–1) */
  imageOpacity?: number
  /** Light mode: blur radius in pixels */
  blur?: number
  /** Light mode: brightness (0–2+, 1 = normal) */
  brightness?: number
  /** Light mode: contrast (0–2+, 1 = normal) */
  contrast?: number
  /** Light mode: saturate (0–2+, 1 = normal) */
  saturate?: number
  /** Light mode: scale of the image (e.g. 1.05) */
  scale?: number
  /** Dark mode: opacity of the image layer (0–1) */
  imageOpacityDark?: number
  /** Dark mode: blur radius in pixels */
  blurDark?: number
  /** Dark mode: brightness (0–2+, 1 = normal) */
  brightnessDark?: number
  /** Dark mode: contrast (0–2+, 1 = normal) */
  contrastDark?: number
  /** Dark mode: saturate (0–2+, 1 = normal) */
  saturateDark?: number
  /** Dark mode: scale of the image */
  scaleDark?: number
}

const defaultsLight = {
  imageOpacity: 0.75,
  blur: 3.5,
  brightness: 1,
  contrast: 1.05,
  saturate: 0.95,
  scale: 1.15,
}

const defaultsDark = {
  imageOpacityDark: 0.9,
  blurDark: 5.5,
  brightnessDark: 1.25,
  contrastDark: 1.1,
  saturateDark: 1,
  scaleDark: 1.15,
}

export default function BlurredImageBackground({
  imageOpacity = defaultsLight.imageOpacity,
  blur = defaultsLight.blur,
  brightness = defaultsLight.brightness,
  contrast = defaultsLight.contrast,
  saturate = defaultsLight.saturate,
  scale = defaultsLight.scale,
  imageOpacityDark = defaultsDark.imageOpacityDark,
  blurDark = defaultsDark.blurDark,
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

  const filterLight = [
    `blur(${blur}px)`,
    `brightness(${brightness})`,
    `contrast(${contrast})`,
    `saturate(${saturate})`,
  ].join(' ')

  const filterDark = [
    `blur(${blurDark}px)`,
    `brightness(${brightnessDark})`,
    `contrast(${contrastDark})`,
    `saturate(${saturateDark})`,
  ].join(' ')

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
      {/* Light mode image – hidden when dark, covers full screen */}
      <div
        className="absolute inset-0 dark:hidden min-w-full min-h-full"
        style={{
          opacity: imageOpacity,
          filter: filterLight,
        }}
      >
        <Image
          src={LIGHT_IMAGE}
          alt=""
          fill
          className="object-cover min-w-full min-h-full"
          style={{ transform: `scale(${scale})`, objectPosition: 'center' }}
          sizes="100vw"
          priority
          unoptimized={false}
        />
      </div>

      {/* Dark mode image – hidden when light, covers full screen */}
      <div
        className="absolute inset-0 hidden dark:block min-w-full min-h-full"
        style={{
          opacity: imageOpacityDark,
          filter: filterDark,
        }}
      >
        <Image
          src={DARK_IMAGE}
          alt=""
          fill
          className="object-cover min-w-full min-h-full"
          style={{ transform: `scale(${scaleDark})`, objectPosition: 'center' }}
          sizes="100vw"
          priority
          unoptimized={false}
        />
      </div>
    </div>
  )
}
