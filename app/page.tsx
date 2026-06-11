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
import HomeHeroEntrance from '@/components/home/HomeHeroEntrance'
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
              <HomeHeroEntrance ready={!isLoading} onScrollToSection={scrollToSection} />

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
                      <ScrollScale
                        as="div"
                        variant="centerPeak"
                        scaleMode="rest"
                        intensity="emphasis"
                        smooth
                      >
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
