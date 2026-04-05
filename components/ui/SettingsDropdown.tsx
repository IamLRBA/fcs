'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Settings, Sun, Moon, Monitor, Palette, User, LogOut } from 'lucide-react'
import { AuthManager } from '@/lib/auth'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher'
import useScrollLock from '@/components/layout/useScrollLock'

type Theme = 'light' | 'dark' | 'system'

interface SettingsDropdownProps {
  /** When 'mobile', dropdown panel is centered and in-flow so the menu container expands when open */
  variant?: 'desktop' | 'mobile'
  onOpenChange?: (isOpen: boolean) => void
}

export default function SettingsDropdown({ variant = 'desktop', onOpenChange }: SettingsDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [surfaceLocked, setSurfaceLocked] = useState(false)
  const [isThemeOpen, setIsThemeOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [rotation, setRotation] = useState(0)
  const router = useRouter()
  useScrollLock((isOpen || surfaceLocked) && variant === 'desktop')

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('fusioncraft-theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
    setIsAuthenticated(AuthManager.isAuthenticated())

    const handleAuthChange = () => {
      setIsAuthenticated(AuthManager.isAuthenticated())
    }

    window.addEventListener('authStateChanged', handleAuthChange)
    return () => window.removeEventListener('authStateChanged', handleAuthChange)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const activeTheme = theme === 'system' ? systemTheme : theme

    root.classList.remove('light', 'dark')
    root.classList.add(activeTheme)
    
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', activeTheme === 'dark' ? '#191919' : '#FEFEFE')
    }

    localStorage.setItem('fusioncraft-theme', theme)
  }, [theme, mounted])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(mediaQuery.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    setIsThemeOpen(false)
  }

  const handleClose = useCallback(() => {
    if (!isOpen) return
    setRotation((prev) => prev + 360)
    setTimeout(() => {
      setIsOpen(false)
      setSurfaceLocked(false)
      onOpenChange?.(false)
    }, 200)
  }, [isOpen, onOpenChange])

  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true)
      setSurfaceLocked(true)
      onOpenChange?.(true)
      // Spin counter-clockwise when opening
      setRotation((prev) => prev - 360)
      return
    }
    handleClose()
  }

  const isMobile = variant === 'mobile'

  useEffect(() => {
    if (!isOpen || isMobile) return
    const onPointerDown = (e: PointerEvent) => {
      const root = containerRef.current
      if (!root || root.contains(e.target as Node)) return
      handleClose()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [isOpen, isMobile, handleClose])

  const handleLogout = () => {
    AuthManager.logout()
    handleClose()
    router.push('/')
  }

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun, description: 'Bright and clean interface' },
    { value: 'dark' as const, label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
    { value: 'system' as const, label: 'System', icon: Monitor, description: 'Follows your system preference' }
  ]

  useScrollLock(isOpen && !isMobile)

  return (
    <div ref={containerRef} className="relative">
      {mounted ? (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggle}
            className="nav-icon-no-focus w-10 h-10 text-neutral-600 dark:text-neutral-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all duration-200 flex items-center justify-center"
            aria-label="Settings"
            aria-expanded={isOpen}
          >
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex items-center justify-center w-5 h-5"
              style={{ transformOrigin: 'center center' }}
            >
              <Settings className="w-5 h-5" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className={
                isMobile
                  ? 'relative mt-2 -ml-6 w-[calc(100%+3rem)] hero-glass-frame hero-glass-more-transparent backdrop-blur-lg rounded-tl-xl rounded-bl-xl rounded-tr-none rounded-br-none shadow-none z-10 overflow-hidden p-4 sm:ml-0 sm:w-64 sm:rounded-xl sm:rounded-r-none'
                  : 'absolute right-0 top-14 w-64 hero-glass-frame hero-glass-more-transparent backdrop-blur-lg rounded-xl shadow-none z-[1000] overflow-hidden p-4 rounded-r-none'
              }
            >
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <div className={`relative z-10 overflow-hidden settings-inner-light-depth border border-gray-200 dark:border-neutral-700 ${isMobile ? 'rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none sm:rounded-lg sm:rounded-r-none' : 'rounded-lg rounded-r-none'}`}>
              {/* Theme Section */}
              <div className="p-2">
                <button
                  onClick={() => setIsThemeOpen(!isThemeOpen)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <Palette className="w-5 h-5" />
                  <span className="font-medium">Themes</span>
                  <span className="btn-unified-circle btn-unified-circle-sm ml-auto inline-flex items-center justify-center flex-shrink-0" aria-hidden>{isThemeOpen ? '⇑' : '⇓'}</span>
                </button>

                <AnimatePresence>
                  {isThemeOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden hero-glass-frame hero-glass-frame-compact backdrop-blur-lg rounded-lg mt-1 p-2.5"
                    >
                      <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                      <div className="relative z-10 rounded-md bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 pl-4 pr-2 py-2 space-y-0">
                        {themes.map((themeOption, index) => {
                          const Icon = themeOption.icon
                          const isActive = theme === themeOption.value
                          return (
                            <div key={themeOption.value}>
                              {index > 0 && <div className="divider-faded my-1" />}
                              <motion.button
                                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleThemeChange(themeOption.value)}
                                className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-all ${
                                  isActive 
                                    ? 'bg-primary-100 dark:bg-primary-700 text-primary-700 dark:text-primary-200' 
                                    : 'text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700/50'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm">{themeOption.label}</span>
                                {isActive && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-2 h-2 bg-primary-500 rounded-full ml-auto"
                                  />
                                )}
                              </motion.button>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="divider-faded mx-2" />

              {/* Account Section */}
              <div className="p-2">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        handleClose()
                        router.push('/account')
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Account</span>
                    </button>
                    <div className="divider-faded mx-0" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleClose()
                      router.push('/login')
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Login / Sign Up</span>
                  </button>
                )}
              </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
        </>
      ) : (
        <div className="w-10 h-10" />
      )}
    </div>
  )
}

