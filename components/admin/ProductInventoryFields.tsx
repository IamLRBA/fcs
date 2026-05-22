'use client'

import { Plus, Trash2 } from 'lucide-react'
import type { InventoryModeClient, ProductVariantStock } from '@/lib/catalog/types'
import { sumVariantStock } from '@/lib/inventory'

export type VariantRow = { size: string; color: string; stock_qty: number }

type Props = {
  inventory_mode: InventoryModeClient
  onInventoryModeChange: (mode: InventoryModeClient) => void
  stock_qty: number
  onStockQtyChange: (qty: number) => void
  sizes: string[]
  colors: string[]
  onSizesChange: (sizes: string[]) => void
  onColorsChange: (colors: string[]) => void
  variants: VariantRow[]
  onVariantsChange: (rows: VariantRow[]) => void
}

export function variantsFromRows(rows: VariantRow[]): ProductVariantStock[] {
  return rows.filter((r) => r.size.trim() && r.color.trim() && r.stock_qty > 0)
}

export default function ProductInventoryFields({
  inventory_mode,
  onInventoryModeChange,
  stock_qty,
  onStockQtyChange,
  sizes,
  colors,
  onSizesChange,
  onColorsChange,
  variants,
  onVariantsChange,
}: Props) {
  const isMulti = inventory_mode === 'multi'
  const totalMulti = sumVariantStock(variants)

  const addVariantRow = () => {
    onVariantsChange([...variants, { size: '', color: '', stock_qty: 1 }])
  }

  const updateRow = (index: number, patch: Partial<VariantRow>) => {
    onVariantsChange(variants.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  const removeRow = (index: number) => {
    onVariantsChange(variants.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4 rounded-xl border border-primary-500/25 bg-primary-50/30 p-4 dark:border-primary-500/35 dark:bg-primary-950/20">
      <div>
        <p className="mb-2 text-sm font-semibold text-primary-900 dark:text-primary-100">Inventory type</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex flex-1 cursor-pointer items-start gap-2 rounded-lg border border-neutral-300 bg-white/80 p-3 dark:border-neutral-600 dark:bg-neutral-800/60">
            <input
              type="radio"
              name="inventory_mode"
              checked={!isMulti}
              onChange={() => onInventoryModeChange('unique')}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">Single unique piece</span>
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                Typical thrift listing — one item only. Removed from the shop when sold.
              </span>
            </span>
          </label>
          <label className="flex flex-1 cursor-pointer items-start gap-2 rounded-lg border border-neutral-300 bg-white/80 p-3 dark:border-neutral-600 dark:bg-neutral-800/60">
            <input
              type="radio"
              name="inventory_mode"
              checked={isMulti}
              onChange={() => onInventoryModeChange('multi')}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">Multiple quantities</span>
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                Same style in several sizes/colors. Stock reduces on sale; listing stays until all are sold.
              </span>
            </span>
          </label>
        </div>
      </div>

      {!isMulti ? (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium">Stock</label>
            <p className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">Usually 1 for a one-of-a-kind thrift piece.</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onStockQtyChange(Math.max(0, stock_qty - 1))}
                className="focus-ring-none flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 text-lg font-medium hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700"
              >
                −
              </button>
              <input
                type="number"
                min={0}
                max={1}
                value={stock_qty}
                onChange={(e) => onStockQtyChange(Math.min(1, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                className="input-overlay flex-1 rounded-lg px-3 py-2 text-center dark:bg-neutral-700 dark:text-white"
              />
              <button
                type="button"
                onClick={() => onStockQtyChange(Math.min(1, stock_qty + 1))}
                className="focus-ring-none flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 text-lg font-medium hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Size (optional)</label>
            <input
              value={sizes.join(', ')}
              onChange={(e) =>
                onSizesChange(
                  e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
              className="input-overlay w-full rounded-lg px-3 py-2 dark:bg-neutral-700 dark:text-white"
              placeholder="e.g. M"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Color (optional)</label>
            <input
              value={colors.join(', ')}
              onChange={(e) =>
                onColorsChange(
                  e.target.value
                    .split(',')
                    .map((c) => c.trim())
                    .filter(Boolean)
                )
              }
              className="input-overlay w-full rounded-lg px-3 py-2 dark:bg-neutral-700 dark:text-white"
              placeholder="e.g. Navy"
            />
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Add each size and color combination with how many you have in stock. Total in catalog:{' '}
            <strong>{totalMulti}</strong>
          </p>
          <div className="space-y-2">
            {variants.map((row, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_5rem_auto] items-center gap-2">
                <input
                  placeholder="Size"
                  value={row.size}
                  onChange={(e) => updateRow(index, { size: e.target.value })}
                  className="input-overlay rounded-lg px-2 py-2 text-sm dark:bg-neutral-700 dark:text-white"
                />
                <input
                  placeholder="Color"
                  value={row.color}
                  onChange={(e) => updateRow(index, { color: e.target.value })}
                  className="input-overlay rounded-lg px-2 py-2 text-sm dark:bg-neutral-700 dark:text-white"
                />
                <input
                  type="number"
                  min={0}
                  value={row.stock_qty}
                  onChange={(e) => updateRow(index, { stock_qty: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                  className="input-overlay rounded-lg px-2 py-2 text-sm text-center dark:bg-neutral-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="focus-ring-none flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10"
                  aria-label="Remove variant"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addVariantRow}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-900 dark:text-primary-300 dark:hover:text-primary-100"
          >
            <Plus className="h-4 w-4" />
            Add size & color row
          </button>
        </>
      )}
    </div>
  )
}
