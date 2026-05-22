'use client'

import { isMultiInventory } from '@/lib/inventory'
import type { InventoryModeClient } from '@/lib/catalog/types'

type Props = {
  sizes: string[]
  colors: string[]
  inventory_mode?: InventoryModeClient
  className?: string
}

/** Compact size/color labels for product cards */
export default function InventoryChips({ sizes, colors, inventory_mode, className = '' }: Props) {
  const multi = isMultiInventory(inventory_mode ?? 'unique')
  const hasSizes = sizes.length > 0
  const hasColors = colors.length > 0
  if (!hasSizes && !hasColors) return null

  return (
    <div className={`flex flex-wrap items-center justify-center gap-1 px-0.5 ${className}`}>
      {hasSizes && (
        <span className="rounded-full bg-primary-100/90 px-1.5 py-0.5 text-[9px] font-medium text-primary-800 dark:bg-primary-900/50 dark:text-primary-200 sm:text-[10px]">
          {multi ? 'Sizes' : 'Size'}: {sizes.join(', ')}
        </span>
      )}
      {hasColors && (
        <span className="rounded-full bg-neutral-100/90 px-1.5 py-0.5 text-[9px] font-medium text-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-300 sm:text-[10px]">
          {multi ? 'Colors' : 'Color'}: {colors.join(', ')}
        </span>
      )}
    </div>
  )
}
