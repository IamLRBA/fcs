'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import Button from '@/components/ui/Button'

interface ModalCloseButtonProps {
  onClose: () => void
  className?: string
  'aria-label'?: string
}

/** Modal close button with spinning X on close (like settings icon). Excludes hamburger nav. */
export default function ModalCloseButton({ onClose, className = '', 'aria-label': ariaLabel = 'Close' }: ModalCloseButtonProps) {
  const [isSpinning, setIsSpinning] = useState(false)

  const handleClick = () => {
    setIsSpinning(true)
    const duration = 300
    setTimeout(() => {
      onClose()
      setIsSpinning(false)
    }, duration)
  }

  return (
    <Button
      variant="circle"
      size="sm"
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
    >
      <motion.span
        animate={{ rotate: isSpinning ? 360 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="inline-flex items-center justify-center"
      >
        <X className="w-4 h-4" />
      </motion.span>
    </Button>
  )
}
