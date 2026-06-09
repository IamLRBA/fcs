'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Palette,
  Gem,
  Sparkles,
  Theater,
  HeartHandshake,
  Fingerprint,
  Globe2,
  Crown,
  type LucideIcon,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import MysticalPiecesWord from '@/components/ui/MysticalPiecesWord'
import ScrollScale from '@/components/motion/ScrollScale'
import { HeroEntrance } from '@/components/motion/HeroEntrance'

type RuleBlock = {
  id: string
  number: string
  title: string
  icon: LucideIcon
  paragraphs: string[]
  bullets?: string[]
}

const rules: RuleBlock[] = [
  {
    id: 'color',
    number: '01',
    title: 'Colour with intention',
    icon: Palette,
    paragraphs: [
      'Bold, yes, but coordinated: about three main colours, contrast on purpose, never messy flash.',
      'Why it matters: restraint lets each hue read as choice, not noise, so the look feels composed from a distance and up close.',
    ],
    bullets: ['If it reads chaotic, lose one hue before you step out.'],
  },
  {
    id: 'elegance',
    number: '02',
    title: 'Elegance beats the price tag',
    icon: Gem,
    paragraphs: [
      'True sape is fit, cleanliness, and carriage. Thrift can outshine labels when the cut and care are right.',
      'Why it matters: La Sapeur was never a receipt contest; it rewards how cloth meets body and how you move in it.',
    ],
  },
  {
    id: 'immaculate',
    number: '03',
    title: 'Immaculate, always',
    icon: Sparkles,
    paragraphs: [
      'Mirror-bright shoes, pressed cloth, zero stains. Care is the first thing you wear.',
      'Why it matters: polish signals respect for yourself and everyone who sees you; slack detail undercuts the whole story.',
    ],
  },
  {
    id: 'performance',
    number: '04',
    title: 'The street as runway',
    icon: Theater,
    paragraphs: [
      'Walk, pause, hat, cane, shades: theatre only when it serves the look, refined so it feels easy.',
      'Why it matters: gesture turns fabric into presence; when timing is right, the sidewalk feels like a catwalk without shouting.',
    ],
  },
  {
    id: 'conduct',
    number: '05',
    title: 'Grace in the world',
    icon: HeartHandshake,
    paragraphs: [
      'Calm, respectful, confident. Elegance wins in cloth, not volume; non-violence stays central.',
      'Why it matters: the culture asks you to carry beauty as peace; swagger should invite, not intimidate.',
    ],
  },
  {
    id: 'identity',
    number: '06',
    title: 'Your signature',
    icon: Fingerprint,
    paragraphs: [
      'Over time you earn a palette, a prop, a silhouette people know. MysticalPIECES cheers that slow, personal stamp.',
      'Why it matters: rules guide you, but your twist is what makes the tradition feel alive and yours.',
    ],
  },
  {
    id: 'europe',
    number: '07',
    title: 'European roots, African imagination',
    icon: Globe2,
    paragraphs: [
      'French and Italian discipline on line and proportion, remixed in our light, rhythm, and joy.',
      'Why it matters: honour the tailoring canon, then bend it where our streets, music, and colour ask for a new verse.',
    ],
  },
]

const bonus = {
  title: 'The quiet flex',
  icon: Crown,
  paragraphs: [
    'Clever brand mix, not logo spam. Socks and shoes on purpose; tiny matches (watch, square) for those who notice.',
    'Why it matters: the flex is for people who read details; it rewards patience over loudness.',
  ],
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 320, damping: 28 },
  },
}

const BonusIcon = bonus.icon

