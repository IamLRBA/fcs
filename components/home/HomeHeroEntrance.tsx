'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import LogoMark from '@/components/ui/LogoMark'
import Button from '@/components/ui/Button'
import ScrollScale from '@/components/motion/ScrollScale'
import ThreadConvergenceField from './ThreadConvergenceField'

type HomeHeroEntranceProps = {
  /** When false (first-visit loader), entrance waits; when true, choreography begins. */
  ready: boolean
  onScrollToSection: (sectionId: string) => void
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]
const EASE_OUT_QUART: [number, number, number, number] = [0.25, 1, 0.5, 1]

export default function HomeHeroEntrance({ ready, onScrollToSection }: HomeHeroEntranceProps) {
  const reduceMotion = useReducedMotion()
  const [entranceStarted, setEntranceStarted] = useState(false)

  useEffect(() => {
    if (!ready) {
      setEntranceStarted(false)
      return
    }
    setEntranceStarted(true)
  }, [ready])

  const instant = Boolean(reduceMotion)
  const t = (seconds: number) => (instant ? 0 : seconds)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-8 md:pt-12">
      <ThreadConvergenceField active={entranceStarted && !instant} />

      <ScrollScale as="div" variant="heroExit" className="relative z-10 text-center w-full">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-4 xl:gap-7 2xl:gap-9">
            {/* Logo — crystallizes from woven light */}
            <motion.div
              className="md:scale-[0.8] md:-mb-16 xl:-mb-20 2xl:-mb-24"
              initial={
                instant
                  ? false
                  : { opacity: 0, scale: 0.55, filter: 'blur(16px)', rotate: -10 }
              }
              animate={
                entranceStarted
                  ? { opacity: 1, scale: 1, filter: 'blur(0px)', rotate: 0 }
                  : { opacity: 0, scale: 0.55, filter: 'blur(16px)', rotate: -10 }
              }
              transition={{
                duration: t(1.05),
                delay: t(0.72),
                ease: EASE_OUT_EXPO,
              }}
            >
              <LogoMark animated size={250} />
            </motion.div>

            <div className="flex flex-col items-center gap-2 xl:gap-4 w-full">
              <h1 className="relative text-3xl sm:text-4xl md:text-7xl font-light leading-tight mb-1 xl:mb-3">
                <span className="relative z-10 mysticalpieces-word inline-flex items-baseline flex-wrap justify-center gap-x-[0.25em]">
                  <motion.span
                    className="mysticalpieces-word__m text-primary-800 dark:text-primary-100 inline-block"
                    initial={instant ? false : { opacity: 0, x: -56, filter: 'blur(8px)' }}
                    animate={
                      entranceStarted
                        ? { opacity: 1, x: 0, filter: 'blur(0px)' }
                        : { opacity: 0, x: -56, filter: 'blur(8px)' }
                    }
                    transition={{ duration: t(0.85), delay: t(1.15), ease: EASE_OUT_EXPO }}
                  >
                    Mystical
                  </motion.span>
                  <motion.span
                    className="mysticalpieces-word__p text-accent-600 dark:text-accent-400 inline-flex items-baseline"
                    initial={instant ? false : { opacity: 0, x: 56, filter: 'blur(8px)' }}
                    animate={
                      entranceStarted
                        ? { opacity: 1, x: 0, filter: 'blur(0px)' }
                        : { opacity: 0, x: 56, filter: 'blur(8px)' }
                    }
                    transition={{ duration: t(0.85), delay: t(1.28), ease: EASE_OUT_EXPO }}
                  >
                    PIECE
                    <span className="mysticalpieces-word__s relative inline-flex items-start">
                      S
                      <span className="mysticalpieces-word__symbol" aria-hidden="true">
                        ®
                      </span>
                    </span>
                  </motion.span>
                </span>
              </h1>

              {/* Divider — golden thread pulled across */}
              <motion.div
                className="hero-divider w-20 h-1 bg-primary-400/80 dark:bg-primary-500/60 rounded-full xl:my-1 origin-center"
                initial={instant ? false : { scaleX: 0, opacity: 0 }}
                animate={
                  entranceStarted ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }
                }
                transition={{ duration: t(0.65), delay: t(1.62), ease: EASE_OUT_QUART }}
              />

              <motion.p
                className="text-lg xl:text-xl text-primary-600 dark:text-primary-300 max-w-2xl xl:mt-1"
                initial={instant ? false : { opacity: 0, y: 18, filter: 'blur(6px)' }}
                animate={
                  entranceStarted
                    ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                    : { opacity: 0, y: 18, filter: 'blur(6px)' }
                }
                transition={{ duration: t(0.75), delay: t(1.78), ease: EASE_OUT_EXPO }}
              >
                Thrifted Gentlemen&apos;s Clothing
              </motion.p>
            </div>

            <motion.div
              className="hero-cta-buttons hero-cta-home-glass mt-2 xl:mt-6 2xl:mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-10 lg:gap-12 xl:gap-16 2xl:gap-20 justify-center items-stretch sm:items-center"
              initial={instant ? false : { opacity: 0 }}
              animate={entranceStarted ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: t(0.4), delay: t(2.0) }}
            >
              {[
                {
                  label: 'EᑎTEᖇ ᔕᕼOᑭ',
                  variant: 'default' as const,
                  target: 'portals-section',
                },
                {
                  label: 'GET Iᑎ TOᑌᑕᕼ',
                  variant: 'filled' as const,
                  target: 'contact-section',
                },
              ].map((cta, i) => (
                <motion.div
                  key={cta.target}
                  className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-lg rounded-full shrink-0 overflow-hidden"
                  initial={instant ? false : { opacity: 0, y: 36, scale: 0.92 }}
                  animate={
                    entranceStarted
                      ? { opacity: 1, y: 0, scale: 1 }
                      : { opacity: 0, y: 36, scale: 0.92 }
                  }
                  transition={{
                    duration: t(0.7),
                    delay: t(2.08 + i * 0.14),
                    ease: EASE_OUT_EXPO,
                  }}
                >
                  {!instant && entranceStarted && (
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/25 to-transparent dark:via-white/10"
                      initial={{ x: '-120%' }}
                      animate={{ x: '120%' }}
                      transition={{
                        duration: 0.75,
                        delay: t(2.35 + i * 0.14),
                        ease: EASE_OUT_QUART,
                      }}
                    />
                  )}
                  <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-full" aria-hidden />
                  <div className="relative rounded-full p-1 sm:p-1.5 md:p-2">
                    <Button
                      variant={cta.variant}
                      size="lg"
                      className="text-sm sm:text-lg px-5 sm:px-8 md:px-10 py-2.5 sm:py-4 md:py-4"
                      onClick={() => onScrollToSection(cta.target)}
                    >
                      {cta.label}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </ScrollScale>

      <motion.div
        initial={instant ? false : { opacity: 0 }}
        animate={entranceStarted ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: t(0.6), delay: t(2.65) }}
        className="absolute bottom-2 md:bottom-1 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={entranceStarted ? { y: [0, 10, 0] } : { y: 0 }}
          transition={{ duration: 2, repeat: Infinity, delay: t(2.65) }}
          className="w-6 h-10 border-2 border-primary-600 dark:border-primary-400 rounded-full flex justify-center"
        >
          <motion.div
            animate={entranceStarted ? { y: [0, 12, 0] } : { y: 0 }}
            transition={{ duration: 2, repeat: Infinity, delay: t(2.65) }}
            className="w-1 h-3 bg-primary-600 dark:bg-primary-400 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
