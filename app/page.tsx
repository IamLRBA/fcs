'use client'

import { 
  motion, 
  AnimatePresence, 
} from 'framer-motion'
import { useState, useEffect, useLayoutEffect } from 'react'
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
import ScrollScale from '@/components/motion/ScrollScale'

const VISITED_KEY = 'mysticalpieces-visited'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPortals, setShowPortals] = useState(true)

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
        {/* Lightweight static accents (no full-screen blur, no infinite motion) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-16 h-16 border-2 border-primary-500/15 rotate-12 rounded-sm" />
          <div className="absolute bottom-1/4 right-1/4 w-20 h-20 border-2 border-accent-500/15 -rotate-45 rounded-sm" />
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
              {/* Hero Section */}
              <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-8 md:pt-12">
                <ScrollScale
                  as="div"
                  variant="heroExit"
                  className="relative z-10 text-center w-full"
                >
                  <motion.div 
                    className="container-custom"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-4 xl:gap-7 2xl:gap-9">
                      <LogoMark animated size={250} className="md:scale-[0.8] md:-mb-16 xl:-mb-20 2xl:-mb-24" />
                      <div className="flex flex-col items-center gap-2 xl:gap-4 w-full">
                        <h1 className="relative text-3xl sm:text-4xl md:text-7xl font-light leading-tight mb-1 xl:mb-3">
                          <span className="relative z-10">
                          <MysticalPiecesWord mysticalClassName="text-primary-800 dark:text-primary-100" piecesClassName="text-accent-600 dark:text-accent-400" />
                          </span>
                        </h1>
                        <div className="hero-divider w-20 h-1 bg-primary-400/80 dark:bg-primary-500/60 rounded-full xl:my-1" />
                        <p className="text-lg xl:text-xl text-primary-600 dark:text-primary-300 max-w-2xl xl:mt-1">
                        Thrifted Gentlemen's Clothing
                        </p>
                      </div>
                      {/* Home hero only: semi-transparent glass around each CTA; md+ more gap + padding */}
                      <div className="hero-cta-buttons hero-cta-home-glass mt-2 xl:mt-6 2xl:mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-10 lg:gap-12 xl:gap-16 2xl:gap-20 justify-center items-stretch sm:items-center">
                        <div className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-lg rounded-full shrink-0">
                          <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-full" aria-hidden />
                          <div className="relative rounded-full p-1 sm:p-1.5 md:p-2">
                            <Button
                              variant="default"
                              size="lg"
                              className="text-sm sm:text-lg px-5 sm:px-8 md:px-10 py-2.5 sm:py-4 md:py-4"
                              onClick={() => scrollToSection('portals-section')}
                            >
                              EᑎTEᖇ ᔕᕼOᑭ
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
                </ScrollScale>

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

              {/* Featured + shop entry: one visual section (tight internal gap) */}
              <FeaturedCollections />

              <section id="portals-section" className="relative overflow-visible px-4 pb-16 pt-0 md:pb-20">
                <div className="container-custom relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="section-title"
                  >
                    <h2 className="text-4xl md:text-5xl font-bold text-primary-800 dark:text-primary-100 mb-6">
                    EᑎTEᖇ <span className="text-accent-600 dark:text-accent-400">the ᔕᕼOᑭ</span>
                    </h2>
                    <p className="text-xl text-primary-700 dark:text-primary-300 max-w-3xl mx-auto">
                      Click the image below to EᑎTEᖇ into our ᔕᕼOᑭ
                    </p>
                  </motion.div>

                  <AnimatePresence>
                    {showPortals && (
                      <ScrollScale as="div" variant="centerPeak" intensity="emphasis">
                        <PortalNavigation />
                      </ScrollScale>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* Stats Section */}
              <Stats />

              {/* Testimonials Section */}
              <ScrollScale as="div" variant="centerPeak" intensity="subtle" edgeToEdge>
                <Testimonials />
              </ScrollScale>

              {/* Contact Section */}
              <div id="contact-section">
                <Contact />
              </div>
        </motion.div>
      </main>
    </>
  )
} 
