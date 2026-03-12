'use client'

import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform 
} from 'framer-motion'
import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import LoadingScreen from '@/components/ui/LoadingScreen'
import PortalNavigation from '@/components/ui/PortalNavigation'
import FeaturedCollections from '@/components/sections/FeaturedCollections'
import Stats from '@/components/sections/Stats'
import Testimonials from '@/components/sections/Testimonials'
import Contact from '@/components/sections/Contact'
import AnimatedImageBanner from '@/components/sections/AnimatedImageBanner'
import LogoMark from '@/components/ui/LogoMark'
import MysticalPiecesWord from '@/components/ui/MysticalPiecesWord'
import Button from '@/components/ui/Button'

const VISITED_KEY = 'mysticalpieces-visited'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPortals, setShowPortals] = useState(true)
  
  // Scroll-based effects
  const heroRef = useRef<HTMLElement>(null)
  const portalsRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll()
  const { scrollYProgress: heroScrollY } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const { scrollYProgress: portalsScrollY } = useScroll({
    target: portalsRef,
    offset: ["start end", "end start"]
  })

  const { scrollYProgress: testimonialsScrollY } = useScroll({
    target: testimonialsRef,
    offset: ["start end", "end start"]
  })

  const heroScale = useTransform(heroScrollY, [0, 1], [1, 0.8])
  const heroOpacity = useTransform(heroScrollY, [0, 0.5], [1, 0])
  const heroY = useTransform(heroScrollY, [0, 1], [0, -100])
  
  const portalsScale = useTransform(portalsScrollY, [0, 0.5, 1], [1, 1.1, 1])
  const testimonialsScale = useTransform(testimonialsScrollY, [0, 0.5, 1], [1, 1.05, 1])
  const progressBarScaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  /* Must be unconditional – was inside !isLoading branch and caused "fewer hooks than expected" */
  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const hasVisited = localStorage.getItem(VISITED_KEY)
    if (!hasVisited) setIsLoading(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hasVisited = localStorage.getItem(VISITED_KEY)
    if (hasVisited) {
      setIsLoading(false)
      setShowPortals(true)
    }
  }, [])

  const handleLoadingComplete = () => {
    setIsLoading(false)
    localStorage.setItem(VISITED_KEY, 'true')
    setShowPortals(true)
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <main className="min-h-screen bg-unified relative overflow-hidden">
        {/* Unified Background Elements - applied to entire page */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-accent-200/30 to-accent-400/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-primary-300/30 to-primary-500/30 rounded-full blur-3xl"
          />
          {/* Enhanced Particle System */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                  scale: 0
                }}
                animate={{
                  x: [0, 1200, 0],
                  y: [0, 800, 0],
                  opacity: [0, 0.6, 0],
                  scale: [0, 1, 0],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 8 + (i * 0.2),
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
                className="absolute w-2 h-2 bg-accent-400/60 rounded-full"
                style={{
                  left: `${(i * 5) % 100}%`,
                  top: `${(i * 7) % 100}%`
                }}
              />
            ))}
          </div>
          
          {/* Geometric Shapes */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 30, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute top-1/4 left-1/4 w-16 h-16 border-2 border-primary-500/20 transform rotate-30"
          />
          
          <motion.div
            animate={{ 
              rotate: [360, 0],
              scale: [1.2, 1, 1.2]
            }}
            transition={{ 
              duration: 35, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute bottom-1/4 right-1/4 w-20 h-20 border-2 border-accent-500/20 transform -rotate-45"
          />
        </div>

        {/* Loading overlay – first visit only; main content stays mounted underneath so hero is complete when overlay exits */}
        <AnimatePresence>
          {isLoading && (
            <LoadingScreen onComplete={handleLoadingComplete} />
          )}
        </AnimatePresence>

        {/* Main Content – always mounted; hidden while loading so layout/hero are ready when overlay fades */}
        <motion.div
          className={isLoading ? 'opacity-0 pointer-events-none select-none' : 'opacity-100'}
          initial={false}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 0.5 }}
          aria-hidden={isLoading}
        >
              {/* Progress Bar */}
              <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500 z-50 origin-left"
                style={{ scaleX: progressBarScaleX }}
              />

              {/* Hero Section */}
              <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-8 md:pt-12">
                <div className="relative z-10 text-center">
                  <motion.div 
                    className="container-custom"
                    style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="mb-8"
                    >
                      <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-4">
                        <LogoMark animated size={250} className="md:scale-[0.8] md:-mb-16" />
                        <div className="flex flex-col items-center gap-2 w-full">
                          <h1 className="text-3xl sm:text-4xl md:text-7xl font-light leading-tight mb-1">
                            <MysticalPiecesWord mysticalClassName="text-primary-800 dark:text-primary-100" piecesClassName="text-accent-600 dark:text-accent-400" />
                          </h1>
                          <div className="hero-divider w-20 h-1 bg-primary-400/80 dark:bg-primary-500/60 rounded-full" />
                          <p className="text-lg text-primary-600 dark:text-primary-300 max-w-2xl">
                            Mysticism, Anarchism & Self Discovery!
                          </p>
                        </div>
                        {/* Home hero only: semi-transparent glass around each CTA; md+ more gap + padding */}
                        <div className="hero-cta-buttons hero-cta-home-glass flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-10 lg:gap-12 justify-center items-stretch sm:items-center">
                          <div className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-lg rounded-full shrink-0">
                            <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-full" aria-hidden />
                            <div className="relative rounded-full p-1 sm:p-1.5 md:p-2">
                              <Button
                                variant="default"
                                size="lg"
                                className="text-sm sm:text-lg px-5 sm:px-8 md:px-10 py-2.5 sm:py-4 md:py-4"
                                onClick={() => scrollToSection('portals-section')}
                              >
                                ᗪIᐯE Iᑎ ᑎOᗯ
                              </Button>
                            </div>
                          </div>
                          <div className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-lg rounded-full shrink-0">
                            <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-full" aria-hidden />
                            <div className="relative rounded-full p-1 sm:p-1.5 md:p-2">
                              <Button
                                variant="filled"
                                size="lg"
                                className="text-sm sm:text-lg px-5 sm:px-8 md:px-10 py-2.5 sm:py-4 md:py-4"
                                onClick={() => scrollToSection('contact-section')}
                              >
                                GET Iᑎ TOᑌᑕᕼ
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="absolute bottom-2 md:bottom-1 left-1/2 transform -translate-x-1/2"
                >
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-6 h-10 border-2 border-primary-600 dark:border-primary-400 rounded-full flex justify-center"
                  >
                    <motion.div
                      animate={{ y: [0, 12, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-1 h-3 bg-primary-600 dark:bg-primary-400 rounded-full mt-2"
                    />
                  </motion.div>
                </motion.div>
              </section>

              {/* Animated Image Banner */}
              <AnimatedImageBanner />

              {/* Featured Collections Section */}
              <FeaturedCollections />

              {/* Portals Section */}
              <section ref={portalsRef} id="portals-section" className="section relative">
                <div className="container-custom relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-8"
                  >
                    <div className="hero-glass-frame relative inline-block backdrop-blur-lg mb-6 rounded-full">
                      <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-full" aria-hidden />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center space-x-3 text-primary-600 dark:text-primary-300 text-sm md:text-base bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 px-6 py-3 rounded-full shadow-lg border border-primary-500/30 dark:border-primary-500/40 backdrop-blur-sm"
                      >
                        <motion.span
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          ✧
                        </motion.span>
                        <span className="font-medium">Step into the portal to explore future-forward thrift finds</span>
                        <motion.span
                          animate={{ y: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          ⇓
                        </motion.span>
                      </motion.div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="section-title"
                  >
                    <h2 className="text-4xl md:text-5xl font-bold text-primary-800 dark:text-primary-100 mb-6">
                    EᑎTEᖇ <span className="text-accent-600 dark:text-accent-400">the Portal</span>
                    </h2>
                    <p className="text-xl text-primary-700 dark:text-primary-300 max-w-3xl mx-auto">
                      Discover future-ready thrift pieces, each piece waiting to reveal its story
                    </p>
                  </motion.div>

                  <AnimatePresence>
                    {showPortals && (
                      <motion.div
                        style={{ scale: portalsScale }}
                        transition={{ duration: 0.3 }}
                      >
                        <PortalNavigation />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* Stats Section */}
              <Stats />

              {/* Testimonials Section */}
              <motion.div
                ref={testimonialsRef}
                style={{ scale: testimonialsScale }}
                transition={{ duration: 0.3 }}
              >
                <Testimonials />
              </motion.div>

              {/* Contact Section */}
              <div id="contact-section">
                <Contact />
              </div>
        </motion.div>
      </main>
    </>
  )
} 