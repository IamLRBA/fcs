'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.8, transition: { duration: 0.2 } }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 25
          }}
          className="fixed bottom-8 right-8 z-50"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Tooltip - Only show on hover (desktop/tablet) */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="hidden md:block absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-primary-900 dark:bg-primary-100 text-primary-50 dark:text-primary-900 text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none border border-primary-400/40"
              >
                Back to Top
                <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-primary-900 dark:border-l-primary-100"></div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="circle"
            onClick={scrollToTop}
            className="focus-ring-none transition-all duration-300"
            aria-label="Back to top"
          >
            <span className="text-lg font-medium">⇑</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

