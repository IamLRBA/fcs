'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Pause, Play } from 'lucide-react'
import Button from '@/components/ui/Button'
import SafeImage from '@/components/common/SafeImage'
import SegmentedPillNav from '@/components/ui/SegmentedPillNav'
import { HiMiniShoppingBag, HiOutlineShoppingBag } from 'react-icons/hi2'

const FashionVideoSection = dynamic(
  () => import('@/components/sections/FashionVideoSection'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[280px] rounded-2xl bg-primary-900/10 dark:bg-primary-950/30 animate-pulse" aria-hidden />
    ),
  }
)

const FashionProducts = dynamic(() => import('@/components/sections/FashionProducts'), {
  loading: () => (
    <div className="w-full min-h-[200px] rounded-2xl bg-primary-900/10 dark:bg-primary-950/30 animate-pulse" aria-hidden />
  ),
})

const moodboardData = {
  inspiration: [
    { icon: '🎨', name: 'Art', image: '/assets/images/fashion/inspiration/art.jpg' },
    { icon: '✨', name: 'Sparkle', image: '/assets/images/fashion/inspiration/sparkle.jpg' },
    { icon: '🌟', name: 'Star', image: '/assets/images/fashion/inspiration/star.jpg' },
    { icon: '💫', name: 'Dizzy', image: '/assets/images/fashion/inspiration/dizzy.jpg' },
    { icon: '🔮', name: 'Crystal Ball', image: '/assets/images/fashion/inspiration/crystal-ball.jpg' },
    { icon: '🌈', name: 'Rainbow', image: '/assets/images/fashion/inspiration/rainbow.jpg' },
    { icon: '🎭', name: 'Theater', image: '/assets/images/fashion/inspiration/theatre.jpg' },
    { icon: '🎪', name: 'Circus', image: '/assets/images/fashion/inspiration/circus.jpg' },
  ],
  elegance: [
    { icon: '👑', name: 'Crown', image: '/assets/images/fashion/elegance/crown.jpg' },
    { icon: '💎', name: 'Gem', image: '/assets/images/fashion/elegance/gem.jpg' },
    { icon: '🕊️', name: 'Dove', image: '/assets/images/fashion/elegance/dove.jpg' },
    { icon: '🌹', name: 'Rose', image: '/assets/images/fashion/elegance/rose.jpg' },
    { icon: '🦢', name: 'Swan', image: '/assets/images/fashion/elegance/swan.jpg' },
    { icon: '💍', name: 'Ring', image: '/assets/images/fashion/elegance/ring.jpg' },
    { icon: '👗', name: 'Dress', image: '/assets/images/fashion/elegance/dress.jpg' },
    { icon: '👠', name: 'High Heel', image: '/assets/images/fashion/elegance/high-heel.jpg' },
  ],
  urban: [
    { icon: '🏙️', name: 'City', image: '/assets/images/fashion/urban/city.jpg' },
    { icon: '🚗', name: 'Car', image: '/assets/images/fashion/urban/car.jpg' },
    { icon: '🎵', name: 'Music', image: '/assets/images/fashion/urban/music.jpg' },
    { icon: '🎧', name: 'Headphones', image: '/assets/images/fashion/urban/headphones.jpg' },
    { icon: '🛹', name: 'Skateboard', image: '/assets/images/fashion/urban/skateboard.jpg' },
    { icon: '🎨', name: 'Art', image: '/assets/images/fashion/urban/art.jpg' },
    { icon: '💡', name: 'Light Bulb', image: '/assets/images/fashion/urban/light-bulb.jpg' },
    { icon: '⚡', name: 'Lightning', image: '/assets/images/fashion/urban/lightning.jpg' },
  ],
  nature: [
    { icon: '🌿', name: 'Herb', image: '/assets/images/fashion/nature/herb.jpg' },
    { icon: '🌸', name: 'Cherry Blossom', image: '/assets/images/fashion/nature/cherry-blossom.jpg' },
    { icon: '🌺', name: 'Hibiscus', image: '/assets/images/fashion/nature/hibiscus.jpg' },
    { icon: '🍃', name: 'Leaf', image: '/assets/images/fashion/nature/leaf.jpg' },
    { icon: '🌊', name: 'Wave', image: '/assets/images/fashion/nature/wave.jpg' },
    { icon: '🌅', name: 'Sunrise', image: '/assets/images/fashion/nature/sunrise.jpg' },
    { icon: '🌙', name: 'Moon', image: '/assets/images/fashion/nature/moon.jpg' },
    { icon: '⭐', name: 'Star', image: '/assets/images/fashion/nature/star.jpg' },
  ],
}

