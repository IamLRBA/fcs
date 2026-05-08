'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect, type ReactNode } from 'react'

export const education = [
  {
    period: '2008 – 2012',
    level: 'Primary 3 – Primary 7 (PLE)',
    school: 'Bugema Adventist Primary School',
    details: 'Completed primary education and sat for the Primary Leaving Exams (PLE).'
  },
  {
    period: '2013 – 2016',
    level: 'Senior One – Senior Four (UCE)',
    school: 'Bugema Adventist Secondary School',
    details: 'Completed lower secondary education and sat for the Uganda Certificate of Education (UCE).'
  },
  {
    period: '2017 – 2018',
    level: 'Senior Five – Senior Six (UACE)',
    school: 'Bugema Adventist Secondary School',
    details: 'Completed advanced secondary education and sat for the Uganda Advanced Certificate of Education (UACE).'
  },
  {
    period: '2021 – Present',
    level: "Bachelor's Degree in Architecture",
    school: 'International University of East Africa',
    details: 'Currently pursuing a degree in Architecture with ongoing coursework and design projects.'
  }
]

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = () => setReduced(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

const cardMotionTransition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const
}

/** Wraps a timeline row; animates in when entering viewport and out when leaving (all breakpoints) */
function TimelineRowMotion({
  children,
  index,
  reducedMotion,
  className,
  fromRight = false
}: {
  children: ReactNode
  index: number
  reducedMotion: boolean
  className?: string
  /** mobile: slide from right; desktop left column slides from left */
  fromRight?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.15, margin: '-50px 0px' })

  const hidden = reducedMotion
    ? { opacity: 0 }
    : fromRight
      ? { opacity: 0, x: 32, y: 8 }
      : { opacity: 0, y: 24, x: index % 2 === 0 ? -20 : 20 }

  const visible = { opacity: 1, x: 0, y: 0 }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={inView ? visible : hidden}
      transition={{
        ...cardMotionTransition,
        delay: inView ? index * 0.06 : 0
      }}
    >
      {children}
    </motion.div>
  )
}

