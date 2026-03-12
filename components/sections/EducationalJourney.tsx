'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export const education = [
  {
    period: "2008 – 2012",
    level: "Primary 3 – Primary 7 (PLE)",
    school: "Bugema Adventist Primary School",
    details: "Completed primary education and sat for the Primary Leaving Exams (PLE)."
  },
  {
    period: "2013 – 2016",
    level: "Senior One – Senior Four (UCE)",
    school: "Bugema Adventist Secondary School",
    details: "Completed lower secondary education and sat for the Uganda Certificate of Education (UCE)."
  },
  {
    period: "2017 – 2018",
    level: "Senior Five – Senior Six (UACE)",
    school: "Bugema Adventist Secondary School",
    details: "Completed advanced secondary education and sat for the Uganda Advanced Certificate of Education (UACE)."
  },
  {
    period: "2021 – Present",
    level: "Bachelor's Degree in Architecture",
    school: "International University of East Africa",
    details: "Currently pursuing a degree in Architecture with ongoing coursework and design projects."
  }
]

export default function EducationalJourney() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const pathLength = useTransform(scrollYProgress, [0, 0.8], [0, 1])
  const guideDotProgress = useTransform(scrollYProgress, [0, 0.8], [0, 1])

  return (
    <section
      ref={containerRef}
      className="py-20 px-4 md:px-8 lg:px-16 bg-transparent"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
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

        {/* Desktop Timeline */}
        <div className="hidden md:block relative">
          <svg 
            viewBox="0 0 1000 800" 
            className="w-full h-auto"
            style={{ minHeight: '600px' }}
          >
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'var(--color-primary-500)' }} />
                <stop offset="100%" style={{ stopColor: 'var(--color-accent-500)' }} />
              </linearGradient>
            </defs>
            
            {/* Animated Path */}
            <motion.path
              d="M 50 100 L 950 100 L 950 300 L 50 300 L 50 500 L 950 500 L 950 700 L 50 700"
              fill="none"
              stroke="url(#pathGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="1"
              strokeDashoffset={pathLength}
              style={{ pathLength: pathLength }}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />

            {/* Animated Guide Dot */}
            <motion.circle
              r="6"
              fill="var(--color-accent-500)"
              filter="drop-shadow(0 0 8px var(--color-accent-500))"
              cx={useTransform(guideDotProgress, [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1], [50, 950, 950, 50, 50, 950, 950, 50, 50])}
              cy={useTransform(guideDotProgress, [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1], [100, 100, 300, 300, 500, 500, 700, 700, 700])}
            />
          </svg>

          {/* Desktop Milestones */}
          {education.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.5 + (index * 0.2),
                ease: "easeInOut"
              }}
              whileHover={{ scale: 1.05 }}
              className="absolute"
              style={{
                left: index % 2 === 0 ? '5%' : '65%',
                top: `${(index * 25) + 12.5}%`,
                transform: 'translateY(-50%)'
              }}
            >
              {/* Outer: semi-transparent shell unchanged; inner card inset so glass margin shows all around */}
              <div className={`hero-glass-frame hero-glass-frame-compact relative w-72 rounded-xl backdrop-blur-lg overflow-hidden ${index % 2 === 0 ? 'mr-auto' : 'ml-auto'}`}>
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-xl" aria-hidden />
                <div className="relative p-2.5 sm:p-3 md:p-3.5">
                <div
                  className="relative w-full mx-auto p-2.5 sm:p-3 rounded-lg border border-primary-200/40 dark:border-primary-600/50 bg-primary-50/40 dark:bg-neutral-900/50 shadow-md transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-start gap-2">
                    <div className="text-3xl font-bold text-primary-400 dark:text-primary-500 flex-shrink-0 leading-none w-8 text-center">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium mb-0.5 text-accent-600 dark:text-accent-400">
                        {item.period}
                      </div>
                      <h3 className="text-sm font-semibold mb-1 text-primary-900 dark:text-primary-100 leading-tight">
                        {item.level}
                      </h3>
                      <div className="flex items-center flex-wrap gap-1.5 mb-1">
                        <h4 className="text-xs font-medium text-primary-700 dark:text-primary-300 leading-tight">
                          {item.school}
                        </h4>
                        <div className="w-6 h-6 rounded-md overflow-hidden border border-primary-200/60 dark:border-primary-600/60 flex-shrink-0">
                          <img
                            src={`/assets/images/sections/ceo/school-${index + 1}.jpg`}
                            alt={`${item.school} Badge`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <p className="text-xs leading-snug text-neutral-700 dark:text-neutral-300">
                        {item.details}
                      </p>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Timeline */}
        <div className="block md:hidden relative px-4">
          <svg 
            viewBox="0 0 400 1400" 
            className="w-full h-auto"
            style={{ minHeight: '1400px' }}
          >
            <defs>
              <linearGradient id="mobilePathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'var(--color-primary-500)' }} />
                <stop offset="100%" style={{ stopColor: 'var(--color-accent-500)' }} />
              </linearGradient>
            </defs>
            
            {/* Animated Path - moved to left side */}
            <motion.path
              d="M 15 15 L 15 350 L 15 650 L 15 950 L 15 1250 L 15 1350"
              fill="none"
              stroke="url(#mobilePathGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="1"
              strokeDashoffset={pathLength}
              style={{ pathLength: pathLength }}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />

            {/* Animated Guide Dot - moved to left side */}
            <motion.circle
              cx="25"
              r="8"
              fill="var(--color-accent-500)"
              filter="drop-shadow(0 0 8px var(--color-accent-500))"
              cy={useTransform(guideDotProgress, [0, 1], [25, 1350])}
            />
          </svg>

          {/* Mobile Milestones */}
          {education.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.5 + (index * 0.2),
                ease: "easeInOut"
              }}
              whileHover={{ scale: 1.05 }}
              className="absolute"
              style={{
                left: '50px',
                top: index === 0 ? '5%' : index === 1 ? '28%' : index === 2 ? '51%' : '74%',
                width: 'calc(100% - 4.5rem)',
                maxWidth: '320px',
                zIndex: education.length - index
              }}
            >
              <div className="hero-glass-frame hero-glass-frame-compact relative w-full rounded-xl backdrop-blur-lg overflow-hidden">
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-xl" aria-hidden />
                <div className="relative p-2.5 sm:p-3">
                <div className="relative w-full p-2.5 sm:p-3 rounded-lg border border-primary-200/40 dark:border-primary-600/50 bg-primary-50/40 dark:bg-neutral-900/50 shadow-md transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-start gap-2">
                    <div className="text-2xl font-bold text-primary-400 dark:text-primary-500 flex-shrink-0 leading-none w-7 text-center">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-medium mb-0.5 text-accent-600 dark:text-accent-400">
                        {item.period}
                      </div>
                      <h3 className="text-sm font-semibold mb-0.5 text-primary-900 dark:text-primary-100 leading-tight">
                        {item.level}
                      </h3>
                      <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
                        <h4 className="text-xs font-medium text-primary-700 dark:text-primary-300 leading-tight">
                          {item.school}
                        </h4>
                        <div className="w-5 h-5 rounded-md overflow-hidden border border-primary-200/60 dark:border-primary-600/60 flex-shrink-0">
                          <img
                            src={`/assets/images/sections/ceo/school-${index + 1}.jpg`}
                            alt={`${item.school} Badge`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] leading-snug text-neutral-700 dark:text-neutral-300">
                        {item.details}
                      </p>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
