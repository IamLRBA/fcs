'use client'

import Image from 'next/image'

type SafeImageProps = {
  src: string | undefined | null
  alt: string
  className?: string
  /** Use with parent `relative` + fixed height */
  fill?: boolean
  sizes?: string
  width?: number
  height?: number
  priority?: boolean
  loading?: 'lazy' | 'eager'
  onError?: () => void
}

const PLACEHOLDER = '/assets/images/placeholder.jpg'

/**
 * Uses next/image for static paths (AVIF/WebP); falls back to <img> for data URLs (admin uploads).
 */
export default function SafeImage({
  src,
  alt,
  className = '',
  fill,
  sizes = '(max-width: 768px) 50vw, 33vw',
  width,
  height,
  priority = false,
  loading = 'lazy',
  onError,
}: SafeImageProps) {
  const resolved = src && src.length > 0 ? src : PLACEHOLDER

  if (resolved.startsWith('data:')) {
    return (
      <img
        src={resolved}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : loading}
        decoding="async"
        onError={onError}
      />
    )
  }

  if (fill) {
    return (
      <Image
        src={resolved}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : loading}
        onError={onError}
      />
    )
  }

  if (width != null && height != null) {
    return (
      <Image
        src={resolved}
        alt={alt}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : loading}
        onError={onError}
      />
    )
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : loading}
      decoding="async"
      onError={onError}
    />
  )
}
