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
      {/* Outer frame - glassy container (values from variables.css + globals.css) */}
      <div className="hero-glass-frame relative flex-shrink-0 backdrop-blur-lg flex items-center justify-center">
        <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
        {/* Main image container - slightly reduced size, original background */}
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
          className="relative z-10 flex-shrink-0 bg-gradient-to-br from-primary-800/30 to-primary-600/30 rounded-2xl border border-primary-500/30 overflow-hidden shadow-2xl p-2"
        >
        {/* Gradient overlay */}
        <motion.div
          animate={{
            background: [
              'linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(139, 69, 19, 0.3) 100%)',
              'linear-gradient(135deg, rgba(139, 69, 19, 0.3) 0%, rgba(139, 69, 19, 0.1) 100%)',
              'linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(139, 69, 19, 0.3) 100%)'
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 z-10 pointer-events-none"
        />

        {/* Image - slightly smaller than homepage version */}
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
          className="relative w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] md:w-[560px] md:h-[262px] lg:w-[688px] lg:h-[330px]"
        >
          <img
            src="/assets/images/sections/about-us/hero-banner.jpg"
            alt="About Us Banner"
            className="w-full h-full object-cover rounded-xl"
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
              '0 0 30px rgba(139, 69, 19, 0.3)',
              '0 0 50px rgba(139, 69, 19, 0.5)',
              '0 0 30px rgba(139, 69, 19, 0.3)'
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

