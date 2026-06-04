'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, useTransform } from 'framer-motion'
import { useScrollScale } from '@/hooks/useScrollScale'
import { 
  Users, 
  Award, 
  Clock, 
  Star,
  Heart,
  Globe,
} from 'lucide-react'
import Companies from './Companies'

/** Shown as this value + sum of quantities on delivered orders (see `/api/stats/public`). */
const ITEMS_SOLD_DISPLAY_BASE = 500

const statsData = [
  { icon: Users, number: 500, suffix: '+', label: 'Happy Customers', description: 'Satisfied fashion enthusiasts' },
  { icon: Award, number: ITEMS_SOLD_DISPLAY_BASE, suffix: '+', label: 'Items Sold', description: 'Unique thrifted & new pieces' },
  { icon: Clock, number: 3, suffix: '+', label: 'Years Curating', description: 'Fashion expertise & style' },
  { icon: Star, number: 98, suffix: '%', label: 'Client Satisfaction', description: 'Exceeding expectations' },
]

const AnimatedCounter = ({ target, suffix = "", duration = 2000, triggerAnimation = false }: { target: number, suffix?: string, duration?: number, triggerAnimation?: boolean }) => {
  const [count, setCount] = useState(0)
  const animationRef = useRef<number | null>(null)

  const animateCount = (startValue: number, endValue: number, onComplete?: () => void) => {
    const startTime = Date.now()
    const totalChange = endValue - startValue
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.floor(startValue + (totalChange * easeOutQuart))
      setCount(currentCount)
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setCount(endValue)
        if (onComplete) onComplete()
      }
    }
    animate()
  }

  const startAnimationCycle = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    animateCount(0, target, () => {
      setTimeout(() => {
        animateCount(target, 0, () => {
          setTimeout(() => startAnimationCycle(), 500)
        })
      }, 1000)
    })
  }

  useEffect(() => {
    startAnimationCycle()
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
  }, [target])

  useEffect(() => {
    if (triggerAnimation) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      setCount(0)
      startAnimationCycle()
    }
  }, [triggerAnimation])

  return (
    <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
      {count}{suffix}
    </span>
  )
}

const StatCard = ({ stat, index }: { stat: any, index: number }) => {
  const [isInView, setIsInView] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsInView(true) }, { threshold: 0.3 })
    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current)
      if (scrollDelta > 10 && isInView) setShouldAnimate(prev => !prev)
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isInView])

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1, type: "spring", stiffness: 100 }}
      className="relative group"
    >
      <div className="hero-glass-frame relative backdrop-blur-lg h-full">
        <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
      <div className="relative glass-inner-panel backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl dark:hover:shadow-lg transition-all duration-500 transform hover:-translate-y-1 border border-primary-500/30 dark:border-primary-500/40 h-full">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={isInView ? { scale: 1, rotate: 0 } : {}}
          transition={{ duration: 0.6, delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center text-primary-700 dark:text-primary-200 group-hover:scale-110 transition-transform duration-300"
        >
          <stat.icon className="h-7 w-7" strokeWidth={1.5} aria-hidden />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.4, type: "spring", stiffness: 100 }}
          className="text-center mb-3"
        >
          <AnimatedCounter target={stat.number} suffix={stat.suffix} triggerAnimation={shouldAnimate} />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: index * 0.1 + 0.6, type: "spring", stiffness: 100 }}
          className="text-lg font-bold text-primary-800 dark:text-primary-100 text-center mb-2"
        >
          {stat.label}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: index * 0.1 + 0.8, type: "spring", stiffness: 100 }}
          className="text-primary-600 dark:text-primary-300 text-center text-xs leading-relaxed"
        >
          {stat.description}
        </motion.p>
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { 
                opacity: [0, 1, 0], 
                scale: [0, 1, 0], 
                x: [0, (i * 17 + index * 23) % 100 - 50], 
                y: [0, (i * 13 + index * 19) % 100 - 50] 
              } : {}}
              transition={{ duration: 2, delay: index * 0.1 + 1 + i * 0.3, repeat: Infinity, repeatDelay: 3 }}
              className="absolute w-2 h-2 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full"
              style={{ left: `${20 + i * 30}%`, top: `${20 + i * 20}%` }}
            />
          ))}
        </div>
      </div>
      </div>
    </motion.div>
  )
}

export default function Stats() {
  const { ref, style, scrollYProgress } = useScrollScale({ variant: 'centerPeak', intensity: 'subtle' })
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100])
  const backgroundScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.97, 1, 0.97])
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -50])

  const [deliveredLineItemsQty, setDeliveredLineItemsQty] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetch('/api/stats/public')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('stats'))))
      .then((d: { deliveredLineItemsQty?: number }) => {
        if (!cancelled) setDeliveredLineItemsQty(Number(d.deliveredLineItemsQty) || 0)
      })
      .catch(() => {
        if (!cancelled) setDeliveredLineItemsQty(0)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const statsWithLiveSold = useMemo(() => {
    const extra = deliveredLineItemsQty ?? 0
    const soldTotal = ITEMS_SOLD_DISPLAY_BASE + extra
    return statsData.map((s, i) => (i === 1 ? { ...s, number: soldTotal } : s))
  }, [deliveredLineItemsQty])

  return (
    <motion.section ref={ref} style={style} className="section relative overflow-hidden">
      <div className="container-custom relative z-10">
        <motion.div style={{ y: titleY }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <div className="hero-glass-frame relative inline-flex flex-shrink-0 backdrop-blur-lg mx-auto mb-6">
            <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
            <motion.div initial={{ scale: 0, rotate: -180 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 200 }} className="w-40 h-40 glass-inner-panel rounded-2xl border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl flex items-center justify-center">
              <img src="/assets/images/sections/stats/impact-icon.jpg" alt="Impact Icon" className="w-full h-full object-cover rounded-2xl" />
            </motion.div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary-800 dark:text-primary-100 mb-6">Oᑌᖇ <span className="text-accent-600 dark:text-accent-300">IᗰᑭᗩᑕT</span> Iᑎ ᑎᑌᗰᗷEᖇᔕ</h2>
          <p className="text-xl text-primary-600 dark:text-primary-300 max-w-3xl mx-auto leading-relaxed">Discover the impressive statistics that showcase our commitment to excellence, innovation, and client satisfaction across all our creative endeavors.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsWithLiveSold.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
        <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 1.2, type: "spring", stiffness: 100 }} className="text-center mt-16">
          <div className="hero-glass-frame relative inline-block backdrop-blur-lg rounded-full">
            <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-full" aria-hidden />
            <div className="inline-flex items-center space-x-4 glass-inner-panel backdrop-blur-sm px-8 py-4 rounded-full shadow-lg border border-primary-500/30 dark:border-primary-500/40">
              <Heart className="w-6 h-6 text-primary-600 dark:text-primary-300 animate-pulse" />
              <span className="text-primary-600 dark:text-primary-300 font-semibold">Trusted by creative professionals nationwide</span>
              <Globe className="w-6 h-6 text-accent-600 dark:text-accent-300 animate-pulse delay-1000" strokeWidth={1.75} />
            </div>
          </div>
        </motion.div>
        <Companies />
      </div>
    </motion.section>
  )
}


