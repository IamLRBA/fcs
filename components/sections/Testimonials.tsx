'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { AuthManager } from '@/lib/auth'
import Button from '@/components/ui/Button'
import ModalCloseButton from '@/components/ui/ModalCloseButton'
import { renderWithMysticalPieces } from '@/components/ui/MysticalPiecesWord'
import SafeImage from '@/components/common/SafeImage'

interface Testimonial {
  id: number | string
  text: string
  fullText: string
  author: string
  company: string
  image: string
  rating: number
  /** Site visitor reviews — shown in B&W like a print testimonial */
  fromUserReview?: boolean
  userId?: string
}

const defaultTestimonials: Testimonial[] = [
  { id: 1, text: "MysticalPIECES has an incredible eye for unique fashion finds. Their thrifted pieces are always in perfect condition and their styling advice is spot-on.", fullText: "MysticalPIECES has an incredible eye for unique fashion finds. Their thrifted pieces are always in perfect condition and their styling advice is spot-on. I've built most of my wardrobe from their curated collection, and every piece tells a story. The quality and uniqueness of their items is unmatched.", author: "Brian Najuna", company: "Fashion Enthusiast", image: "/assets/images/testimonials/brian-najuna.jpg", rating: 5 },
  { id: 2, text: "Their sustainable fashion approach is refreshing. They've helped me discover my personal style while being environmentally conscious.", fullText: "Their sustainable fashion approach is refreshing. They've helped me discover my personal style while being environmentally conscious. The team understands that fashion should be both beautiful and responsible. Every piece I've purchased has been a perfect fit for my lifestyle and values.", author: "Derrick Jnr", company: "Style Consultant", image: "/assets/images/testimonials/derrick-jnr.jpg", rating: 5 },
  { id: 3, text: "The blend of vintage and contemporary pieces they offer is exactly what I was looking for. Their curation is impeccable.", fullText: "The blend of vintage and contemporary pieces they offer is exactly what I was looking for. Their curation is impeccable. MysticalPIECES has helped me create a wardrobe that's both timeless and trendy. Their attention to detail and quality is evident in every piece they select.", author: "Irene Lekuru Gasper", company: "Fashion Blogger", image: "/assets/images/testimonials/irene-lekuru-gasper.jpg", rating: 5 },
  { id: 4, text: "Their styling consultations have transformed how I approach fashion. I now feel confident in every outfit I wear.", fullText: "Their styling consultations have transformed how I approach fashion. I now feel confident in every outfit I wear. The team at MysticalPIECES doesn't just sell clothes - they help you discover your authentic style. Their personalized approach makes all the difference.", author: "Sekina Paws", company: "Marketing Professional", image: "/assets/images/testimonials/sekina-paws.jpg", rating: 5 },
  { id: 5, text: "Their vintage collection is absolutely stunning. Every piece has character and quality that you just can't find in fast fashion.", fullText: "Their vintage collection is absolutely stunning. Every piece has character and quality that you just can't find in fast fashion. MysticalPIECES has helped me build a wardrobe that's both unique and sustainable. Their curation process ensures every item is special.", author: "Sizi", company: "Vintage Collector", image: "/assets/images/testimonials/sizi.jpg", rating: 5 },
  { id: 6, text: "The personal styling service is worth every penny. They've completely transformed my confidence and style.", fullText: "The personal styling service is worth every penny. They've completely transformed my confidence and style. The team at MysticalPIECES understands that fashion is about self-expression and empowerment. Their personalized approach has made all the difference in my wardrobe.", author: "Yusuf Wasswa", company: "Business Owner", image: "/assets/images/testimonials/yusuf-wasswa.jpg", rating: 5 },
]