/** Timeline card — same glass/pill style for desktop (alternating) and mobile (full width, line on left) */
function TimelineCard({
  item,
  index,
  align,
  className = ''
}: {
  item: (typeof education)[0]
  index: number
  align: 'left' | 'right'
  className?: string
}) {
  /* Shorter cards by default; mobile passes max-w-none and constrains via wrapper */
  const widthClass = className.includes('max-w-none') ? '' : 'max-w-sm'
  return (
    <div
      className={`group relative w-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${widthClass} ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${className}`}
    >
      <div className="hero-glass-frame relative rounded-2xl backdrop-blur-xl">
        <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-2xl opacity-90" aria-hidden />
        <div className="relative rounded-2xl p-1">
          <div className="glass-inner-panel rounded-xl border border-primary-200/50 p-4 shadow-lg transition-shadow duration-300 group-hover:border-accent-500/30 group-hover:shadow-xl dark:border-primary-600/40 sm:p-5">
            <div className={`flex items-start gap-4 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-primary-600/20 dark:from-accent-400/15 dark:to-primary-500/10 flex items-center justify-center border border-accent-500/25 dark:border-accent-400/20">
                <span className="text-xl font-bold text-accent-600 dark:text-accent-400">{index + 1}</span>
              </div>
              <div className={`flex-1 min-w-0 ${align === 'right' ? 'items-end' : ''} flex flex-col`}>
                <span
                  className={`inline-flex rounded-full px-3 py-0.5 text-xs font-medium bg-accent-500/15 text-accent-700 dark:text-accent-300 dark:bg-accent-400/15 mb-2 ${
                    align === 'right' ? 'self-end' : 'self-start'
                  }`}
                >
                  {item.period}
                </span>
                <h3 className="text-base font-semibold text-primary-900 dark:text-primary-100 leading-snug mb-2">
                  {item.level}
                </h3>
                <div className={`flex items-center gap-2 mb-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm text-primary-700 dark:text-primary-300">{item.school}</span>
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-primary-200/60 dark:border-primary-600/50 flex-shrink-0">
                    <img
                      src={`/assets/images/sections/ceo/school-${index + 1}.jpg`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{item.details}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EducationalJourney() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  return (
    <section
      ref={containerRef}
      className="pt-20 pb-10 px-4 md:px-8 lg:px-16 bg-transparent md:pb-12"
      aria-label="Educational journey timeline"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section heading — desktop: static accent as before; mobile: can use same static to match desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-primary-500 dark:text-primary-400">EᗪᑌᑕᗩTIOᑎᗩᒪ</span>{' '}
            <span className="text-primary-800 dark:text-primary-200">ᒍOᑌᖇᑎEY</span>
          </h2>
          <div
            className="w-24 h-1 mx-auto rounded-full"
            style={{ backgroundColor: 'var(--color-accent-600)' }}
          />
        </motion.div>

        {/* Desktop — vertical timeline: center spine, alternating cards, glass + pill period */}
        <div className="hidden md:block relative max-w-5xl mx-auto py-4 pb-12">
          {/* Center spine only — no blur/glow */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-primary-400/80 via-accent-500 to-primary-600/80 dark:from-primary-500/50 dark:via-accent-400/70 dark:to-primary-400/50"
            aria-hidden
          />

          <div className="relative flex flex-col gap-10 lg:gap-14">
            {education.map((item, index) => {
              const isLeft = index % 2 === 0
              return (
                <TimelineRowMotion
                  key={index}
                  index={index}
                  reducedMotion={reducedMotion}
                  fromRight={false}
                  className="relative flex min-h-[140px] w-full flex-row items-center"
                >
                  {/* Connector at row vertical center — same line weight as spine-side stubs */}
                  <div
                    className={`absolute top-1/2 z-[1] h-0.5 w-16 -translate-y-1/2 rounded-full lg:w-24 ${
                      isLeft
                        ? 'right-1/2 mr-6 bg-gradient-to-l from-accent-500/60 to-transparent dark:from-accent-400/50'
                        : 'left-1/2 ml-6 bg-gradient-to-r from-accent-500/60 to-transparent dark:from-accent-400/50'
                    }`}
                    aria-hidden
                  />

                  {isLeft ? (
                    <>
                      <div className="flex-1 flex justify-end pr-8 lg:pr-12">
                        <TimelineCard item={item} index={index} align="right" />
                      </div>
                      <div className="relative z-10 flex-shrink-0 w-12 flex justify-center">
                        <div className="w-4 h-4 rounded-full bg-accent-500 shadow-[0_0_0_4px_var(--color-primary-100)] dark:shadow-[0_0_0_4px_var(--color-neutral-900)]" />
                      </div>
                      <div className="flex-1" />
                    </>
                  ) : (
                    <>
                      <div className="flex-1" />
                      <div className="relative z-10 flex-shrink-0 w-12 flex justify-center">
                        <div className="w-4 h-4 rounded-full bg-accent-500 shadow-[0_0_0_4px_var(--color-primary-100)] dark:shadow-[0_0_0_4px_var(--color-neutral-900)]" />
                      </div>
                      <div className="flex-1 flex justify-start pl-8 lg:pl-12">
                        <TimelineCard item={item} index={index} align="left" />
                      </div>
                    </>
                  )}
                </TimelineRowMotion>
              )
            })}
          </div>
        </div>

        {/* Smaller screens — dot left of spine; connector runs from spine to card */}
        <div className="md:hidden relative">
          <div
            className="absolute left-6 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-primary-500 via-accent-500 to-primary-600 opacity-80"
            aria-hidden
          />
          <div className="space-y-8 pl-0">
            {education.map((item, index) => (
              <TimelineRowMotion
                key={index}
                index={index}
                reducedMotion={reducedMotion}
                fromRight
                className="relative flex min-h-[4rem] items-center"
              >
                  {/* Left column: dot + space up to spine right edge so connector terminates at spine edge */}
                  <div className="relative flex-shrink-0 w-[1.75rem] flex items-center justify-start pr-0">
                    <div
                      className="absolute left-0.5 top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500 shadow-[0_0_0_4px_var(--color-primary-100)] dark:shadow-[0_0_0_4px_var(--color-neutral-900)]"
                      aria-hidden
                    />
                  </div>
                  {/* Connector: horizontal line from spine right edge to card */}
                  <div className="relative flex-1 min-w-0 flex items-center">
                    <div
                      className="pointer-events-none absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-accent-500/60 to-transparent dark:from-accent-400/50"
                      aria-hidden
                    />
                  </div>
                  {/* Card — wider on larger small screens so gap to spine isn't too large */}
                  <div className="relative flex-shrink-0 w-full max-w-[20rem] sm:max-w-[26rem]">
                    <TimelineCard
                      item={item}
                      index={index}
                      align="left"
                      className="relative z-[1] w-full max-w-none"
                    />
                  </div>
              </TimelineRowMotion>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
