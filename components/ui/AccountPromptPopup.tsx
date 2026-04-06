'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { User, AlertCircle } from 'lucide-react'
import { AuthManager } from '@/lib/auth'
import Button from '@/components/ui/Button'
import ModalCloseButton from '@/components/ui/ModalCloseButton'
import useScrollLock from '@/components/layout/useScrollLock'

export default function AccountPromptPopup() {
  const [showPopup, setShowPopup] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()
  useScrollLock(showPopup)

  useEffect(() => {
    // Check if user is logged in
    const isAuthenticated = AuthManager.isAuthenticated()
    
    // Check if popup was dismissed (with expiration)
    const dismissedTime = localStorage.getItem('account-prompt-dismissed')
    const dismissedUntil = dismissedTime ? parseInt(dismissedTime) : 0
    const isDismissed = Date.now() < dismissedUntil
    
    let timer: NodeJS.Timeout | null = null
    
    // Show popup if user is not logged in and hasn't dismissed recently (24 hours)
    if (!isAuthenticated && !isDismissed) {
      const showSoon = () => setShowPopup(true)
      // First home load: show as soon as loading overlay finishes (hero already mounted behind)
      try {
        if (sessionStorage.getItem('mysticalpieces-home-reveal') === '1') {
          sessionStorage.removeItem('mysticalpieces-home-reveal')
          timer = setTimeout(showSoon, 100)
        } else {
          timer = setTimeout(showSoon, 3000)
        }
      } catch {
        timer = setTimeout(showSoon, 3000)
      }
    }

    // Listen for auth changes
    const handleAuthChange = () => {
      if (AuthManager.isAuthenticated()) {
        setShowPopup(false)
      }
    }

    window.addEventListener('authStateChanged', handleAuthChange)
    
    // Return a single cleanup function that handles both cases
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
      window.removeEventListener('authStateChanged', handleAuthChange)
    }
  }, [])

  const handleDismiss = () => {
    setShowPopup(false)
    setDismissed(true)
    // Store dismissal for 24 hours
    localStorage.setItem('account-prompt-dismissed', (Date.now() + 24 * 60 * 60 * 1000).toString())
  }

  const handleSignUp = () => {
    setShowPopup(false)
    router.push('/login')
  }

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]"
            onClick={handleDismiss}
          />
          {/* Small screens: horizontally centered; sm+: keep bottom-right (vertical unchanged) */}
          <div className="fixed bottom-8 left-0 right-0 z-[1000] flex justify-center px-4 sm:justify-end sm:px-8 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="pointer-events-auto w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Outer semi-transparent shell – same pattern as testimonials modal */}
            <div className="hero-glass-frame relative backdrop-blur-lg bg-white/25 dark:bg-neutral-900/20 dark:border-neutral-600 rounded-2xl shadow-2xl">
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <div className="relative z-10 flex max-h-[min(85vh,32rem)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
                <ModalCloseButton onClose={handleDismiss} className="absolute top-4 right-4 z-30 shrink-0" aria-label="Close" />
                <div className="modal-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
            <div className="flex items-start space-x-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-800">
                <User className="h-6 w-6 text-primary-600 dark:text-primary-300" />
              </div>
              
              <div className="min-w-0 flex-1 pr-2 sm:pr-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <h3 className="text-lg font-bold text-primary-800 dark:text-neutral-100">
                    Create an Account
                  </h3>
                </div>
                
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                  Sign up to save your information, track orders, write reviews, and get personalized recommendations!
                </p>
                
                {/* Stacked + full width so labels stay on one line; gap gives clear separation */}
                <div className="flex flex-col gap-3 mt-1 account-prompt-buttons">
                  <Button
                    href="/login"
                    variant="filled"
                    size="md"
                    onClick={handleSignUp}
                    className="w-full justify-center whitespace-nowrap px-6 py-2.5"
                  >
                    Sign Up Now
                  </Button>
                  <Button
                    variant="default"
                    size="md"
                    onClick={handleDismiss}
                    className="w-full justify-center whitespace-nowrap px-6 py-2.5"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </div>
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

