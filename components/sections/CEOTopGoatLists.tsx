'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import ScrollScale from '@/components/motion/ScrollScale'

const GOAT_LISTS: { title: string; image: string; items: string[] }[] = [
  {
    title: 'Marvel Characters Line-Up',
    image: '/assets/images/sections/ceo/goat-lists/marvel-characters.jpg',
    items: ['Iron Man', 'Thor', 'Spiderman', 'Black Panther', 'Hulk', 'Wolverine'],
  },
  {
    title: 'Marvel Powershouse Line-Up',
    image: '/assets/images/sections/ceo/goat-lists/marvel-powerhouse.jpg',
    items: ['Doctor Strange (Living Universe)', 'Scarlet Witch', 'Loki (god of stories)'],
  },
  {
    title: 'Ben 10 Aliens Line-Up',
    image: '/assets/images/sections/ceo/goat-lists/ben10-aliens.jpg',
    items: [
      'Ultimate Echo Echo',
      'FeedBack',
      'SwampFire',
      'BigChill',
      'CannonBolt',
      'SpiderMonkey',
      'XLR8',
      'Armordrillo',
      'Crashhopper',
      'NRG',
      "Kickin' Hawk",
      'GutRot',
    ],
  },
  {
    title: 'Ben 10 Powerhouse Aliens',
    image: '/assets/images/sections/ceo/goat-lists/ben10-powerhouse.jpg',
    items: ['Alien x', 'Atomix', 'ClockWork', 'Gravattack'],
  },
  {
    title: 'Transformers Line-Up',
    image: '/assets/images/sections/ceo/goat-lists/transformers.jpg',
    items: ['BumbleBee', 'Mirage', 'IronHide', 'CrossHairs', 'HotRod', 'SideSwipe'],
  },
  {
    title: 'Anime Shows',
    image: '/assets/images/sections/ceo/goat-lists/anime.jpg',
    items: [
      'Jujutsu Kaisen',
      'Demon Slayer',
      'Attack on Titans',
      'Blue Lock',
      'Solo Levelling',
      'Gachiakuta',
      'Chainsawman',
      'Kengan Ashura',
    ],
  },
  {
    title: 'TV Shows',
    image: '/assets/images/sections/ceo/goat-lists/tv-shows.jpg',
    items: [
      'Game of Thrones',
      'Prison Break',
      'Breaking Bad',
      'The Walking Dead (Upto Season 8)',
      'The Sopranos',
      'Peeky Blinders',
      'BlackList',
      'Power (Original)',
      'Mr Robot',
    ],
  },
  {
    title: 'Essentials',
    image: '/assets/images/sections/ceo/goat-lists/essentials.jpg',
    items: ['Foods', 'Electronics', 'Toiletries', 'Outfits', 'Backpack'],
  },
  {
    title: 'Sneakers',
    image: '/assets/images/sections/ceo/goat-lists/sneakers.jpg',
    items: [
      'J1s "Chicago OG"',
      'AF1s "Allwhite"',
      'Adidas Yeezy Boost 700 "Waverunner"',
      'J6 "Cactus Jack, Paisely Print"',
      'Timberlands',
      'Converse x Chuck Taylor',
    ],
  },
  {
    title: 'Rappers',
    image: '/assets/images/sections/ceo/goat-lists/rappers.jpg',
    items: ['J.Cole', 'Eminem', 'Kendrick Lamar', 'Ye'],
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.06 },
  },
}

const chip = {
  hidden: { opacity: 0, y: 8, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1 },
}

