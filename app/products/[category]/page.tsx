'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ShoppingCart, X, Maximize2, Minimize, Quote } from 'lucide-react'
import { CartManager, type CartItem } from '@/lib/cart'
import Button from '@/components/ui/Button'
import ModalCloseButton from '@/components/ui/ModalCloseButton'
import { AuthManager } from '@/lib/auth'
import SafeImage from '@/components/common/SafeImage'
import SegmentedPillNav from '@/components/ui/SegmentedPillNav'
import HorizontalScrollAffordance from '@/components/ui/HorizontalScrollAffordance'
import { CATEGORY_SUBCATEGORY_SLUGS } from '@/lib/catalog/category-subcategories'

interface Product {
  id: string
  name: string
  brand: string
  category: string
  section: string
  price_ugx: number
  original_price: number
  sizes: string[]
  colors: string[]
  images: string[]
  description: string
  condition: string
  sku: string
  stock_qty: number
  isActive?: boolean
}

function SubcategoryThumb({ paths, alt }: { paths: string[]; alt: string }) {
  const [idx, setIdx] = useState(0)
  const safeIdx = Math.min(idx, Math.max(0, paths.length - 1))
  const src = paths[safeIdx] ?? '/assets/images/placeholder.jpg'
  return (
    <SafeImage
      src={src}
      alt={alt}
      width={192}
      height={192}
      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl"
      sizes="(max-width: 640px) 80px, 96px"
      loading="lazy"
      onError={() => setIdx((i) => (i < paths.length - 1 ? i + 1 : i))}
    />
  )
}

