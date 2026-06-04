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
    <div
      className={`w-full text-left border border-neutral-200/90 dark:border-neutral-600/50 rounded-xl ${bodyClassName}`}
    >
      {/* pl-0 pr-0: align with unboxed headings/body in the same modal column */}
      <div className="flex w-full min-h-[2.5rem] items-center justify-start gap-1.5 py-2.5 pl-0 pr-0 sm:py-2.5">
        <span
          className={`text-left text-sm font-semibold text-primary-800 dark:text-primary-100 sm:text-sm ${labelClassName}`}
        >
          Product Description
        </span>
        <Button
          type="button"
          variant="default"
          size="icon"
          onClick={() => setOpen((o) => !o)}
          className="focus-ring-none h-9 w-9 shrink-0 p-0"
          aria-expanded={open}
          aria-label={open ? 'Hide product description' : 'Show product description'}
        >
          {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>
      {open && (
        <div className="border-t border-neutral-200/90 dark:border-neutral-600/50 pl-0 pr-0 pt-3 pb-3 sm:pb-3.5">
          {hasContent ? (
            <p className="w-full break-words text-left text-sm leading-relaxed text-neutral-700 text-pretty dark:text-primary-300 sm:text-sm">
              {trimmed}
            </p>
          ) : (
            <p className="w-full break-words text-left text-sm italic leading-relaxed text-neutral-500 text-pretty dark:text-neutral-400 sm:text-sm">
              No description provided.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
