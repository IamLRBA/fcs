'use client'

import { motion, AnimatePresence } from 'framer-motion'
import ModalCloseButton from '@/components/ui/ModalCloseButton'

type FeedbackDialogProps = {
  open: boolean
  message: string
  variant?: 'success' | 'error'
  onClose: () => void
  /** Lower z-index when nested under another modal (rare). */
  zClassName?: string
}

/**
 * Compact message dialog matching admin delete-product modal: glass shell, straight TR/BR on inner panel,
 * close control at top-right (same placement as product delete dialog).
 */
export default function FeedbackDialog({
  open,
  message,
  variant = 'success',
  onClose,
  zClassName = 'z-[1150]',
}: FeedbackDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 ${zClassName} flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm dark:bg-black/85`}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="hero-glass-frame relative w-full max-w-sm overflow-hidden rounded-2xl backdrop-blur-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden />
            <div className="relative z-10 flex flex-col overflow-hidden rounded-bl-2xl rounded-br-none rounded-tl-2xl rounded-tr-none border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
              <ModalCloseButton
                onClose={onClose}
                className="absolute top-2 right-2 z-40 flex-shrink-0"
                aria-label="Close"
              />
              <div className="p-6 pt-12 sm:p-7 sm:pt-14">
                <p
                  className={
                    variant === 'error'
                      ? 'text-sm text-red-600 dark:text-red-400'
                      : 'text-sm text-neutral-800 dark:text-primary-200'
                  }
                >
                  {message}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
