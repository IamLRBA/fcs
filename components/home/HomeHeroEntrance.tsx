'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import LogoMark from '@/components/ui/LogoMark'
import Button from '@/components/ui/Button'
import ThreadConvergenceField from './ThreadConvergenceField'
import HeroScrollLagLayer from '@/components/motion/HeroScrollLagLayer'
import { useHeroScroll } from '@/hooks/useHeroScroll'

type HomeHeroEntranceProps = {
  /** When false (first-visit loader), entrance waits; when true, choreography begins. */
  ready: boolean
  onScrollToSection: (sectionId: string) => void
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]
const EASE_OUT_QUART: [number, number, number, number] = [0.25, 1, 0.5, 1]

export default function HomeHeroEntrance({ ready, onScrollToSection }: HomeHeroEntranceProps) {
  const reduceMotion = useReducedMotion()
  const { sectionRef, scrollYProgress, heroExitStyle } = useHeroScroll()
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
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-8 md:pt-12 pb-24 md:pb-28 mb-6 md:mb-10"
    >
      <ThreadConvergenceField active={entranceStarted && !instant} />

      <motion.div style={heroExitStyle} className="relative z-10 text-center w-full">
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

            </div>

            <HeroScrollLagLayer tier="trail" scrollYProgress={scrollYProgress}>
              <div className="flex flex-col items-center gap-2 xl:gap-4 w-full">
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
            </HeroScrollLagLayer>

            <HeroScrollLagLayer
              tier="drag"
              scrollYProgress={scrollYProgress}
              className="hero-cta-buttons hero-cta-home-glass mt-2 xl:mt-6 2xl:mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-10 lg:gap-12 xl:gap-16 2xl:gap-20 justify-center items-stretch sm:items-center"
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
            </HeroScrollLagLayer>
          </div>
        </div>
      </motion.div>

      <HeroScrollLagLayer
        tier="anchor"
        scrollYProgress={scrollYProgress}
        className="absolute bottom-10 md:bottom-12 left-1/2 z-20 -translate-x-1/2"
      >
        <motion.div
          initial={instant ? false : { opacity: 0 }}
          animate={entranceStarted ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: t(0.6), delay: t(2.65) }}
          className="pb-4"
        >
          <motion.div
            animate={entranceStarted ? { y: [0, 10, 0] } : { y: 0 }}
            transition={{ duration: 2, repeat: Infinity, delay: t(2.65) }}
            className="text-primary-600 dark:text-primary-400"
            aria-hidden="true"
          >
            <svg
              width="24"
              height="40"
              viewBox="0 0 24 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="block"
            >
              <rect
                x="1"
                y="1"
                width="22"
                height="38"
                rx="11"
                stroke="currentColor"
                strokeWidth="2"
              />
              <motion.g
                animate={entranceStarted ? { y: [0, 12, 0] } : { y: 0 }}
                transition={{ duration: 2, repeat: Infinity, delay: t(2.65) }}
              >
                <rect
                  x="10.5"
                  y="9"
                  width="3"
                  height="7"
                  rx="1.5"
                  fill="currentColor"
                />
              </motion.g>
            </svg>
          </motion.div>
        </motion.div>
      </HeroScrollLagLayer>
    </section>
  )
}
