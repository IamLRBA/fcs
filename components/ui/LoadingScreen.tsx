'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const logoSteps = [
    { text: "F", delay: 0 },
    { text: "u", delay: 200 },
    { text: "s", delay: 400 },
    { text: "i", delay: 600 },
    { text: "o", delay: 800 },
    { text: "n", delay: 1000 },
    { text: "C", delay: 1200 },
    { text: "R", delay: 1400 },
    { text: "A", delay: 1600 },
    { text: "F", delay: 1800 },
    { text: "T", delay: 2000 }
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true)
      setTimeout(onComplete, 1000)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  useEffect(() => {
    if (currentStep < logoSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [currentStep, logoSteps.length])

  useEffect(() => {
    // Set dimensions on client side
    if (typeof window !== 'undefined') {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })

      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center"
    >
      <div className="text-center">
        {/* Logo Assembly Animation */}
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center space-x-1 mb-6"
          >
            {logoSteps.map((step, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.5 }}
                animate={{
                  opacity: index <= currentStep ? 1 : 0,
                  y: index <= currentStep ? 0 : 20,
                  scale: index <= currentStep ? 1 : 0.5
                }}
                transition={{
                  duration: 0.3,
                  delay: step.delay / 1000,
                  type: "spring",
                  stiffness: 200
                }}
                className="text-6xl md:text-8xl font-bold text-white"
              >
                {step.text}
              </motion.span>
            ))}
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-primary-200 font-light"
          >
            Materializing ideas through structural ingenuity
          </motion.p>
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-2 bg-primary-700 rounded-full overflow-hidden mx-auto mb-8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: isComplete ? "100%" : "0%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-accent-400 to-accent-600 rounded-full"
          />
        </div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-primary-300 text-lg"
        >
          {isComplete ? "Ready!" : "Loading..."}
        </motion.p>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: dimensions.width > 0 ? Math.random() * dimensions.width : 0,
                y: dimensions.height > 0 ? Math.random() * dimensions.height : 0,
                opacity: 0
              }}
              animate={{
                x: dimensions.width > 0 ? Math.random() * dimensions.width : 0,
                y: dimensions.height > 0 ? Math.random() * dimensions.height : 0,
                opacity: dimensions.width > 0 && dimensions.height > 0 ? [0, 0.3, 0] : 0,
                rotate: dimensions.width > 0 && dimensions.height > 0 ? [0, 360] : 0
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: i * 1.5,
                ease: "linear"
              }}
              className="absolute w-2 h-2 bg-accent-400 rounded-full"
            />
          ))}
        </div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-8"
        >
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
                className="w-3 h-3 bg-accent-400 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
