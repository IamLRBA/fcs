'use client'

import { useState, useEffect } from 'react'
import { Minus, Plus } from 'lucide-react'
import Button from '@/components/ui/Button'

type ProductDescriptionDisclosureProps = {
  description: string
  /** Resets open state when the viewed product changes */
  productKey: string
  /** Optional: smaller label on admin vs shop */
  labelClassName?: string
  bodyClassName?: string
}

export default function ProductDescriptionDisclosure({
  description,
  productKey,
  labelClassName = '',
  bodyClassName = '',
}: ProductDescriptionDisclosureProps) {
  const [open, setOpen] = useState(false)
  const trimmed = description?.trim() ?? ''
  const hasContent = trimmed.length > 0

  useEffect(() => {
    setOpen(false)
  }, [productKey])

  return (
    <div className={`border border-neutral-200/90 dark:border-neutral-600/50 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30 ${bodyClassName}`}>
      <div className="flex min-h-[2.5rem] items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-2.5">
        <span
          className={`text-sm font-semibold text-neutral-900 dark:text-primary-100 ${labelClassName}`}
        >
          Product Description
        </span>
        <Button
          type="button"
          variant="default"
          size="icon"
          onClick={() => setOpen((o) => !o)}
          className="focus-ring-none h-10 w-10 shrink-0"
          aria-expanded={open}
          aria-label={open ? 'Hide product description' : 'Show product description'}
        >
          {open ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </Button>
      </div>
      {open && (
        <div className="border-t border-neutral-200/90 dark:border-neutral-600/50 px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4">
          {hasContent ? (
            <p className="text-sm leading-relaxed text-neutral-700 dark:text-primary-300">{trimmed}</p>
          ) : (
            <p className="text-sm italic leading-relaxed text-neutral-500 dark:text-neutral-400">
              No description provided.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
