'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { User, AlertCircle } from 'lucide-react'
import { AuthManager } from '@/lib/auth'
import Button from '@/components/ui/Button'
import ModalCloseButton from '@/components/ui/ModalCloseButton'

export default function AccountPromptPopup() {
  const [showPopup, setShowPopup] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()

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
      // Delay showing popup by 3 seconds
      timer = setTimeout(() => {
        setShowPopup(true)
      }, 3000)
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleDismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 right-8 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-6 max-w-md z-50 border border-neutral-200 dark:border-neutral-700"
          >
            <ModalCloseButton onClose={handleDismiss} className="absolute top-4 right-4 flex-shrink-0" aria-label="Close" />
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-primary-600 dark:text-primary-300" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <h3 className="text-lg font-bold text-primary-800 dark:text-neutral-100">
                    Create an Account
                  </h3>
                </div>
                
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                  Sign up to save your information, track orders, write reviews, and get personalized recommendations!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    href="/login"
                    variant="filled"
                    size="md"
                    onClick={handleSignUp}
                    className="flex-1 justify-center"
                  >
                    Sign Up Now
                  </Button>
                  <Button
                    variant="default"
                    size="md"
                    onClick={handleDismiss}
                    className="flex-1 justify-center"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

