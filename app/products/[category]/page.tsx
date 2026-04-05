'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ShoppingCart, X, Maximize2, Minimize, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { CartManager, type CartItem } from '@/lib/cart'
import Button from '@/components/ui/Button'
import ModalCloseButton from '@/components/ui/ModalCloseButton'
import { AuthManager } from '@/lib/auth'
import SafeImage from '@/components/common/SafeImage'
import SegmentedPillNav from '@/components/ui/SegmentedPillNav'

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
      className="w-full max-w-xs transition-all duration-300 group cursor-pointer"
      onClick={() => onOpen(product)}
    >
      <div className="hero-glass-frame relative h-full backdrop-blur-md group-hover:shadow-xl transition-shadow duration-300">
        <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
        <div className="bg-primary-800/30 rounded-xl overflow-hidden border border-primary-500/30 h-full flex flex-col">
          <div className="relative w-full aspect-square bg-primary-900/20 overflow-hidden">
            <SafeImage
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 280px"
              loading="lazy"
            />
            {hasDiscount && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-accent-500 text-white text-xs font-bold rounded-full">
                {Math.round(((product.original_price! - product.price_ugx) / product.original_price!) * 100)}% OFF
              </div>
            )}
          </div>

          <div className="p-2 text-center">
            <p className="text-primary-700 dark:text-primary-400 text-xs mb-0.5 line-clamp-1">{product.brand}</p>
            <h3 className="text-sm font-bold text-neutral-850 dark:text-primary-50 mb-0.5 line-clamp-2">{product.name}</h3>
            <div className="flex items-center justify-center space-x-1 mb-1 flex-wrap">
              <span className="text-base sm:text-sm font-bold text-primary-600 dark:text-primary-300">
                UGX {product.price_ugx.toLocaleString()}
              </span>
              {product.original_price && (
                <span className="text-xs text-neutral-600 dark:text-neutral-400 line-through">
                  UGX {product.original_price.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1.5">
              <Button
                variant="default"
                size="sm"
                className="flex-1 text-sm font-medium gap-1.5 sm:gap-2 justify-center py-2"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpen(product)
                }}
              >
                <ShoppingCart className="w-4 h-4" />
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
    // Extract section from hash if present
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.substring(1)
      if (hash && categoryData?.subcategories[hash as keyof typeof categoryData.subcategories]) {
        setSelectedSection(hash)
      }
    }
  }, [categoryData])

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
    // Map of category slugs to their subcategories in order
    const subcategoryMaps: Record<string, string[]> = {
      'shirts': ['gentle', 'checked', 'textured', 'denim'],
      'tees': ['plain', 'graphic', 'collared', 'sporty'],
      'coats': ['sweater', 'hoodie', 'coat', 'jacket'],
      'pants-and-shorts': ['gentle', 'denim', 'cargo', 'sporty'],
      'footwear': ['gentle', 'sneakers', 'sandals', 'boots'],
      'accessories': ['rings-necklaces', 'shades-glasses', 'bracelets-watches', 'decor']
    }
    
    const subcategories = subcategoryMaps[categorySlug] || []
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
              value={selectedSection}
              onSelect={(id) => scrollToSection(id)}
              hideIndicatorUntilSelected
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
                <h3 className="text-2xl sm:text-3xl font-bold text-primary-800 dark:text-primary-100 mb-3">
                  No Products Available...Check later
                </h3>
                <p className="text-sm sm:text-base text-neutral-700 dark:text-primary-300 mb-6">
                  There are no active products in this section right now.
                </p>
                <Button href="/sections/shop#our-products" variant="default" size="md" className="inline-flex items-center justify-center">
                  Check Other Products
                </Button>
              </div>
            ) : (
            <div className="grid gap-4 md:gap-6 lg:gap-8 justify-items-center [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
              {visibleProducts.map((product: Product, index: number) => (
                <ProductGridCard
                  key={product.id}
                  product={product}
                  index={index}
                  onOpen={openProductModal}
                />
              ))}
            </div>
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
  const thumbnailRef = useRef<HTMLDivElement>(null)

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

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbnailRef.current) {
      const scrollAmount = 200
      thumbnailRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
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
      className="fixed inset-0 bg-black/55 dark:bg-black/85 z-50 flex items-center justify-center p-3 sm:p-4"
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
        .thumbnail-row::-webkit-scrollbar {
          height: 4px;
          border-radius: 9999px;
        }
        .thumbnail-row::-webkit-scrollbar-thumb {
          background: rgba(111, 78, 55, 0.3);
          border-radius: 9999px;
          border: none;
        }
        .thumbnail-row::-webkit-scrollbar-track {
          background: rgba(111, 78, 55, 0.1);
          border-radius: 9999px;
        }
        .dark .thumbnail-row::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.25);
        }
        .dark .thumbnail-row::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
      <div
        className="hero-glass-frame relative w-full max-w-md sm:max-w-3xl md:max-w-5xl backdrop-blur-md bg-white/30 dark:bg-neutral-900/25 dark:border-neutral-600"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-y-auto max-h-[70vh] sm:max-h-[80vh] md:max-h-[85vh] modal-scroll border border-neutral-200 dark:border-neutral-700"
      >
        {/* Close Button */}
        <ModalCloseButton onClose={onClose} className="absolute top-2 right-2 z-20 flex-shrink-0" aria-label="Close modal" />

        <div className="flex flex-col md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-5 sm:gap-6 md:gap-10 pt-10 sm:pt-8 md:pt-6 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
          {/* Image Gallery */}
          <div className="flex-shrink-0 flex flex-col space-y-4">
            <div className="relative h-72 sm:h-80 md:h-[24rem] bg-neutral-100 dark:bg-primary-900/20 rounded-lg overflow-hidden group">
              <SafeImage
                src={product.images[currentImageIndex]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
                priority
              />
              {product.images.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isFullscreen ? closeFullscreen : openFullscreen}
                  className="absolute top-4 right-4 p-2 text-neutral-700 dark:text-white/80 hover:text-neutral-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-all bg-white/80 dark:bg-black/40 rounded-lg"
                  aria-label="Fullscreen"
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </motion.button>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="relative pt-2 sm:pt-2 overflow-visible">
                {product.images.length > 4 && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => scrollThumbnails('left')}
                      className="p-1 text-neutral-850/80 dark:text-white/80 hover:text-neutral-850 dark:hover:text-white transition-all duration-200"
                    >
                      <span className="text-lg font-medium inline-block">⟸</span>
                    </motion.button>
                  </div>
                )}
                <div
                  ref={thumbnailRef}
                  className="thumbnail-row flex items-center justify-start gap-2 md:gap-3 overflow-x-auto scroll-smooth py-3 pl-4 pr-4 md:pl-0 md:pr-0"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 md:h-[5.5rem] md:w-[5.5rem] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        currentImageIndex === index ? 'border-primary-600 dark:border-primary-500 scale-105' : 'border-transparent hover:border-primary-400 dark:hover:border-primary-300'
                      }`}
                    >
                      <SafeImage
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        width={88}
                        height={88}
                        className="w-full h-full object-cover"
                        sizes="88px"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
                {product.images.length > 4 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => scrollThumbnails('right')}
                      className="p-1 text-neutral-850/80 dark:text-white/80 hover:text-neutral-850 dark:hover:text-white transition-all duration-200"
                    >
                      <span className="text-lg font-medium inline-block">⟹</span>
                    </motion.button>
                  </div>
                )}
              </div>
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
      </motion.div>
      </div>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[60] flex items-center justify-center p-4"
            onClick={closeFullscreen}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation()
                closeFullscreen()
              }}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-all duration-200 z-10"
            >
              <Minimize className="w-6 h-6" />
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
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
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