export default function CoreRulesPage() {
  const reduceMotion = useReducedMotion()
  const [showBackButton, setShowBackButton] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setShowBackButton(scrollTop < 100)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const listVariants = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } } }
    : containerVariants

  const itemVariants = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } } }
    : cardVariants

  return (
    <div className="core-rules-page-root min-h-screen bg-unified dark:bg-transparent overflow-x-hidden pt-24 pb-20">
      <motion.div
        animate={{ opacity: showBackButton ? 1 : 0, x: showBackButton ? 0 : -120, y: showBackButton ? 0 : -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-20 left-4 sm:left-8 z-50 pointer-events-none"
        style={{ pointerEvents: showBackButton ? 'auto' : 'none' }}
      >
        <Link
          href="/about-us"
          className="focus-ring-none inline-flex items-center gap-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 transition-colors duration-300"
        >
          <span className="btn-unified-circle flex-shrink-0">⟸</span>
          <span className="text-sm font-medium">Back to About Us</span>
        </Link>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-20">
        <ScrollScale as="section" variant="centerPeak" intensity="subtle" className="mb-12 md:mb-14">
        <HeroEntrance variant="seal">
          <header className="text-center mb-12 md:mb-14">
            <HeroEntrance.Piece role="icon" className="mx-auto mb-6 flex justify-center">
              <Crown className="w-12 h-12 md:w-14 md:h-14 text-primary-700 dark:text-primary-200" strokeWidth={1.5} aria-hidden />
            </HeroEntrance.Piece>
            <HeroEntrance.Piece role="title">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-900 dark:text-primary-100 mb-5 tracking-tight">
                The core rules of <MysticalPiecesWord />
              </h1>
            </HeroEntrance.Piece>
            <HeroEntrance.Piece role="subtitle">
              <div className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed space-y-4 text-left sm:text-center">
                <p>
                  Pull up a chair. Picture a voice: warm, exact, a little playful, walking you through the creed we keep when we dress in the spirit of{' '}
                  <span className="text-primary-800 dark:text-primary-200 font-medium">La Sapeur</span>: colour, poise, presence.
                </p>
                <p>
                  At <MysticalPiecesWord /> we follow, and gently stretch, the traditions of La Sapeur: craft, not costume. These lines are not a cage; they are the rhythm behind what we curate and the mirror moments we hope you borrow. Read them slowly, let them settle, then take your best walk.
                </p>
              </div>
            </HeroEntrance.Piece>
          </header>
        </HeroEntrance>
        </ScrollScale>

        {rules.map((rule) => {
            const Icon = rule.icon
            return (
              <ScrollScale as="section" key={rule.id} variant="centerPeak" intensity="subtle" className="mb-8 md:mb-10">
              <motion.article
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                variants={itemVariants}
                layout={!reduceMotion}
                className="group relative rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-7 md:p-9 shadow-md hover:shadow-xl transition-shadow duration-500"
              >
                <div className="relative flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className="flex sm:flex-col items-center sm:items-start gap-4 shrink-0">
                    <span className="text-xs font-semibold tracking-[0.2em] text-accent-600 dark:text-accent-400 tabular-nums">
                      {rule.number}
                    </span>
                    <Icon
                      className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 text-primary-700 dark:text-primary-200 transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl md:text-2xl font-bold text-primary-900 dark:text-primary-100 mb-3">
                      {rule.title}
                    </h2>
                    <div className="space-y-2 text-neutral-700 dark:text-neutral-200 leading-relaxed">
                      {rule.paragraphs.map((p, i) => (
                        <p
                          key={`${rule.id}-p-${i}`}
                          className={i === 0 ? '' : 'text-sm text-neutral-600 dark:text-neutral-400'}
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                    {rule.bullets && (
                      <ul className="mt-4 space-y-2">
                        {rule.bullets.map((item, i) => (
                          <li key={`${rule.id}-b-${i}`} className="flex gap-3 text-neutral-600 dark:text-neutral-300 text-sm md:text-base">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" aria-hidden />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.article>
              </ScrollScale>
            )
          })}

        <ScrollScale as="section" variant="centerPeak" intensity="subtle" className="mt-10 md:mt-12">
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          variants={itemVariants}
          className="mt-10 md:mt-12 relative overflow-hidden rounded-2xl border-2 border-dashed border-accent-500/40 dark:border-neutral-600 shadow-md backdrop-blur-sm bg-primary-100/35 dark:bg-neutral-950/45 p-7 md:p-9"
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/50 via-accent-100/25 to-primary-100/20 dark:from-neutral-800/30 dark:via-neutral-900/20 dark:to-transparent"
            aria-hidden
          />
          <div className="relative z-[1] flex flex-col sm:flex-row sm:items-start gap-5">
            <BonusIcon
              className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 shrink-0 text-accent-700 dark:text-accent-300"
              strokeWidth={1.5}
              aria-hidden
            />
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-accent-700 dark:text-accent-300 uppercase mb-2">Bonus</p>
              <h2 className="text-xl md:text-2xl font-bold text-primary-900 dark:text-primary-100 mb-3">{bonus.title}</h2>
              <div className="space-y-2 text-neutral-700 dark:text-neutral-200 leading-relaxed">
                {bonus.paragraphs.map((p, i) => (
                  <p
                    key={`bonus-p-${i}`}
                    className={i === 0 ? '' : 'text-sm text-neutral-600 dark:text-neutral-400'}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
        </ScrollScale>

        <ScrollScale as="section" variant="centerPeak" intensity="subtle" className="mt-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center mt-12"
        >
          <div className="hero-cta-buttons flex justify-center">
            <Button href="/" variant="filled" className="inline-flex items-center justify-center px-8">
              Return home
            </Button>
          </div>
        </motion.div>
        </ScrollScale>
      </div>
    </div>
  )
}
