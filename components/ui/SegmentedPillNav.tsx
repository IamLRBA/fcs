'use client'

import { motion } from 'framer-motion'

export type SegmentedPillItem = { id: string; label: string }

type SegmentedPillNavProps = {
  items: SegmentedPillItem[]
  value: string | null
  onSelect: (id: string) => void
  /** When true, sliding pill renders only after `value` matches an item (e.g. category nav before first pick). */
  hideIndicatorUntilSelected?: boolean
  /** When true, segments are non-interactive (e.g. while content is updating). */
  disabled?: boolean
  className?: string
}

/**
 * Pill segmented control with spring sliding highlight (same pattern as admin Order pipeline).
 */
export default function SegmentedPillNav({
  items,
  value,
  onSelect,
  hideIndicatorUntilSelected = false,
  disabled = false,
  className = '',
}: SegmentedPillNavProps) {
  const n = items.length
  if (n === 0) return null

  const rawIndex = items.findIndex((i) => i.id === value)
  const hasSelection = rawIndex >= 0
  const renderThumb = hideIndicatorUntilSelected ? hasSelection : true
  const thumbIndex = hasSelection ? rawIndex : 0

  return (
    <div
      className={`segmented-pill-nav !rounded-full bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(0,0,0,0.35)] p-[1px] w-full max-w-4xl mx-auto ${disabled ? 'opacity-55' : ''} ${className}`}
    >
      <div
        className="relative grid p-[1px]"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {renderThumb ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute top-[1px] bottom-[1px] left-[1px] z-0 !rounded-full bg-white dark:bg-neutral-800"
            style={{ width: `calc((100% - 2px) / ${n})` }}
            initial={false}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            animate={{ x: `${thumbIndex * 100}%` }}
          />
        ) : null}
        {items.map((item) => {
          const active = value === item.id
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              aria-disabled={disabled}
              onClick={() => {
                if (!disabled) onSelect(item.id)
              }}
              className={`focus-ring-none relative z-10 !rounded-full border border-transparent px-1.5 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors duration-300 whitespace-nowrap truncate outline-none focus:outline-none focus-visible:ring-0 ring-0 max-w-full disabled:cursor-not-allowed ${
                active
                  ? 'text-primary-800 dark:text-primary-100'
                  : 'text-primary-500 dark:text-primary-300 hover:text-primary-700 dark:hover:text-primary-100'
              }`}
            >
              <span className="block truncate">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
