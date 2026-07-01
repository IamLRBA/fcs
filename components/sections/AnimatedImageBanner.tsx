'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import ScrollScale from '@/components/motion/ScrollScale'

export default function AnimatedImageBanner() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <ScrollScale as="section" variant="centerPeak" intensity="normal" className="relative mt-10 w-full overflow-hidden pb-8 pt-8 md:mt-14 md:pb-12 md:pt-12">
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-7xl mx-auto flex justify-center"
        >
          {/* Outer frame - glassy container; size sets the "length", padding gives equal gap */}
          <div className="hero-glass-frame relative w-[calc(80vw+3rem)] max-w-[380px] h-[308px] sm:w-[calc(85vw+3rem)] sm:max-w-[560px] sm:h-[428px] md:w-[900px] md:h-[380px] lg:w-[1100px] lg:h-[460px] mx-auto md:flex-shrink-0 backdrop-blur-lg flex items-center justify-center">
            <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
            {/* Brown container - fills glass with equal inset (1.5rem = padding) */}
            <motion.div
              animate={{
                rotateY: [0, 5, -5, 5, 0],
                rotateX: [0, 2, -2, 2, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${mousePosition.y}deg)`
              }}
              className="absolute inset-6 z-10 bg-transparent border border-transparent rounded-2xl overflow-hidden shadow-none"
            >
            {/* Gradient overlay */}
            <motion.div
              animate={{
                background: [
                  'linear-gradient(135deg, rgb(var(--color-brand-glow-rgb) / 0.1) 0%, rgb(var(--color-brand-glow-rgb) / 0.3) 100%)',
                  'linear-gradient(135deg, rgb(var(--color-brand-glow-rgb) / 0.3) 0%, rgb(var(--color-brand-glow-rgb) / 0.1) 100%)',
                  'linear-gradient(135deg, rgb(var(--color-brand-glow-rgb) / 0.1) 0%, rgb(var(--color-brand-glow-rgb) / 0.3) 100%)'
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 z-10 pointer-events-none opacity-0"
            />

            {/* Image wrapper now fills container edge-to-edge */}
            <motion.div
              animate={{
                scale: [0.95, 1, 0.95],
                filter: ['brightness(1)', 'brightness(1.1)', 'brightness(1)']
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 min-w-0 min-h-0 overflow-hidden rounded-2xl"
            >
              <img
                src="/assets/images/sections/home/hero-banner.jpg"
                alt="Creative Banner"
                className="absolute inset-0 rounded-2xl block shadow-2xl"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/assets/images/placeholder.jpg'
                }}
              />
            </motion.div>

            {/* Animated border glow */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 30px rgb(var(--color-brand-glow-rgb) / 0.3)',
                  '0 0 50px rgb(var(--color-brand-glow-rgb) / 0.5)',
                  '0 0 30px rgb(var(--color-brand-glow-rgb) / 0.3)'
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-2xl border-2 border-primary-400/30 pointer-events-none"
            />

            {/* Floating decorative elements */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  x: [0, 10, 0],
                  rotate: [0, 180, 360],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5
                }}
                className="absolute w-4 h-4 border-2 border-primary-500/40 rounded-full"
                style={{
                  top: `${20 + i * 15}%`,
                  left: `${10 + i * 15}%`,
                }}
              />
            ))}
          </motion.div>
          </div>
        </motion.div>
      </div>
    </ScrollScale>
  )
}