const moodNavItems = Object.keys(moodboardData).map((mood) => ({
  id: mood,
  label: mood.charAt(0).toUpperCase() + mood.slice(1),
}))

const SHOP_PROCEDURES = [
  {
    num: '01',
    src: '/assets/images/sections/fashion/shop-1.jpg',
    alt: 'Procedure step 1: open a product from its image',
    title: 'Click product image to visit product page',
    frameInner:
      'bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 rounded-xl sm:rounded-2xl border border-primary-500/30 dark:border-primary-500/40',
  },
  {
    num: '02',
    src: '/assets/images/sections/fashion/shop-2.jpg',
    alt: 'Procedure step 2: jump to a category',
    title: 'Click/Select product category to visit directly',
    frameInner:
      'bg-gradient-to-br from-primary-600/30 to-primary-400/30 dark:from-primary-800/40 dark:to-primary-600/40 rounded-xl sm:rounded-2xl border border-primary-400/30 dark:border-primary-500/40',
  },
  {
    num: '03',
    src: '/assets/images/sections/fashion/shop-3.jpg',
    alt: 'Procedure step 3: add items to cart',
    title: 'Visit and add selected products to cart',
    frameInner:
      'bg-gradient-to-br from-primary-400/30 to-primary-200/30 dark:from-primary-800/40 dark:to-primary-600/40 rounded-xl sm:rounded-2xl border border-primary-200/30 dark:border-primary-500/40',
  },
] as const