export default function Testimonials() {
  const [testimonialsData, setTestimonialsData] = useState<Testimonial[]>(defaultTestimonials)
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isManuallyPaused, setIsManuallyPaused] = useState(false)
  const [sliderPosition, setSliderPosition] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(0.35) // Base speed multiplier - reduced for smoother viewing
  const [isResetting, setIsResetting] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [cardWidth, setCardWidth] = useState(350)
  const gap = 5
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPositionRef = useRef<number>(0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserFullName, setCurrentUserFullName] = useState<string | null>(null)

  useEffect(() => {
    const sync = () => {
      const u = AuthManager.getCurrentUser()
      setCurrentUserId(u?.id ?? null)
      setCurrentUserFullName(u?.fullName ?? null)
    }
    sync()
    window.addEventListener('authStateChanged', sync)
    return () => window.removeEventListener('authStateChanged', sync)
  }, [])

  // Set responsive card width - larger on mobile and desktop
  useEffect(() => {
    const updateCardWidth = () => {
      if (window.innerWidth < 640) {
        // Mobile: larger cards (90% of viewport width, max 420px)
        setCardWidth(Math.min(window.innerWidth * 0.9, 420))
      } else if (window.innerWidth < 1024) {
        // Tablet: medium size
        setCardWidth(380)
      } else {
        // Desktop: larger cards
        setCardWidth(420)
      }
    }
    updateCardWidth()
    window.addEventListener('resize', updateCardWidth)
    return () => window.removeEventListener('resize', updateCardWidth)
  }, [])

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Load user reviews and merge with default testimonials
    const loadReviews = () => {
      const userReviews = AuthManager.getAllReviews()
      
      // Ensure reviews have the latest profile images from users
      const users = AuthManager.getUsersList()
      const reviewsWithUpdatedImages = userReviews.map((review: any) => {
        const reviewUser = users.find(
          (u: any) => (review.userId && u.id === review.userId) || u.fullName === review.author
        )
        if (reviewUser && reviewUser.profileImage) {
          return {
            ...review,
            image: reviewUser.profileImage
          }
        }
        return review
      })
      
      const reviewsAsTestimonials: Testimonial[] = reviewsWithUpdatedImages.map((review: any) => ({
        id: review.id,
        text: review.text.length > 150 ? review.text.substring(0, 150) + '...' : review.text,
        fullText: review.text,
        author: review.author || 'Customer',
        company: 'Verified Customer',
        image: review.image || '/assets/images/testimonials/default.jpg',
        rating: review.rating || 5,
        fromUserReview: true,
        userId: review.userId,
      }))
      
      setTestimonialsData([...defaultTestimonials, ...reviewsAsTestimonials])
    }
    
    loadReviews()
    
    const handleReviewsUpdate = () => {
      loadReviews()
    }

    window.addEventListener('reviewsUpdated', handleReviewsUpdate)
    window.addEventListener('authStateChanged', handleReviewsUpdate) // Also update when user updates profile
    
    return () => {
      window.removeEventListener('reviewsUpdated', handleReviewsUpdate)
      window.removeEventListener('authStateChanged', handleReviewsUpdate)
    }
  }, [])

  // Touch/swipe handlers for smooth continuous manual scrolling
  const onTouchStart = (e: React.TouchEvent) => {
    const touchX = e.targetTouches[0].clientX
    setTouchStart(touchX)
    dragStartPositionRef.current = sliderPosition
    setIsDragging(true)
    setIsManuallyPaused(true)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !isDragging) return
    
    const touchX = e.targetTouches[0].clientX
    const deltaX = touchStart - touchX // Positive when swiping left (forward)
    
    // Update slider position in real-time based on finger movement
    // This creates smooth, continuous scrolling that follows the finger
    const newPosition = dragStartPositionRef.current - deltaX
    const cardDistance = cardWidth + gap
    const totalDistance = testimonialsData.length * cardDistance
    
    // Handle seamless looping - allow continuous scrolling in both directions
    let finalPosition = newPosition
    
    // If scrolled past one complete set, reset seamlessly
    if (Math.abs(newPosition) >= totalDistance) {
      setIsResetting(true)
      setTimeout(() => setIsResetting(false), 0)
      // Calculate position within the loop
      const remainder = Math.abs(newPosition) % totalDistance
      finalPosition = newPosition < 0 ? -remainder : remainder
    } else if (newPosition > 0) {
      // If scrolled past the start (positive position), wrap to end
      const remainder = newPosition % totalDistance
      finalPosition = remainder - totalDistance
    }
    
    setSliderPosition(finalPosition)
  }

  const onTouchEnd = () => {
    if (!touchStart) {
      setIsDragging(false)
      return
    }
    
    setTouchStart(null)
    setIsDragging(false)
    // Resume auto-scroll after a short delay
    setTimeout(() => {
      setIsManuallyPaused(false)
    }, 2000)
  }

  useEffect(() => {
    // Pause if manually paused OR hovered OR dragging
    if (isManuallyPaused || isHovered || isDragging || testimonialsData.length === 0) return
    const interval = setInterval(() => {
      setSliderPosition(prev => {
        const cardDistance = cardWidth + gap
        const totalDistance = testimonialsData.length * cardDistance
        // Move left by scrollSpeed pixels per frame
        const newPosition = prev - scrollSpeed
        // Reset seamlessly when we've scrolled through exactly one complete set
        // Since testimonials are triple-duplicated, we reset to start of second set
        // The reset is seamless because the second set is identical to the first
        if (Math.abs(newPosition) >= totalDistance) {
          // Mark that we're resetting for instant transition
          setIsResetting(true)
          // Reset to 0 (start of second identical set)
          // The instant transition ensures no visible jump
          setTimeout(() => setIsResetting(false), 0)
          return 0
        }
        return newPosition
      })
    }, 10)
    return () => clearInterval(interval)
  }, [isManuallyPaused, isHovered, isDragging, testimonialsData.length, scrollSpeed, cardWidth, gap])

  const handlePrev = () => {
    // Pause automatic sliding when clicking Back
    setIsManuallyPaused(true)
    // Optionally move back one card
    setSliderPosition(prev => {
      const cardDistance = cardWidth + gap
      const totalDistance = testimonialsData.length * cardDistance
      const newPosition = prev + cardDistance
      // If we go past 0, wrap to the end of the first set
      return newPosition > 0 ? -(totalDistance - cardDistance) : newPosition
    })
  }
  
  const handleNext = () => {
    // Increase scroll speed when clicking Forward
    setScrollSpeed(prev => Math.min(prev + 0.5, 5)) // Cap at 5x speed
    // Also move forward one card
    setSliderPosition(prev => {
      const cardDistance = cardWidth + gap
      const totalDistance = testimonialsData.length * cardDistance
      const newPosition = prev - cardDistance
      // Reset seamlessly when we've scrolled through one set
      return Math.abs(newPosition) >= totalDistance ? 0 : newPosition
    })
    // Resume automatic sliding if it was manually paused
    setIsManuallyPaused(false)
  }

  const renderStars = (rating: number) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={12} className={i < rating ? "text-accent-500 fill-accent-500" : "text-gray-300"} />
  ))

  // Triple-duplicate testimonials for seamless infinite scrolling
  // When we scroll through one set and reset, the buffer ensures no visible jump
  const duplicatedTestimonials = [...testimonialsData, ...testimonialsData, ...testimonialsData]

  // Effect to measure container width
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    updateContainerWidth()
    window.addEventListener('resize', updateContainerWidth)
    return () => window.removeEventListener('resize', updateContainerWidth)
  }, [])

  // Calculate scale based on position relative to center
  const getCardScale = (index: number) => {
    if (containerWidth === 0) return 1
    
    const cardDistance = cardWidth + gap
    // Calculate the center X position of the card
    const cardCenterX = sliderPosition + (index * cardDistance) + (cardWidth / 2)
    const containerCenterX = containerWidth / 2
    const distanceFromCenter = Math.abs(cardCenterX - containerCenterX)
    
    // Maximum distance for scaling effect (half container width + some buffer)
    const maxDistance = containerWidth / 2.5
    
    // Calculate scale: 0.7 at edges (smaller), 1.0 at center (current size is max)
    const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1)
    const scale = 0.7 + (0.3 * (1 - normalizedDistance))
    
    return scale
  }

  return (
    <section className="section relative overflow-hidden">
      <div className="container-custom relative z-10">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-bold text-primary-800 dark:text-primary-100 mb-16 text-center">TEᔕTIᗰOᑎIᗩᒪᔕ</motion.h2>
        <div className="slider-container relative" ref={containerRef}>
          <motion.div 
            ref={sliderRef}
            className="slider-track flex" 
            animate={{ x: sliderPosition }} 
            transition={isResetting ? { duration: 0 } : { type: "tween", ease: "linear", duration: 0 }} 
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ gap: `${gap}px`, touchAction: 'pan-x' }}
          >
            {duplicatedTestimonials.map((testimonial, index) => {
              const cardScale = getCardScale(index)
              return (
                <motion.div 
                  key={`${testimonial.id}-${index}`} 
                  className="testimonial-card flex-shrink-0" 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  whileInView={{ opacity: 1 }} 
                  viewport={{ once: true }} 
                  whileHover={{ scale: cardScale * 1.05 }} 
                  animate={{ scale: cardScale }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  onClick={() => setSelectedTestimonial(testimonial)} 
                  style={{ width: `${cardWidth}px` }}
                >
                <div className="hero-glass-frame relative h-full flex flex-col backdrop-blur-lg">
                  <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
                <div className="testimonial-content bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 rounded-2xl p-4 sm:p-3 lg:p-5 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col hover:scale-105 border border-primary-500/30 dark:border-primary-500/40 backdrop-blur-sm">
                  <div className="flex justify-center mb-2 sm:mb-1.5 lg:mb-2">
                    <div className="w-8 h-8 sm:w-6 sm:h-6 lg:w-7 lg:h-7 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 text-primary-600 dark:text-primary-300" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                    </div>
                  </div>
                  <p className="testimonial-text text-primary-700 dark:text-primary-200 text-sm sm:text-xs lg:text-sm leading-snug mb-3 sm:mb-2 lg:mb-3 flex-grow line-clamp-4 text-center">
                    &ldquo;{renderWithMysticalPieces(testimonial.text, `card-${testimonial.id}-${index}`)}&rdquo;
                  </p>
                  <div className="stars flex justify-center mb-3 sm:mb-2 lg:mb-3">{renderStars(testimonial.rating)}</div>
                  <div className="testimonial-author">
                    <div className="author-image w-10 h-10 sm:w-8 sm:h-8 lg:w-9 lg:h-9 bg-primary-200 dark:bg-primary-700 rounded-full flex items-center justify-center text-primary-800 dark:text-primary-100 font-bold text-base sm:text-sm lg:text-base mx-auto mb-2 sm:mb-1 lg:mb-2 overflow-hidden">
                      {testimonial.image ? (
                        <SafeImage
                          src={testimonial.image}
                          alt={testimonial.author}
                          width={40}
                          height={40}
                          className={`w-full h-full rounded-full object-cover ${testimonial.fromUserReview ? 'grayscale' : ''}`}
                          sizes="40px"
                          loading="lazy"
                        />
                      ) : (
                        testimonial.author.split(' ').map((n: string) => n[0]).join('')
                      )}
                    </div>
                    <div className="author-info text-center">
                      <h4 className="author-name text-primary-800 dark:text-primary-100 font-semibold text-sm sm:text-xs lg:text-sm">{testimonial.author}</h4>
                      <p className="author-role text-primary-600 dark:text-primary-300 text-xs sm:text-xs lg:text-xs">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
                </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
        <div className="mobile-nav-buttons flex justify-center mt-8 space-x-4">
          <Button
            variant="default"
            size="icon"
            className="nav-button w-12 h-12 flex items-center justify-center"
            onClick={handlePrev}
          >
            ⟸
          </Button>
          <Button
            variant="default"
            size="icon"
            className="nav-button w-12 h-12 flex items-center justify-center"
            onClick={handleNext}
          >
            ⟹
          </Button>
        </div>
        <AnimatePresence>
          {selectedTestimonial && (
            <motion.div 
              className="modal fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
              style={{
                backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.5)'
              }}
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedTestimonial(null)}
            >
              <div className="hero-glass-frame relative max-w-lg w-full overflow-visible backdrop-blur-lg bg-white/25 dark:bg-neutral-900/20 dark:border-neutral-600" onClick={(e) => e.stopPropagation()}>
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <motion.div className="modal-content relative flex w-full max-h-[80vh] flex-col overflow-visible rounded-bl-2xl rounded-br-none rounded-tl-2xl rounded-tr-none bg-white dark:bg-neutral-950" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                <ModalCloseButton onClose={() => setSelectedTestimonial(null)} className="absolute top-0 right-0 z-[1200] flex-shrink-0 translate-x-1/2 -translate-y-1/2" aria-label="Close" />
                <div className="modal-scrollbar min-h-0 flex-1 overflow-y-auto p-6 pt-14">
                <div className="testimonial-content">
                  <p className="testimonial-text text-primary-700 dark:text-primary-200 text-base leading-relaxed mb-4 text-center">
                    &ldquo;{renderWithMysticalPieces(selectedTestimonial.fullText, `modal-${selectedTestimonial.id}`)}&rdquo;
                  </p>
                  <div className="stars flex justify-center mb-4">{renderStars(selectedTestimonial.rating)}</div>
                </div>
                <div className="testimonial-author">
                  <div className="author-image w-12 h-12 bg-primary-200 dark:bg-primary-700 rounded-full flex items-center justify-center text-primary-800 dark:text-primary-100 font-bold text-base mx-auto mb-2 overflow-hidden">
                    {selectedTestimonial.image ? (
                      <SafeImage
                        src={selectedTestimonial.image}
                        alt={selectedTestimonial.author}
                        width={48}
                        height={48}
                        className={`w-full h-full rounded-full object-cover ${selectedTestimonial.fromUserReview ? 'grayscale' : ''}`}
                        sizes="48px"
                        loading="lazy"
                      />
                    ) : (
                      selectedTestimonial.author.split(' ').map((n: string) => n[0]).join('')
                    )}
                  </div>
                  <div className="author-info text-center">
                    <h4 className="author-name text-primary-800 dark:text-primary-100 font-semibold text-base mb-0.5">{selectedTestimonial.author}</h4>
                    <p className="author-role text-primary-600 dark:text-primary-300 text-sm">{selectedTestimonial.company}</p>
                  </div>
                </div>
                {selectedTestimonial.fromUserReview &&
                  currentUserId &&
                  (selectedTestimonial.userId === currentUserId ||
                    (!selectedTestimonial.userId &&
                      currentUserFullName &&
                      selectedTestimonial.author === currentUserFullName)) && (
                    <div className="mt-5 flex justify-center border-t border-neutral-200/80 dark:border-neutral-700/80 pt-4">
                      <Link
                        href={`/account?tab=reviews&editReview=${encodeURIComponent(String(selectedTestimonial.id))}`}
                        onClick={() => setSelectedTestimonial(null)}
                        className="text-sm font-medium text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 underline underline-offset-2 transition-colors"
                      >
                        Edit your review
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
