'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function AnimatedImageBannerAboutUs() {
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
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative max-w-7xl mx-auto flex justify-center"
    >
      {/* Outer frame - glassy container; size sets the "length", padding gives equal gap */}
      <div className="hero-glass-frame relative w-[calc(80vw+3rem)] max-w-[380px] h-[308px] sm:w-[calc(85vw+3rem)] sm:max-w-[560px] sm:h-[428px] md:w-[720px] md:h-[340px] lg:w-[880px] lg:h-[406px] mx-auto md:flex-shrink-0 backdrop-blur-lg flex items-center justify-center">
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
          className="absolute inset-6 z-10 bg-gradient-to-br from-primary-800/30 to-primary-600/30 rounded-2xl border border-primary-500/30 overflow-hidden shadow-2xl"
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
          className="absolute inset-0 z-10 pointer-events-none"
        />

        {/* Image wrapper - fills brown with equal inset (0.5rem) so equal gap to glass on all sides */}
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
          className="absolute inset-2 min-w-0 min-h-0 overflow-hidden rounded-lg"
        >
          <img
            src="/assets/images/sections/about-us/hero-banner.jpg"
            alt="About Us Banner"
            className="absolute inset-0 rounded-xl block"
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
  )
}

