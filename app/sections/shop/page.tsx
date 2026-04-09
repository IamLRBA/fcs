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
    <div ref={containerRef} className="min-h-screen bg-unified relative overflow-hidden">
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
      <section className="min-h-screen flex items-center justify-center relative pt-20">
        <motion.div
          style={{ y, opacity }}
          className="text-center z-20 px-4"
        >
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-8xl sm:text-6xl md:text-8xl font-bold mb-6"
          >
            <span className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6">
              <HiOutlineShoppingBag className="w-64 h-64 sm:w-64 sm:h-64 md:w-80 md:h-80 text-neutral-700 dark:text-primary-200 drop-shadow-lg" aria-hidden="true" />
              <span className="text-gradient">ᔕᕼOᑭ</span>
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-base sm:text-xl md:text-3xl text-neutral-800 dark:text-primary-200 mb-8 max-w-4xl mx-auto leading-relaxed px-4"
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
          <h2 className="text-5xl md:text-6xl font-bold mb-16 text-center">
            <span className="text-primary-500 dark:text-primary-100">ᔕᕼOᑭᑭIᑎG</span>{' '}
            <span className="text-neutral-700 dark:text-primary-300">Procedure</span>
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg text-neutral-700 dark:text-primary-300">
            Get familiar with our process, then proceed to check out products.
          </p>
          
          <div className="space-y-16 flex flex-col items-center">
            {/* Philosophy Item 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex w-full max-w-3xl flex-col items-center gap-8 md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:items-center md:gap-x-12 md:gap-y-0"
            >
              <div className="flex flex-col items-center md:justify-self-center">
                <div className="text-6xl font-bold text-primary-500 dark:text-primary-600 mb-4 md:hidden">01</div>
                <div className="hero-glass-frame relative flex-shrink-0 backdrop-blur-md">
                  <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
                <div className="bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 rounded-2xl border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl p-8">
                  <SafeImage
                    src="/assets/images/sections/fashion/shop-1.jpg"
                    alt="Click product image to visit product page"
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover rounded-xl"
                    sizes="96px"
                    loading="lazy"
                  />
                </div>
                </div>
              </div>
              <div className="flex flex-col text-center md:text-left">
                <div className="text-6xl font-bold text-primary-500 dark:text-primary-600 mb-4 hidden md:block">01</div>
                <h3 className="text-base md:text-lg font-semibold leading-snug max-w-sm mb-2 text-neutral-850 dark:text-primary-50">Click product image to visit product page</h3>
              </div>
            </motion.div>
            
            {/* Philosophy Item 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex w-full max-w-3xl flex-col items-center gap-8 md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:items-center md:gap-x-12 md:gap-y-0"
            >
              <div className="flex flex-col items-center md:justify-self-center">
                <div className="text-6xl font-bold text-primary-500 dark:text-primary-600 mb-4 md:hidden">02</div>
                <div className="hero-glass-frame relative flex-shrink-0 backdrop-blur-md">
                  <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
                <div className="bg-gradient-to-br from-primary-600/30 to-primary-400/30 dark:from-primary-800/40 dark:to-primary-600/40 rounded-2xl border border-primary-400/30 dark:border-primary-500/40 overflow-hidden shadow-2xl p-8">
                  <SafeImage
                    src="/assets/images/sections/fashion/shop-2.jpg"
                    alt="Click/Select product category to visit directly"
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover rounded-xl"
                    sizes="96px"
                    loading="lazy"
                  />
                </div>
                </div>
              </div>
              <div className="flex flex-col text-center md:text-left">
                <div className="text-6xl font-bold text-primary-500 dark:text-primary-600 mb-4 hidden md:block">02</div>
                <h3 className="text-base md:text-lg font-semibold leading-snug max-w-sm mb-2 text-neutral-850 dark:text-primary-50">Click/Select product category to visit directly</h3>
              </div>
            </motion.div>
            
            {/* Philosophy Item 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex w-full max-w-3xl flex-col items-center gap-8 md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:items-center md:gap-x-12 md:gap-y-0"
            >
              <div className="flex flex-col items-center md:justify-self-center">
                <div className="text-6xl font-bold text-primary-500 dark:text-primary-600 mb-4 md:hidden">03</div>
                <div className="hero-glass-frame relative flex-shrink-0 backdrop-blur-md">
                  <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
                <div className="bg-gradient-to-br from-primary-400/30 to-primary-200/30 dark:from-primary-800/40 dark:to-primary-600/40 rounded-2xl border border-primary-200/30 dark:border-primary-500/40 overflow-hidden shadow-2xl p-8">
                  <SafeImage
                    src="/assets/images/sections/fashion/shop-3.jpg"
                    alt="Visit and add selected products to cart"
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover rounded-xl"
                    sizes="96px"
                    loading="lazy"
                  />
                </div>
                </div>
              </div>
              <div className="flex flex-col text-center md:text-left">
                <div className="text-6xl font-bold text-primary-500 dark:text-primary-600 mb-4 hidden md:block">03</div>
                <h3 className="text-base md:text-lg font-semibold leading-snug max-w-sm mb-2 text-neutral-850 dark:text-primary-50">Visit and add selected products to cart</h3>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ⏣ Our PRODUCTS */}
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