'use client'

import { useMemo } from 'react'
import { getVariantStock, isMultiInventory } from '@/lib/inventory'
import type { InventoryModeClient, ProductVariantStock } from '@/lib/catalog/types'

type Props = {
  inventory_mode?: InventoryModeClient
  sizes: string[]
  colors: string[]
  variants?: ProductVariantStock[]
  selectedSize: string
  selectedColor: string
  onSizeChange: (size: string) => void
  onColorChange: (color: string) => void
}

function chipClass(active: boolean, disabled: boolean) {
  if (disabled) {
    return 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400 opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500'
  }
  if (active) {
    return 'border-primary-600 bg-primary-600 text-white dark:border-primary-400 dark:bg-primary-500'
  }
  return 'border-neutral-300 bg-white text-neutral-800 hover:border-primary-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-primary-500'
}

export default function ProductVariantPicker({
  inventory_mode,
  sizes,
  colors,
  variants = [],
  selectedSize,
  selectedColor,
  onSizeChange,
  onColorChange,
}: Props) {
  const multi = isMultiInventory(inventory_mode ?? 'unique')

  const availableSizes = useMemo(() => {
    if (!multi) return sizes
    const set = new Set<string>()
    for (const v of variants) {
      if (v.stock_qty > 0) set.add(v.size)
    }
    return sizes.filter((s) => set.has(s))
  }, [multi, sizes, variants])

  const availableColors = useMemo(() => {
    if (!multi) return colors
    const set = new Set<string>()
    for (const v of variants) {
      if (v.stock_qty > 0 && (!selectedSize || v.size === selectedSize)) set.add(v.color)
    }
    return colors.filter((c) => set.has(c))
  }, [multi, colors, variants, selectedSize])

  const selectedStock = multi
    ? getVariantStock(variants, selectedSize, selectedColor)
    : 0

  if (!sizes.length && !colors.length) return null

  return (
    <div className="space-y-3">
      {sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-primary-300">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const inStock = !multi || availableSizes.includes(size)
              const active = selectedSize === size
              return (
                <button
                  key={size}
                  type="button"
                  disabled={!inStock}
                  onClick={() => onSizeChange(size)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${chipClass(active, !inStock)}`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}
      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-primary-300">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const stock =
                multi && selectedSize
                  ? getVariantStock(variants, selectedSize, color)
                  : multi
                    ? variants.filter((v) => v.color === color).reduce((s, v) => s + v.stock_qty, 0)
                    : 1
              const inStock = !multi || stock > 0
              const active = selectedColor === color
              return (
                <button
                  key={color}
                  type="button"
                  disabled={!inStock}
                  onClick={() => onColorChange(color)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${chipClass(active, !inStock)}`}
                >
                  {color}
                  {multi && inStock && stock > 1 ? ` (${stock})` : ''}
                </button>
              )
            })}
          </div>
        </div>
      )}
      {multi && selectedSize && selectedColor && (
        <p className="text-sm text-neutral-600 dark:text-primary-400">
          {selectedStock > 0
            ? `${selectedStock} available in this size & color`
            : 'Out of stock for this combination'}
        </p>
      )}
    </div>
  )
}
