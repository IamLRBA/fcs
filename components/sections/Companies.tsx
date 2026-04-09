'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const companies = [
  { id: 1, name: 'Abryanz', image: '/assets/images/sections/companies/abryanz.jpg' },
  { id: 2, name: 'Coutured', image: '/assets/images/sections/companies/coutured.jpg' },
  { id: 3, name: 'Creative Studio', image: '/assets/images/sections/companies/creativestudio.jpg' },
  { id: 4, name: 'Isabella Cribb', image: '/assets/images/sections/companies/isabellacribb.jpg' },
  { id: 5, name: 'Mooditive', image: '/assets/images/sections/companies/mooditive.jpg' },
  { id: 6, name: 'Silk Armour', image: '/assets/images/sections/companies/silkarmour.jpg' },
  { id: 7, name: 'Walking Wardrobe', image: '/assets/images/sections/companies/walkingwardrobe.jpg' },
]

export default function Companies() {
  const [isHovered, setIsHovered] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const cardWidth = 100
  const gap = 40
  const cardDistance = cardWidth + gap
  const totalDistance = companies.length * cardDistance
  // Start at negative position so cards can slide from left to right seamlessly
  const [sliderPosition, setSliderPosition] = useState(-totalDistance)
  const [scrollSpeed] = useState(0.7) // Reduced speed for smoother viewing
  const [isResetting, setIsResetting] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Pause if hovered
    if (isHovered || companies.length === 0) return
    const interval = setInterval(() => {
      setSliderPosition(prev => {
        // Move right by scrollSpeed pixels per frame
        const newPosition = prev + scrollSpeed
        // Reset seamlessly when we've scrolled through exactly one complete set
        // Since companies are triple-duplicated, we reset to start of second set
        // The reset is seamless because the second set is identical to the first
        if (newPosition >= 0) {
          // Mark that we're resetting for instant transition
          setIsResetting(true)
          // Reset to -totalDistance (start of second identical set)
          // The instant transition ensures no visible jump
          setTimeout(() => setIsResetting(false), 0)
          return -totalDistance
        }
        return newPosition
      })
    }, 10)
    return () => clearInterval(interval)
  }, [isHovered, scrollSpeed, totalDistance])

  // Triple-duplicate companies for seamless infinite scrolling
  // When we scroll through one set and reset, the buffer ensures no visible jump
  const duplicatedCompanies = [...companies, ...companies, ...companies]

  // Effect to measure container width
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    updateContainerWidth()
    window.addEventListener('resize', updateContainerWidth)
    return () => window.removeEventListener('resize', updateContainerWidth)
  }, [])

  // Calculate scale and opacity based on position relative to center
  const getCardTransform = (index: number) => {
    if (containerWidth === 0) return { scale: 1, opacity: 0.7, grayscale: 1 }
    
    const cardDistance = cardWidth + gap
    // Calculate the center X position of the card
    const cardCenterX = sliderPosition + (index * cardDistance) + (cardWidth / 2)
    const containerCenterX = containerWidth / 2
    const distanceFromCenter = Math.abs(cardCenterX - containerCenterX)
    
    // Maximum distance for scaling effect (half container width + some buffer)
    const maxDistance = containerWidth / 2.5
    
    // Calculate scale: 0.85 at edges (smaller), 1.25 at center
    const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1)
    const scale = 0.85 + (0.4 * (1 - normalizedDistance))
    
    // Calculate opacity: 0.7 at edges, 1 at center
    const opacity = 0.7 + (0.3 * (1 - normalizedDistance))
    
    // Calculate grayscale: fully grayscale at edges, no grayscale at center (0 = no grayscale, 1 = full grayscale)
    const grayscale = normalizedDistance > 0.2 ? 1 : 1 - (normalizedDistance / 0.2)
    
    return { scale, opacity, grayscale }
  }

  return (
    <div className="mt-16">
      <div
        className="relative"
        style={{
          borderLeft: '4px solid',
          borderRight: '4px solid',
          borderLeftColor: isDarkMode ? 'rgba(111, 78, 55, 0.4)' : 'rgba(139, 122, 90, 0.3)',
          borderRightColor: isDarkMode ? 'rgba(111, 78, 55, 0.4)' : 'rgba(139, 122, 90, 0.3)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="slider-container relative overflow-hidden py-6"
          style={{ minHeight: `${cardWidth * 1.25 + 24}px` }}
          ref={containerRef}
        >
        <motion.div 
          className="slider-track flex items-center" 
          animate={{ x: sliderPosition }} 
          transition={isResetting ? { duration: 0 } : { type: "tween", ease: "linear", duration: 0 }} 
          onMouseEnter={() => setIsHovered(true)} 
          onMouseLeave={() => setIsHovered(false)} 
          style={{ gap: `${gap}px` }}
        >
          {duplicatedCompanies.map((company, index) => {
            const transform = getCardTransform(index)
            return (
              <motion.div
                key={`${company.id}-${index}`}
                className="company-card flex-shrink-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: transform.scale * 1.1 }}
                animate={{ 
                  scale: transform.scale
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ width: `${cardWidth}px`, height: `${cardWidth}px` }}
              >
                <div className="hero-glass-frame hero-glass-frame-compact relative w-full h-full flex items-center justify-center backdrop-blur-lg">
                  <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
                <div className="company-content bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 rounded-xl p-2 shadow-lg hover:shadow-xl transition-all duration-300 border border-primary-500/30 dark:border-primary-500/40 backdrop-blur-sm w-full h-full flex items-center justify-center min-w-0 min-h-0">
                  <motion.img
                    src={company.image}
                    alt={company.name}
                    className="object-contain max-w-full max-h-full rounded-lg"
                    style={{ 
                      maxWidth: '52px', 
                      maxHeight: '52px'
                    }}
                    animate={{
                      opacity: transform.opacity,
                      filter: `grayscale(${transform.grayscale * 100}%)`
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

