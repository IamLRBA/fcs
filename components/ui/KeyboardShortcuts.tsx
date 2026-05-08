'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'
import Button from '@/components/ui/Button'
import ModalCloseButton from '@/components/ui/ModalCloseButton'
import useScrollLock from '@/components/layout/useScrollLock'

interface Shortcut {
  key: string
  description: string
  keys: string[]
}

const shortcuts: Shortcut[] = [
  { key: 'home', description: 'Go to Home', keys: ['H'] },
  { key: 'cart', description: 'Open Cart', keys: ['C'] },
  { key: 'search', description: 'Open Search', keys: ['/', 'S'] },
  { key: 'about', description: 'About Us', keys: ['A'] },
  { key: 'shop', description: 'Shop Portal', keys: ['F'] },
  { key: 'settings', description: 'Settings / Account', keys: ['G'] },
  { key: 'top', description: 'Scroll to Top', keys: ['T'] },
  { key: 'bottom', description: 'Scroll to Bottom', keys: ['B'] },
]

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  useScrollLock(isOpen)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Show shortcuts modal with ? key
      if (e.key === '?' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setIsOpen(true)
      }

      // Individual shortcuts
      switch (e.key.toLowerCase()) {
        case 'h':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            window.location.href = '/'
          }
          break
        case 'c':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            window.location.href = '/cart'
          }
          break
        case '/':
        case 's':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            // Trigger search - find the search button that toggles the search form
            // The button is a sibling of the search form/input container
            const searchContainer = document.querySelector('div.relative[ref], div:has(input[placeholder*="Search" i])')?.parentElement
            if (searchContainer) {
              const searchButton = searchContainer.querySelector('button[type="button"]:not(.absolute)') as HTMLElement
              if (searchButton) {
                searchButton.click()
                return
              }
            }
            // Alternative: find button near search input
            const searchInput = document.querySelector('input[placeholder*="Search" i], input[placeholder*="search" i]') as HTMLInputElement
            if (searchInput) {
              const container = searchInput.closest('.relative')
              if (container) {
                // Find button that's not inside the form
                const buttons = container.querySelectorAll('button')
                const searchButton = Array.from(buttons).find(btn => !btn.closest('form')) as HTMLElement
                if (searchButton) {
                  searchButton.click()
                  return
                }
              }
            }
            // Fallback: try to find any button with search icon (not settings or cart)
            const allButtons = Array.from(document.querySelectorAll('button'))
            const searchButton = allButtons.find(btn => {
              const svg = btn.querySelector('svg')
              const ariaLabel = btn.getAttribute('aria-label') || ''
              return svg && 
                     !ariaLabel.toLowerCase().includes('settings') && 
                     !ariaLabel.toLowerCase().includes('cart') &&
                     btn.textContent?.trim() === ''
            }) as HTMLElement
            if (searchButton) {
              searchButton.click()
            }
          }
          break
        case 'a':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            window.location.href = '/about-us'
          }
          break
        case 'f':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            window.location.href = '/sections/shop'
          }
          break
        case 'g':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            // Trigger settings dropdown by finding and clicking the settings button
            const settingsButton = document.querySelector('[aria-label="Settings"]') as HTMLElement
            if (settingsButton) {
              settingsButton.click()
            } else {
              // Fallback: navigate to account page
              window.location.href = '/account'
            }
          }
          break
        case 't':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
          break
        case 'b':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
          }
          break
        case 'escape':
          setIsOpen(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <>
      {/* Keyboard Shortcuts Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 25,
          delay: 0.1
        }}
        className="hidden sm:block fixed bottom-8 left-8 z-50"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="hidden sm:block absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-primary-900 dark:bg-primary-100 text-primary-50 dark:text-primary-900 text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none border border-primary-400/40"
            >
              Keyboard Shortcuts
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-primary-900 dark:border-r-primary-100"></div>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="circle"
          onClick={() => setIsOpen(true)}
          className="focus-ring-none transition-all duration-300"
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (Ctrl + ?)"
        >
          <Keyboard className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
            >
              {/* Semi-transparent outer container (like product modal) - main content sits inside */}
              <div
                className="hero-glass-frame relative w-full max-w-2xl max-h-[80vh] flex flex-col backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-600"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                {/* Main container: header + close stay fixed; body scrolls */}
                <div className="glass-inner-panel relative z-10 flex max-h-[80vh] min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700">
                  <div className="hero-glass-frame hero-glass-frame-compact relative flex shrink-0 items-center justify-between rounded-t-2xl border-b border-neutral-200 px-6 py-4 backdrop-blur-sm dark:border-neutral-700 glass-inner-panel">
                    <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0 rounded-t-2xl opacity-50" aria-hidden />
                    <div className="relative z-10 flex items-center space-x-3">
                      <Keyboard className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">Keyboard Shortcuts</h2>
                    </div>
                    <ModalCloseButton onClose={() => setIsOpen(false)} className="relative z-10 shrink-0" aria-label="Close" />
                  </div>
                  <div className="modal-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {shortcuts.map((shortcut) => (
                        <div
                          key={shortcut.key}
                          className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-sm rounded-xl p-4 border border-neutral-300/80 dark:border-neutral-700 glass-inner-well"
                        >
                          <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-xl opacity-60" aria-hidden />
                          <div className="relative z-10 flex items-center justify-between">
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">{shortcut.description}</span>
                            <div className="flex items-center space-x-1">
                              {shortcut.keys.map((key, index) => (
                                <span key={index} className="flex items-center">
                                  {index > 0 && <span className="mx-1 text-neutral-400">or</span>}
                                  <kbd className="px-2 py-1 bg-white/90 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded text-xs font-mono text-neutral-800 dark:text-neutral-200 shadow-sm">
                                    {key}
                                  </kbd>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Footer section - semi-transparent, slightly darker shade in light mode */}
                    <div className="hero-glass-frame hero-glass-frame-compact relative mt-6 rounded-xl border-t border-neutral-200 px-6 pb-6 pt-6 backdrop-blur-sm dark:border-neutral-700 glass-inner-panel">
                      <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-xl opacity-50" aria-hidden />
                      <p className="relative z-10 text-sm text-neutral-600 dark:text-neutral-400 text-center">
                        Press <kbd className="px-2 py-1 bg-neutral-200/90 dark:bg-neutral-700 rounded text-xs">Esc</kbd> to close
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

