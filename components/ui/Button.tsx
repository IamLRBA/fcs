'use client'

import Link from 'next/link'
import { type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react'

type ButtonVariant = 'default' | 'filled' | 'circle'

type BaseProps = {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg' | 'icon'
  /** When true, glass shine runs on parent .group hover (e.g. portal Explore) */
  shineOnGroupHover?: boolean
  className?: string
  children: React.ReactNode
}

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: never
  }

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string
  }

type ButtonProps = ButtonAsButton | ButtonAsLink

const sizeClasses: Record<string, string> = {
  sm: 'text-sm px-4 py-2',
  md: 'text-base px-6 py-3',
  lg: 'text-lg px-8 py-4',
  icon: 'p-0 min-w-0 w-10 h-10 text-base',
}

export default function Button({
  variant = 'default',
  size = 'md',
  shineOnGroupHover = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const isCircle = variant === 'circle'
  const baseClass =
    variant === 'filled'
      ? 'btn-unified-filled'
      : isCircle
        ? 'btn-unified-circle'
        : 'btn-unified'
  const sizeClass = isCircle
    ? (size === 'sm' ? 'btn-unified-circle-sm' : '')
    : (sizeClasses[size] ?? sizeClasses.md)
  const groupShineClass = shineOnGroupHover ? 'btn-unified-group-shine' : ''
  const classes = [baseClass, sizeClass, groupShineClass, className].filter(Boolean).join(' ')

  if ('href' in rest && rest.href) {
    const { href, ...linkRest } = rest
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    )
  }

  const { href: _h, ...buttonRest } = rest as ButtonAsButton
  return (
    <button type="button" className={classes} {...buttonRest}>
      {children}
    </button>
  )
}