const ProductGridCard = memo(function ProductGridCard({
  product,
  index,
  onOpen,
}: {
  product: Product
  index: number
  onOpen: (p: Product) => void
}) {
  const hasDiscount = Boolean(product.original_price && product.original_price > product.price_ugx)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="w-full transition-all duration-300 group cursor-pointer"
      onClick={() => onOpen(product)}
    >
      <div className="hero-glass-frame relative h-full backdrop-blur-md group-hover:shadow-xl transition-shadow duration-300">
        <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
        <div className="bg-primary-800/30 rounded-md overflow-hidden border border-primary-500/30 h-full flex flex-col gap-1.5 p-1.5 sm:gap-1.5 sm:p-2">
          <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-primary-900/20">
            <SafeImage
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 180px, 220px"
              loading="lazy"
            />
            {hasDiscount && (
              <div className="absolute left-1.5 top-1.5 rounded-full bg-accent-500 px-1.5 py-0.5 text-[10px] font-bold text-white sm:text-xs">
                {Math.round(((product.original_price! - product.price_ugx) / product.original_price!) * 100)}% OFF
              </div>
            )}
          </div>

          <div className="px-0.5 pb-0.5 pt-0 text-center sm:px-1">
            <p className="mb-px line-clamp-1 text-[10px] leading-tight text-primary-700 dark:text-primary-400 sm:text-xs">{product.brand}</p>
            <h3 className="mb-px line-clamp-2 text-[11px] font-bold leading-snug text-neutral-850 dark:text-primary-50 sm:text-xs">{product.name}</h3>
            <div className="mb-1 mt-px flex flex-wrap items-center justify-center gap-x-1 gap-y-0">
              <span className="text-[11px] font-bold text-primary-600 dark:text-primary-300 sm:text-xs">
                UGX {product.price_ugx.toLocaleString()}
              </span>
              {product.original_price && (
                <span className="text-[10px] leading-none text-neutral-600 line-through dark:text-neutral-400 sm:text-[11px]">
                  UGX {product.original_price.toLocaleString()}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center space-x-1">
              <Button
                variant="default"
                size="sm"
                className="flex-1 justify-center gap-1 py-1 text-[11px] font-medium sm:gap-1 sm:py-1.5 sm:text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpen(product)
                }}
                aria-label={`Quick view ${product.name}`}
              >
                <ShoppingCart className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Quick View</span>
                <span className="sm:hidden">View</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

export default function ProductCategoryPage() {
  const params = useParams()
  const category = params.category as string
  
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [catalog, setCatalog] = useState<any>({ products: {} })
  const [loading, setLoading] = useState(true)
  const [showBackButton, setShowBackButton] = useState(true)

  useEffect(() => {
    let active = true
    const loadCatalog = async () => {
      try {
        const res = await fetch(
          `/api/products?grouped=1&category=${encodeURIComponent(category)}`
        )
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()
        if (active) setCatalog(data)
      } catch (error) {
        console.error('Error loading products:', error)
        if (active) setCatalog({ products: {} })
      } finally {
        if (active) setLoading(false)
      }
    }
    loadCatalog()
    return () => {
      active = false
    }
  }, [category])

  const categoryData = catalog.products?.[category]

  useEffect(() => {
    setSelectedSection(null)
  }, [category])

  useEffect(() => {
    if (!categoryData) return
    const keys = Object.keys(categoryData.subcategories)
    if (keys.length === 0) return

    const hash =
      typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : ''

    if (hash && keys.includes(hash)) {
      setSelectedSection(hash)
    } else {
      setSelectedSection(keys[0])
    }
  }, [category, categoryData])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setShowBackButton(scrollTop < 100)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const openProductModal = useCallback((product: Product) => {
    setSelectedProduct(product)
    AuthManager.addViewedItem(product.id)
  }, [])

  const closeProductModal = useCallback(() => {
    setSelectedProduct(null)
  }, [])

  const scrollToSection = useCallback((section: string) => {
    setSelectedSection(section)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${section}`)
    }
    const element = document.getElementById(section)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-semibold">Loading products...</h1>
      </div>
    )
  }

  if (!categoryData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-bold">Category Not Found</h1>
      </div>
    )
  }

  const sections = Object.keys(categoryData.subcategories)
  const productsBySection = Object.entries(categoryData.subcategories) as [string, Product[]][]

  const sectionNavItems = sections.map((section) => ({
    id: section,
    label: section
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
  }))

  // Get category-specific animation config (opening transitions only)
  const getCategoryConfig = () => {
    const configs: Record<string, { 
      titleAnimation: any,
      descriptionAnimation: any
    }> = {
      'shirts': {
        titleAnimation: {
          initial: { opacity: 0, x: -100 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.8, delay: 0.2 }
        },
        descriptionAnimation: {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay: 0.4 }
        }
      },
      'tees': {
        titleAnimation: {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.7, delay: 0.15, type: 'spring' }
        },
        descriptionAnimation: {
          initial: { opacity: 0, x: 50 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.7, delay: 0.3 }
        }
      },
      'coats': {
        titleAnimation: {
          initial: { opacity: 0, y: 50 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay: 0.25, type: 'spring' }
        },
        descriptionAnimation: {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.7, delay: 0.45 }
        }
      },
      'pants-and-shorts': {
        titleAnimation: {
          initial: { opacity: 0, x: 100 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.75, delay: 0.2, type: 'spring' }
        },
        descriptionAnimation: {
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay: 0.35 }
        }
      },
      'footwear': {
        titleAnimation: {
          initial: { opacity: 0, y: -30, scale: 0.9 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: { duration: 0.8, delay: 0.3, type: 'spring' }
        },
        descriptionAnimation: {
          initial: { opacity: 0, x: -30 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.7, delay: 0.5 }
        }
      },
      'accessories': {
        titleAnimation: {
          initial: { opacity: 0, scale: 0.5, rotate: -10 },
          animate: { opacity: 1, scale: 1, rotate: 0 },
          transition: { duration: 0.9, delay: 0.2, type: 'spring', bounce: 0.4 }
        },
        descriptionAnimation: {
          initial: { opacity: 0, rotateX: 90 },
          animate: { opacity: 1, rotateX: 0 },
          transition: { duration: 0.8, delay: 0.4 }
        }
      }
    }
    return configs[category] || configs['shirts']
  }

  const categoryConfig = getCategoryConfig()
  const { titleAnimation, descriptionAnimation } = categoryConfig

  // Helper function to get main product image based on category
  const getMainProductImage = (categorySlug: string): string => {
    const imageMap: Record<string, string> = {
      'shirts': '/assets/images/products-sections/fashion/shirts.jpg',
      'tees': '/assets/images/products-sections/fashion/tees.jpg',
      'coats': '/assets/images/products-sections/fashion/outerwear.jpg',
      'pants-and-shorts': '/assets/images/products-sections/fashion/bottoms.jpg',
      'footwear': '/assets/images/products-sections/fashion/footwear.jpg',
      'accessories': '/assets/images/products-sections/fashion/accessories.jpg'
    }
    
    return imageMap[categorySlug] || '/assets/images/placeholder.jpg'
  }

  // Helper function to get subcategory image based on category and section
  const getSubcategoryImage = (categorySlug: string, sectionSlug: string): string => {
    const subcategories = [...(CATEGORY_SUBCATEGORY_SLUGS[categorySlug] ?? [])]
    const thumbIndex = subcategories.indexOf(sectionSlug) + 1
    
    if (thumbIndex > 0) {
      return `/assets/images/products-sections/fashion/${categorySlug}/thumb${thumbIndex}.jpg`
    }
    
    return '/assets/images/placeholder.jpg'
  }

  const getSubcategoryImageCandidates = (categorySlug: string, sectionSlug: string): string[] => {
    const paths = [getSubcategoryImage(categorySlug, sectionSlug)]
    if (categorySlug === 'pants-and-shorts') {
      paths.push(
        `/assets/images/products-sections/fashion/bottoms/thumb${(sections.indexOf(sectionSlug) % 4) + 1}.jpg`,
        `/assets/images/products-sections/fashion/pants/thumb${(sections.indexOf(sectionSlug) % 4) + 1}.jpg`
      )
    }
    // Avoid using Set spreading (can break TS build with older targets)
    const unique: string[] = []
    for (const p of paths) {
      if (!unique.includes(p)) unique.push(p)
    }
    return unique
  }

  // Helper function to get quote for each category
  const getCategoryQuote = (categorySlug: string): { text: string; author: string } => {
    const quotes: Record<string, { text: string; author: string }> = {
      'shirts': {
        text: 'A shirt that fits well is worth more than one that costs a fortune.',
        author: 'Tommy Hilfiger'
      },
      'tees': {
        text: 'Less is more when you\'re wearing the right t-shirt.',
        author: 'Ralph Lauren'
      },
      'coats': {
        text: 'A coat should keep you warm, but a great coat should make you feel like you can conquer the world.',
        author: 'Coco Chanel'
      },
      'pants-and-shorts': {
        text: 'The right pair of pants can make you feel confident and ready to take on anything.',
        author: 'Karl Lagerfeld'
      },
      'footwear': {
        text: 'Sneakers aren\'t just utilitarian, they\'re borderline art objects.',
        author: 'Virgil Abloh'
      },
      'accessories': {
        text: 'Accessories are like vitamins to fashion – they enhance the outfit.',
        author: 'Anna Dello Russo'
      }
    }
    
    return quotes[categorySlug] || { text: '', author: '' }
  }

  return (
    <div className="min-h-screen bg-unified relative overflow-hidden pt-20">
      {/* Navigation Back */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: showBackButton ? 1 : 0, x: showBackButton ? 0 : -120 }}
        transition={{ duration: 0.3 }}
        className="fixed top-20 left-4 sm:left-8 z-50 pointer-events-none"
        style={{ pointerEvents: showBackButton ? 'auto' : 'none' }}
      >
        <Link href="/sections/shop#our-products" className="focus-ring-none inline-flex items-center gap-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 transition-colors duration-300">
          <span className="btn-unified-circle flex-shrink-0">⟸</span>
          <span className="text-sm font-medium">Back to Shop</span>
        </Link>
      </motion.div>

      {/* Hero Section */}
      <section className="relative text-center pt-16 pb-12 md:pt-12 md:pb-20 px-4 overflow-hidden">
        <div className="relative max-w-6xl mx-auto">
          {/* Main Product Image and Title */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-1 md:mb-6"
          >
            {/* Main Product Image */}
            <div className="hero-glass-frame relative flex-shrink-0 backdrop-blur-md">
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
              <div className="bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 rounded-2xl border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl p-6 sm:p-8">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shrink-0 mx-auto">
                  <SafeImage
                    src={getMainProductImage(category)}
                    alt={`${categoryData.title} - Main Product Image`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 160px"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Title */}
            <motion.h1
              {...titleAnimation}
              className={`font-bold tracking-tight ${
                category === 'coats' || category === 'accessories'
                  ? 'text-5xl sm:text-5xl md:text-7xl lg:text-8xl'
                  : 'text-6xl md:text-7xl lg:text-8xl'
              }`}
            >
              <span className="bg-gradient-to-r from-primary-800 via-primary-600 to-primary-800 dark:from-primary-200 dark:via-primary-400 dark:to-primary-200 bg-clip-text text-transparent">
                {categoryData.title.toUpperCase()}
              </span>
            </motion.h1>
          </motion.div>

          {/* Quote */}
          <motion.div
            {...descriptionAnimation}
            className="text-lg md:text-xl text-primary-600 dark:text-primary-300 max-w-[99%] sm:max-w-2xl md:max-w-4xl mx-auto -mt-2 md:mt-0 mb-6 md:mb-8 font-light leading-relaxed"
          >
            {(() => {
              const quote = getCategoryQuote(category)
              return quote.text ? (
                <blockquote className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-1">
                  <Quote className="w-6 h-6 md:w-8 md:h-8 md:mt-3 flex-shrink-0 text-primary-400/50 dark:text-primary-500/50 order-1 md:order-none" />
                  <div className="flex-1 order-2 md:order-none">
                    <p className="mb-3 italic text-lg md:text-xl">&ldquo;{quote.text}&rdquo;</p>
                    <p className="text-base md:text-lg">— {quote.author}</p>
                  </div>
                </blockquote>
              ) : null
            })()}
          </motion.div>

          {/* Section Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-4xl mx-auto px-1"
          >
            <SegmentedPillNav
              items={sectionNavItems}
              value={selectedSection ?? sections[0] ?? null}
              onSelect={(id) => scrollToSection(id)}
              className="focus-ring-none"
            />
          </motion.div>
        </div>
      </section>

      {/* Products Grid by Section */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {productsBySection.map(([section, products]) => {
          const visibleProducts = products.filter((product: any) => product.isActive !== false)
          return (
          <motion.section
            key={section}
            id={section}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-32"
          >
            {/* Subcategory Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-8"
            >
            <div className="hero-glass-frame relative flex-shrink-0 backdrop-blur-md">
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
              <div className="bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 rounded-2xl border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl p-6 sm:p-8">
                <SubcategoryThumb
                  paths={(() => {
                    const primary = getSubcategoryImage(category, section)
                    const extra = getSubcategoryImageCandidates(category, section).filter((p) => p !== primary)
                    const unique: string[] = []
                    for (const p of [primary, ...extra, '/assets/images/placeholder.jpg']) {
                      if (!unique.includes(p)) unique.push(p)
                    }
                    return unique
                  })()}
                  alt={`${section} - ${categoryData.title}`}
                />
              </div>
            </div>
            </motion.div>
            
            <h2 className="text-4xl font-bold text-center mb-12 capitalize">
              {section.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </h2>
            
            {visibleProducts.length === 0 ? (
              <div className="mx-auto max-w-xl rounded-2xl border border-primary-500/20 dark:border-primary-400/30 bg-primary-800/20 dark:bg-neutral-900/40 p-6 sm:p-8 text-center">
                <p className="text-xl sm:text-2xl font-semibold text-primary-800 dark:text-primary-100">
                  Products Not Available
                </p>
                <div className="hero-cta-buttons flex justify-center mt-6">
                  <Button
                    href="/sections/shop#our-products"
                    variant="default"
                    size="md"
                    className="inline-flex items-center justify-center"
                  >
                    Check Other Products
                  </Button>
                </div>
              </div>
            ) : (
            <HorizontalScrollAffordance
              showEdgeFades={false}
              syncScrollEdgeLines
              syncScrollEdgeLineClassName="bg-gradient-to-b from-primary-800/38 to-primary-600/26 dark:from-neutral-600 dark:to-neutral-500"
              hideScrollbar
              className="mx-auto mb-8 w-full max-w-6xl -mx-4 px-4 sm:mx-0 sm:mb-10 sm:px-0 md:mb-12"
              scrollClassName="pt-6 pb-8"
              scrollAriaLabel={`${section.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} products`}
            >
              <div className="flex min-h-[1px] min-w-full w-max flex-row items-stretch justify-center gap-2.5 px-2.5 sm:gap-3 sm:px-5 md:gap-4 lg:gap-5">
                {visibleProducts.map((product: Product, index: number) => (
                  <div
                    key={product.id}
                    className="w-[min(180px,calc(100vw-2.25rem))] flex-shrink-0 sm:w-[min(204px,calc((min(72rem,100vw)-6.5rem)/2))] md:w-[min(220px,calc((min(72rem,100vw)-9rem)/3))]"
                  >
                    <ProductGridCard
                      product={product}
                      index={index}
                      onOpen={openProductModal}
                    />
                  </div>
                ))}
              </div>
            </HorizontalScrollAffordance>
            )}
          </motion.section>
          )
        })}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <MemoProductModal product={selectedProduct} onClose={closeProductModal} />
        )}
      </AnimatePresence>
    </div>
  )
}

// Product Modal Component
function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Get the single size and color for this product (since each product is one piece)
  const productSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : ''
  const productColor = product.colors && product.colors.length > 0 ? product.colors[0] : ''

  // Check if product is already in cart
  useEffect(() => {
    const checkCartStatus = () => {
      setIsInCart(CartManager.isProductInCart(product.id))
    }
    
    checkCartStatus()
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', checkCartStatus)
    
    return () => {
      window.removeEventListener('cartUpdated', checkCartStatus)
    }
  }, [product.id])

  const addToCart = () => {
    // Check if already in cart
    if (isInCart || addedToCart) {
      alert('This product is already in your cart. Each product is a single unique piece.')
      return
    }

    setIsAddingToCart(true)
    
    const cartItem: CartItem = {
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price_ugx,
      size: productSize,
      color: productColor,
      quantity: 1,
      image: product.images[0],
      sku: product.sku
    }
    
    const success = CartManager.addToCart(cartItem)
    
    if (!success) {
      alert('This product is already in your cart. Each product is a single unique piece.')
      setIsAddingToCart(false)
      setAddedToCart(true) // Show as already added
      return
    }
    
    setTimeout(() => {
      setIsAddingToCart(false)
      setAddedToCart(true)
    }, 300)
  }

  const openFullscreen = () => setIsFullscreen(true)
  const closeFullscreen = () => setIsFullscreen(false)

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        closeFullscreen()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isFullscreen])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/55 p-3 dark:bg-black/85 sm:p-4"
      onClick={onClose}
    >
      <style jsx>{`
        .modal-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .modal-scroll::-webkit-scrollbar-thumb {
          background: rgba(111, 78, 55, 0.3);
          border-radius: 9999px;
        }
        .modal-scroll::-webkit-scrollbar-track {
          background: rgba(111, 78, 55, 0.1);
          border-radius: 9999px;
        }
        .dark .modal-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.25);
        }
        .dark .modal-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
      <div
        className="hero-glass-frame relative w-full max-w-md sm:max-w-3xl md:max-w-5xl backdrop-blur-md bg-white/30 dark:bg-neutral-900/25 dark:border-neutral-600"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
        <ModalCloseButton onClose={onClose} className="absolute top-2 right-2 z-40 flex-shrink-0" aria-label="Close modal" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative flex w-full max-h-[70vh] flex-col overflow-hidden rounded-bl-2xl rounded-br-none rounded-tl-2xl rounded-tr-none border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-800 sm:max-h-[80vh] md:max-h-[85vh]"
      >
        <div className="modal-scroll min-h-0 flex-1 overflow-y-auto pt-10 sm:pt-8 md:pt-6 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
        <div className="flex flex-col md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-5 sm:gap-6 md:gap-10">
          {/* Image Gallery */}
          <div className="flex-shrink-0 flex flex-col space-y-4">
            <div className="relative mx-auto w-full max-w-[28rem] aspect-square bg-neutral-100 dark:bg-primary-900/20 rounded-lg overflow-hidden group flex items-center justify-center">
              <SafeImage
                src={product.images[currentImageIndex]}
                alt={product.name}
                fill
                className="object-contain object-center"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
                priority
              />
              {product.images.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isFullscreen ? closeFullscreen : openFullscreen}
                  className="absolute top-4 right-4 p-2 text-neutral-700 dark:text-white/90 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                  aria-label="Fullscreen"
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </motion.button>
              )}
            </div>
            {product.images.length > 1 && (
              <HorizontalScrollAffordance
                showEdgeFades={false}
                syncScrollEdgeLines
                syncScrollEdgeLineClassName="bg-gradient-to-b from-primary-800/38 to-primary-600/26 dark:from-neutral-600 dark:to-neutral-500"
                hideScrollbar
                className="pt-2"
                scrollClassName="py-3"
                scrollAriaLabel="Product image thumbnails"
              >
                <div className="flex min-h-[1px] min-w-full w-max flex-row items-center justify-center gap-2 px-1 md:gap-3">
                  {product.images.map((img, index) => {
                    const isActive = currentImageIndex === index
                    return (
                    <button
                      key={index}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`focus-ring-none relative aspect-square w-14 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-neutral-100 transition-all duration-200 sm:w-16 md:w-[4.75rem] dark:bg-neutral-800/40 ${
                        isActive
                          ? 'z-[1] border-primary-600 shadow-md ring-2 ring-primary-500/80 ring-offset-2 ring-offset-white dark:border-primary-400 dark:ring-primary-400/70 dark:ring-offset-neutral-900'
                          : 'border-neutral-300/90 hover:border-primary-400/70 dark:border-neutral-600 dark:hover:border-primary-500/60'
                      }`}
                    >
                      <span className="absolute inset-1.5 overflow-hidden rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                        <SafeImage
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          className="object-contain object-center"
                          sizes="80px"
                          loading="lazy"
                        />
                      </span>
                    </button>
                    )
                  })}
                </div>
              </HorizontalScrollAffordance>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="space-y-4">
              <div>
                <p className="text-primary-700 dark:text-primary-400 text-sm mb-1">{product.brand} • {product.sku}</p>
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-primary-50 mb-1">{product.name}</h2>
                <div className="flex items-center flex-wrap gap-2 mb-3">
                  <span className="text-3xl font-bold text-primary-600 dark:text-primary-300">
                    UGX {product.price_ugx.toLocaleString()}
                  </span>
                  {product.original_price && (
                    <span className="text-lg text-neutral-600 dark:text-neutral-400 line-through">
                      UGX {product.original_price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-neutral-700 dark:text-primary-300 leading-relaxed">{product.description}</p>

              {/* Size Display */}
              {(productSize || productColor) && (
                <div className="flex flex-wrap items-center gap-4 text-neutral-700 dark:text-primary-300">
                  {productSize && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Size:</span>
                      <span className="px-3 py-1 rounded-lg bg-primary-700/30">
                        {productSize}
                      </span>
                    </div>
                  )}
                  {productColor && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Color:</span>
                      <span className="px-3 py-1 rounded-lg bg-primary-100 dark:bg-neutral-700 text-primary-700 dark:text-neutral-300">
                        {productColor}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <div className="pt-5 mt-5 border-t border-neutral-200 dark:border-primary-600/40">
              <Button
                variant="default"
                size="md"
                onClick={addToCart}
                disabled={isAddingToCart || addedToCart || isInCart || product.stock_qty === 0}
                className={`w-full justify-center gap-2 ${isAddingToCart || addedToCart || isInCart || product.stock_qty === 0 ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>
                  {isAddingToCart ? 'Adding...' : (addedToCart || isInCart) ? 'Already in Cart' : product.stock_qty === 0 ? 'Out of Stock' : 'Add to Cart'}
                </span>
              </Button>
            </div>
          </div>
        </div>
        </div>
      </motion.div>
      </div>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black p-4"
            onClick={closeFullscreen}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation()
                closeFullscreen()
              }}
              className="absolute top-4 right-4 z-10 p-2 text-white/85 transition-colors hover:text-white"
              aria-label="Exit fullscreen"
            >
              <Minimize className="h-6 w-6" />
            </motion.button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-full max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <SafeImage
                src={product.images[currentImageIndex]}
                alt={product.name}
                width={1920}
                height={1920}
                className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
                sizes="100vw"
                priority
              />
            </motion.div>
            {product.images.length > 1 && (
              <>
                <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2 sm:left-4">
                  <Button
                    type="button"
                    variant="circle"
                    className="focus-ring-none !border-white/35 !bg-white/15 !text-white hover:!bg-white/25"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))
                    }}
                    aria-label="Previous image"
                  >
                    <span className="relative z-10 text-lg font-medium leading-none inline-block" aria-hidden>
                      ⟸
                    </span>
                  </Button>
                </div>
                <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2 sm:right-4">
                  <Button
                    type="button"
                    variant="circle"
                    className="focus-ring-none !border-white/35 !bg-white/15 !text-white hover:!bg-white/25"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))
                    }}
                    aria-label="Next image"
                  >
                    <span className="relative z-10 text-lg font-medium leading-none inline-block" aria-hidden>
                      ⟹
                    </span>
                  </Button>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                  {currentImageIndex + 1} / {product.images.length}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const MemoProductModal = memo(ProductModal)