export default function ShopPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Lookbook Carousel state
  const [currentLookIndex, setCurrentLookIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  
  // Style Categories state
  const [expandedStyle, setExpandedStyle] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Moodboard state
  const [selectedMood, setSelectedMood] = useState('inspiration')
  const [moodboardImages, setMoodboardImages] = useState<Array<{icon: string, name: string, image: string}>>([])
  const [displayedImages, setDisplayedImages] = useState<Array<{icon: string, name: string, image: string}>>([])
  const [pendingMoodChange, setPendingMoodChange] = useState<Array<{icon: string, name: string, image: string}> | null>(null)
  const [imageUpdateQueue, setImageUpdateQueue] = useState<number[]>([])
  const [isUpdatingImages, setIsUpdatingImages] = useState(false)
  const [showBackButton, setShowBackButton] = useState(true)
  /** Shopping procedure: which step is expanded (detail visible); null = compact overview */
  const [activeProcedure, setActiveProcedure] = useState<number | null>(null)
  const procedureInteractRef = useRef<HTMLDivElement>(null)

  const toggleProcedure = (index: number) => {
    setActiveProcedure((prev) => (prev === index ? null : index))
  }

  useEffect(() => {
    if (activeProcedure === null) return
    const closeIfOutside = (e: MouseEvent | TouchEvent) => {
      const el = procedureInteractRef.current
      if (el && !el.contains(e.target as Node)) {
        setActiveProcedure(null)
      }
    }
    document.addEventListener('mousedown', closeIfOutside)
    document.addEventListener('touchstart', closeIfOutside, { passive: true })
    return () => {
      document.removeEventListener('mousedown', closeIfOutside)
      document.removeEventListener('touchstart', closeIfOutside)
    }
  }, [activeProcedure])

  const looks = [
    {
      title: 'Casual Elegance',
      description: 'Perfect blend of comfort and style',
      materials: ['Denim', 'Cotton', 'Linen'],
      icon: 'shirt'
    },
    {
      title: 'Business Professional',
      description: 'Sharp and sophisticated office attire',
      materials: ['Wool', 'Silk', 'Cotton'],
      icon: 'briefcase'
    },
    {
      title: 'Urban Street',
      description: 'Edgy and contemporary street style',
      materials: ['Leather', 'Denim', 'Mesh'],
      icon: 'headphones'
    },
    {
      title: 'Retro Classic',
      description: 'Timeless vintage-inspired looks',
      materials: ['Tweed', 'Velvet', 'Lace'],
      icon: 'eye'
    }
  ]
  
  // Style categories with expanded data
  const styleCategories = [
    { 
      name: 'Classy', 
      icon: 'briefcase', 
      description: 'Elegant and sophisticated',
      coverImage: '👔',
      images: ['👔', '👗', '👠', '💼', '🎩', '🧥', '👛', '👜'],
      styles: ['Business Formal', 'Evening Wear', 'Cocktail Attire', 'Professional Look', 'Luxury Casual', 'Executive Style', 'Boardroom Ready', 'Gala Glamour']
    },
    { 
      name: 'Retro', 
      icon: 'eye', 
      description: 'Vintage and timeless',
      coverImage: '🕶️',
      images: ['🕶️', '👗', '👒', '🧥', '👠', '👔', '👜', '💍'],
      styles: ['1950s Classic', '1960s Mod', '1970s Bohemian', '1980s Power', '1990s Minimalist', 'Art Deco', 'Victorian Elegance', 'Roaring Twenties']
    },
    { 
      name: 'Modern', 
      icon: 'zap', 
      description: 'Contemporary and trendy',
      coverImage: '🚀',
      images: ['🚀', '👕', '👖', '👟', '👜', '🧢', '👓', '⌚'],
      styles: ['Modern Minimalist', 'Tech Wear', 'Athleisure', 'Street Fashion', 'Sustainable Style', 'Smart Casual', 'Urban Professional', 'Digital Nomad']
    },
    { 
      name: 'Streetwear', 
      icon: 'headphones', 
      description: 'Urban and casual',
      coverImage: '🎧',
      images: ['🎧', '👕', '👖', '👟', '🧢', '👜', '⌚', '💎'],
      styles: ['Urban Casual', 'Skate Style', 'Hip Hop Fashion', 'Street Luxe', 'Tech Street', 'Graffiti Inspired', 'Underground', 'City Vibes']
    }
  ]

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentLookIndex((prev) => (prev + 1) % 4)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  // Functions for style categories
  const toggleStyleExpansion = (styleName: string) => {
    if (expandedStyle === styleName) {
      setExpandedStyle(null)
      setCurrentImageIndex(0)
    } else {
      setExpandedStyle(styleName)
      setCurrentImageIndex(0)
    }
  }

  const nextImage = () => {
    const currentStyle = styleCategories.find(style => style.name === expandedStyle)
    if (currentStyle) {
      setCurrentImageIndex((prev) => (prev + 1) % currentStyle.images.length)
    }
  }

  const prevImage = () => {
    const currentStyle = styleCategories.find(style => style.name === expandedStyle)
    if (currentStyle) {
      setCurrentImageIndex((prev) => (prev - 1 + currentStyle.images.length) % currentStyle.images.length)
    }
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  const changeMood = (mood: string) => {
    if (mood === selectedMood || isUpdatingImages) return // Prevent multiple clicks during update
    
    const newImages = moodboardData[mood as keyof typeof moodboardData]
    setSelectedMood(mood)
    setMoodboardImages(newImages)
    
    // Generate random order for image updates
    const indices = Array.from({ length: newImages.length }, (_, i) => i)
    // Fisher-Yates shuffle for random order
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]]
    }
    
    setPendingMoodChange(newImages)
    setImageUpdateQueue(indices)
    setIsUpdatingImages(true)
  }

  // Handle staggered image updates
  useEffect(() => {
    if (!isUpdatingImages || imageUpdateQueue.length === 0 || !pendingMoodChange) {
      // Clean up when done
      if (isUpdatingImages && imageUpdateQueue.length === 0 && pendingMoodChange) {
        setIsUpdatingImages(false)
        setPendingMoodChange(null)
      }
      return
    }

    const indexToUpdate = imageUpdateQueue[0]
    const remainingQueue = imageUpdateQueue.slice(1)
    
    // Random delay between 100ms and 300ms for each image update
    const delay = Math.random() * 200 + 100
    const timeoutId = setTimeout(() => {
      setDisplayedImages((prev) => {
        const updated = [...prev]
        updated[indexToUpdate] = pendingMoodChange[indexToUpdate]
        return updated
      })
      
      setImageUpdateQueue(remainingQueue)
      
      // If this was the last image, clean up
      if (remainingQueue.length === 0) {
        setIsUpdatingImages(false)
        setPendingMoodChange(null)
      }
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [imageUpdateQueue, isUpdatingImages, pendingMoodChange])

  useEffect(() => {
    const initialImages = moodboardData.inspiration
    setMoodboardImages(initialImages)
    setDisplayedImages(initialImages)
  }, [])

  // Show/hide back button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      // Show button when at top (within 100px), hide when scrolled down
      setShowBackButton(scrollTop < 100)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-unified relative overflow-x-clip">
      {/* Navigation Back */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: showBackButton ? 1 : 0, x: showBackButton ? 0 : -120 }}
        transition={{ duration: 0.3 }}
        className="fixed top-20 left-4 sm:left-8 z-50 pointer-events-none"
        style={{ pointerEvents: showBackButton ? 'auto' : 'none' }}
      >
        <Link href="/" className="focus-ring-none inline-flex items-center gap-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 transition-colors duration-300">
          <span className="btn-unified-circle flex-shrink-0">⟸</span>
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </motion.div>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-visible pt-20">
        <motion.div
          style={{ y, opacity }}
          className="z-20 overflow-visible px-4 text-center lg:px-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-8xl sm:text-6xl md:text-8xl font-bold mb-8 overflow-visible pb-2 sm:pb-3 lg:pb-4"
          >
            {/* flex-1 spacers: equal space from screen edges to the icon/wordmark group; icon + ᔕᕼOᑭ sizes unchanged on large screens */}
            <span className="flex w-full max-w-full items-center">
              <span className="min-w-0 flex-1 shrink" aria-hidden />
              <span className="inline-flex max-w-full shrink-0 -translate-x-2 flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:-translate-x-8 lg:gap-20 xl:-translate-x-10 xl:gap-28">
                <HiOutlineShoppingBag
                  className="h-64 w-64 shrink-0 text-neutral-700 drop-shadow-lg dark:text-primary-200 sm:h-64 sm:w-64 md:h-80 md:w-80"
                  aria-hidden="true"
                />
                <span className="text-gradient shrink-0 lg:origin-center lg:scale-[2] lg:leading-none">ᔕᕼOᑭ</span>
              </span>
              <span className="min-w-0 flex-1 shrink" aria-hidden />
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-base sm:text-xl md:text-3xl text-neutral-800 dark:text-primary-200 mb-8 max-w-4xl mx-auto leading-relaxed px-4 mt-2 sm:mt-3"
          >
            "Build a wardrobe that Is authentically yours"
          </motion.p>
        </motion.div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-20 w-32 h-32 border border-primary-500/20 rounded-full animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-accent-500/20 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-10 w-16 h-16 border border-primary-400/30 rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
      </section>

      {/* Shop Philosophy Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-[2.35rem] font-bold sm:text-[2.6rem] md:text-[2.95rem] mb-10 text-center sm:mb-12 md:mb-14">
            <span className="text-primary-500 dark:text-primary-100">ᔕᕼOᑭᑭIᑎG</span>{' '}
            <span className="text-neutral-700 dark:text-primary-300">Procedure</span>
          </h2>
          <div ref={procedureInteractRef} className="mx-auto max-w-6xl">
            <p className="mx-auto mb-10 max-w-3xl px-2 text-center text-base md:text-lg font-medium text-primary-600 dark:text-primary-200 leading-relaxed">
              Click on an image to discover each step.
            </p>

            <div className="px-1 sm:px-2">
            <div className="grid min-h-0 grid-cols-3 max-lg:justify-items-center gap-3 sm:gap-5 md:gap-10 lg:gap-14 xl:gap-16">
              {SHOP_PROCEDURES.map((proc, index) => {
                const isActive = activeProcedure === index
                const isDimmed = activeProcedure !== null && !isActive
                const colClass =
                  index === 0
                    ? 'items-start text-left'
                    : index === 1
                      ? 'items-end text-right'
                      : 'items-center text-center'
                const frameAlign =
                  index === 0
                    ? 'self-start'
                    : index === 1
                      ? 'self-end'
                      : 'self-center'

                const numClass = isActive
                  ? 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl'
                  : isDimmed
                    ? 'text-lg opacity-70 sm:text-xl md:text-2xl lg:text-3xl'
                    : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl'

                const padInner = isActive
                  ? 'p-1 sm:p-1.25 md:p-1.5 lg:p-2'
                  : isDimmed
                    ? 'p-0.75 sm:p-1 md:p-1.25 lg:p-1.5'
                    : 'p-1 sm:p-1.25 md:p-1.5 lg:p-2'

                /* Square frames — wider on small screens so images read clearly; lg+ keeps left/center/right alignment */
                const frameClass = isActive
                  ? 'aspect-square w-[min(31vw,7.85rem)] sm:w-[6.85rem] md:w-[8.15rem] lg:w-[9.6rem] xl:w-[10.9rem]'
                  : isDimmed
                    ? 'aspect-square w-[min(25vw,6.1rem)] sm:w-[4.85rem] md:w-[5.85rem] lg:w-[5.95rem] xl:w-[6.65rem]'
                    : 'aspect-square w-[min(29vw,7.2rem)] sm:w-[6.25rem] md:w-[7.2rem] lg:w-[7.9rem] xl:w-[8.9rem]'

                return (
                  <motion.div
                    key={proc.num}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.06 }}
                    viewport={{ once: true }}
                    className={`flex min-w-0 w-full max-w-full flex-col lg:max-w-none ${colClass}`}
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      animate={{
                        scale: isActive ? 1.05 : isDimmed ? 0.9 : 1,
                      }}
                      className={`flex w-full max-w-full flex-col lg:max-w-none ${colClass}`}
                    >
                      <span
                        id={`procedure-num-${index}`}
                        className={`font-bold text-primary-500 dark:text-primary-400 ${numClass} select-none ${index === 1 ? 'ml-auto' : ''} ${index === 2 ? 'mx-auto' : ''}`}
                      >
                        {proc.num}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleProcedure(index)}
                        className={`hero-glass-frame relative mt-1.5 shrink-0 overflow-hidden rounded-xl backdrop-blur-md sm:mt-2 ${frameClass} ${frameAlign} cursor-pointer shadow-md transition-shadow hover:shadow-md focus-ring-none focus:outline-none sm:shadow-lg`}
                        aria-expanded={isActive}
                        aria-controls={`procedure-detail-${index}`}
                        aria-label={`Step ${proc.num}: tap to show or hide instructions`}
                      >
                        <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0 z-[1]" aria-hidden />
                        <div
                          className={`relative z-[2] flex size-full items-center justify-center overflow-hidden ${proc.frameInner} ${padInner}`}
                        >
                          <SafeImage
                            src={proc.src}
                            alt={proc.alt}
                            width={160}
                            height={160}
                            className="size-full min-h-0 min-w-0 rounded-md object-cover sm:rounded-lg"
                            sizes="(max-width:640px) 120px, (max-width:768px) 128px, (max-width:1024px) 160px, 192px"
                            loading="lazy"
                          />
                        </div>
                      </button>
                    </motion.div>

                    <div className={`mt-2 min-h-0 w-full sm:mt-3 ${index === 1 ? 'mx-auto max-w-[95%]' : index === 2 ? 'ml-auto max-w-[95%]' : 'max-w-[95%]'}`}>
                      <AnimatePresence initial={false}>
                        {isActive ? (
                          <motion.h3
                            id={`procedure-detail-${index}`}
                            role="region"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                            className={`text-[0.65rem] font-semibold leading-snug text-neutral-850 dark:text-primary-50 sm:text-xs md:text-sm lg:text-base ${index === 1 ? 'text-center' : ''}`}
                          >
                            {proc.title}
                          </motion.h3>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ⏣ Our Catalogue */}
      <FashionProducts />

      {/* Moodboard Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-16">
            <span className="text-primary-500 dark:text-primary-100">ᗰOOᗪᗷOᗩᖇᗪ</span>{' '}
            <span className="text-neutral-700 dark:text-primary-300">Inspiration</span>
          </h2>
          
          <div className="hero-glass-frame relative backdrop-blur-lg">
            <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
          <div className="glass-effect p-8 rounded-2xl">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-3xl font-bold mb-4 text-neutral-850 dark:text-primary-50">
                Visual Inspiration
              </h3>
              <p className="text-neutral-700 dark:text-primary-300 mb-6 sm:mb-8">
                Curated collections that capture different moods and aesthetics
              </p>
              {/* Desktop: single row. Mobile: split into two rows (2 + 2) to avoid overflow. */}
              <div className="w-full max-w-2xl mx-auto px-1 pb-1">
                <div className="hidden sm:block">
                  <SegmentedPillNav
                    items={moodNavItems}
                    value={selectedMood}
                    onSelect={changeMood}
                    disabled={isUpdatingImages}
                    className="!max-w-none"
                  />
                </div>
                <div className="sm:hidden space-y-2">
                  <SegmentedPillNav
                    items={moodNavItems.slice(0, 2)}
                    value={['inspiration', 'elegance'].includes(selectedMood) ? selectedMood : null}
                    onSelect={changeMood}
                    disabled={isUpdatingImages}
                    hideIndicatorUntilSelected
                    className="!max-w-none"
                  />
                  <SegmentedPillNav
                    items={moodNavItems.slice(2, 4)}
                    value={['urban', 'nature'].includes(selectedMood) ? selectedMood : null}
                    onSelect={changeMood}
                    disabled={isUpdatingImages}
                    hideIndicatorUntilSelected
                    className="!max-w-none"
                  />
                </div>
              </div>
            </div>
            
            {/* Interactive Moodboard */}
            <div className="space-y-6">
              {/* Moodboard Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-4 px-4 md:px-0">
                {displayedImages.map((item, index) => (
                  <motion.div
                    key={`${selectedMood}-${index}-${item.image}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="aspect-square bg-gradient-to-br from-primary-700/30 to-accent-700/30 rounded-xl border border-primary-500/30 flex items-center justify-center cursor-pointer group hover:shadow-xl transition-all duration-300 overflow-hidden relative"
                  >
                    <AnimatePresence mode="sync">
                      <motion.img
                        key={`${selectedMood}-${index}-${item.image}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover rounded-lg group-hover:scale-125 transition-transform duration-300 absolute inset-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    </AnimatePresence>
                    {/* Fallback Placeholder */}
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{display: 'none'}}
                    >
                      <span className="text-4xl group-hover:scale-125 transition-transform duration-300">
                        {item.icon}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Mood Description */}
              <div className="text-center">
                <p className="text-neutral-700 dark:text-primary-300 text-sm">
                  {selectedMood === 'inspiration' && 'Different material surface textures'}
                  {selectedMood === 'elegance' && 'Sophisticated luxury and refined beauty'}
                  {selectedMood === 'urban' && 'City vibes and contemporary culture'}
                  {selectedMood === 'nature' && 'Organic elements and natural harmony'}
                </p>
              </div>
            </div>
          </div>
          </div>
        </motion.div>
      </section>

      {/* Shop Video Gallery Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-16">
            <span className="text-primary-500 dark:text-primary-100">ᔕᕼOᑭ</span>{' '}
            <span className="text-neutral-700 dark:text-primary-300">Video Gallery</span>{' '}
          </h2>
          <FashionVideoSection />
        </motion.div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            <span className="text-neutral-700 dark:text-primary-300">Ready to</span>{' '}
            <span className="text-primary-500 dark:text-primary-100">ᔕᕼOᑭ</span>{' '}
            <span className="text-neutral-700 dark:text-primary-300">Your Style?</span>
          </h2>
          <p className="text-xl text-neutral-700 dark:text-primary-300 mb-8">
            Explore our collection of thrifted treasures and for any questions, contact us!
          </p>
          <div className="hero-cta-buttons flex justify-center">
            <Button
              href="/#contact-section"
              variant="default"
              size="md"
              className="inline-flex items-center justify-center"
            >
              Contact Us
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}