export default function CEOTopGoatLists() {
  const [openId, setOpenId] = useState<number | null>(null)

  useEffect(() => {
    if (openId === null) return

    const closeOnOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return
      const clickedInsideCard = Boolean(target.closest('[data-goat-card="true"]'))
      if (!clickedInsideCard) {
        setOpenId(null)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('touchstart', closeOnOutsideClick, { passive: true })

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('touchstart', closeOnOutsideClick)
    }
  }, [openId])

  return (
    <ScrollScale as="section" variant="centerPeak" intensity="normal" className="py-16 md:py-24 px-4 relative">
      <div className="max-w-4xl lg:max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75 }}
          className="text-center mb-14 md:mb-20"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-500/25 dark:border-primary-400/30 bg-primary-800/10 dark:bg-neutral-900/40 px-4 py-1.5 mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary-700 dark:text-primary-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent-600 dark:text-accent-400" aria-hidden />
            Hall of favourites
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-bold text-center">
            <span className="text-primary-800 dark:text-primary-200">TOP</span>{' '}
            <span className="text-accent-600 dark:text-accent-400">G.O.A.T ᒪISTᔕ</span>
          </h2>
          <p className="mt-4 text-primary-600 dark:text-primary-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Curated line-ups: tap a card to explore what he likes.
          </p>
        </motion.div>

        <ul className="grid list-none grid-cols-1 gap-4 p-0 m-0 md:gap-5 lg:grid-cols-2 lg:items-start lg:gap-6 lg:justify-items-stretch">
          {GOAT_LISTS.map((list, index) => {
            const isOpen = openId === index
            return (
              <motion.li
                key={list.title}
                data-goat-card="true"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className={`relative min-w-0 ${
                  index === GOAT_LISTS.length - 1 && GOAT_LISTS.length % 2 === 1
                    ? 'lg:col-span-2 lg:max-w-xl lg:justify-self-center'
                    : ''
                }`}
              >
                <div className="hero-glass-frame relative rounded-2xl backdrop-blur-lg">
                  <div
                    className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]"
                    aria-hidden
                  />
                  <button
                    type="button"
                    onClick={() => setOpenId((prev) => (prev === index ? null : index))}
                    className="focus-ring-none glass-inner-panel relative z-10 flex w-full items-center gap-3 rounded-2xl border border-primary-500/20 px-4 py-4 text-left transition-shadow duration-300 hover:border-primary-500/35 hover:shadow-lg dark:border-primary-500/35 dark:hover:border-primary-400/40 md:gap-4 md:px-6 md:py-5"
                    aria-expanded={isOpen}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-500/15 text-sm font-bold text-accent-700 tabular-nums dark:bg-accent-400/20 dark:text-accent-300"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1 pr-1">
                      <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-widest text-primary-500 dark:text-primary-400">
                        GOAT
                      </span>
                      <span className="block max-w-full break-words text-lg font-bold text-primary-800 dark:text-primary-100 md:text-xl">
                        {list.title}
                      </span>
                      <span className="mt-1 block text-xs text-primary-600 dark:text-primary-400">
                        {list.items.length} picks
                      </span>
                    </div>
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-primary-500/25 bg-primary-900/20 shadow-sm md:h-14 md:w-14">
                      <img
                        src={list.image}
                        alt={`${list.title} visual`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/assets/images/placeholder.jpg'
                        }}
                      />
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="btn-unified-circle btn-unified-circle-sm inline-flex shrink-0 self-center items-center justify-center text-primary-600 dark:text-primary-400"
                      aria-hidden
                    >
                      ⇓
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10 overflow-hidden rounded-b-2xl"
                      >
                        <div className="border-t border-primary-500/15 px-5 pb-5 pt-4 dark:border-primary-500/25 md:px-6 md:pb-6">
                          <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="flex flex-wrap justify-center gap-2 md:gap-2.5"
                          >
                            {list.items.map((item) => (
                              <motion.span
                                key={item}
                                variants={chip}
                                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                                className="inline-block rounded-full border border-primary-400/25 bg-primary-100/60 px-3 py-1.5 text-center text-xs font-medium text-primary-800 shadow-sm dark:border-primary-500/35 dark:bg-neutral-800/70 dark:text-primary-100 md:text-sm"
                              >
                                {item}
                              </motion.span>
                            ))}
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </ScrollScale>
  )
}
