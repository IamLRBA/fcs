'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Monitor, Palette } from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('system')
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('fusioncraft-theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
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
    setIsOpen(false)
  }

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun, description: 'Bright and clean interface' },
    { value: 'dark' as const, label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
    { value: 'system' as const, label: 'System', icon: Monitor, description: 'Follows your system preference' }
  ]

  return (
    <div className="relative">
      {mounted ? (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all duration-200 flex items-center justify-center"
            aria-label="Toggle theme"
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <Palette className="w-5 h-5" />
          </motion.button>

          <AnimatePresence>
            {isOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setIsOpen(false)}
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
                  className="absolute right-0 top-12 w-64 bg-white dark:bg-primary-800 rounded-xl shadow-xl border border-gray-200 dark:border-primary-700 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-primary-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Choose Theme</h3>
                    <p className="text-xs text-gray-500 dark:text-primary-400 mt-1">Select your preferred color scheme</p>
                  </div>

                  <div className="p-2">
                    {themes.map((themeOption) => {
                      const Icon = themeOption.icon
                      const isActive = theme === themeOption.value
                      return (
                        <motion.button
                          key={themeOption.value}
                          whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleThemeChange(themeOption.value)}
                          className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-primary-100 dark:bg-primary-700 text-primary-700 dark:text-primary-300'
                              : 'text-gray-700 dark:text-primary-300 hover:bg-gray-50 dark:hover:bg-primary-700/50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isActive ? 'bg-primary-200 dark:bg-primary-600' : 'bg-gray-100 dark:bg-primary-700'
                          }`}>
                            <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-primary-400'}`} />
                          </div>
                          <div className="flex-1 text-left">
                            <div className={`font-medium ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}>
                              {themeOption.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-primary-400">{themeOption.description}</div>
                          </div>
                          {isActive && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 bg-primary-500 rounded-full" />
                          )}
                        </motion.button>
                      )
                    })}
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-primary-700/50 border-t border-gray-200 dark:border-primary-700">
                    <p className="text-xs text-gray-500 dark:text-primary-400 text-center">
                      Press <kbd className="px-1 py-0.5 bg-white dark:bg-primary-600 rounded text-xs">Tab</kbd> to navigate
                    </p>
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

