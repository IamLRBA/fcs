'use client'

import { useState, useEffect, useLayoutEffect, useCallback, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ShoppingCart, X, Maximize2, Minimize, Quote, CircleSlash } from 'lucide-react'
import { CartManager, buildCartItemFromProduct } from '@/lib/cart'
import { getVariantStock, isMultiInventory } from '@/lib/inventory'
import type { InventoryModeClient, ProductVariantStock } from '@/lib/catalog/types'
import InventoryChips from '@/components/product/InventoryChips'
import ProductVariantPicker from '@/components/product/ProductVariantPicker'
import Button from '@/components/ui/Button'
import ModalCloseButton from '@/components/ui/ModalCloseButton'
import ProductDescriptionDisclosure from '@/components/ui/ProductDescriptionDisclosure'
import { AuthManager } from '@/lib/auth'
import SafeImage from '@/components/common/SafeImage'
import SegmentedPillNav from '@/components/ui/SegmentedPillNav'
import HorizontalScrollAffordance from '@/components/ui/HorizontalScrollAffordance'
import { CATEGORY_SUBCATEGORY_SLUGS } from '@/lib/catalog/category-subcategories'
import { useCategoryDeepLink } from '@/lib/catalog/use-category-deep-link'
import { SLIDER_SYNC_EDGE_LINE_CLASS } from '@/lib/constants/slider-edge'
import { featuredProductCardLayout } from '@/lib/product-card-layout'
import ScrollScale from '@/components/motion/ScrollScale'

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
  inventory_mode?: InventoryModeClient
  variants?: ProductVariantStock[]
  isActive?: boolean
}

const SUBCATEGORY_DISPLAY_MAP: Record<string, string> = {
  'rings-necklaces': 'Headwear',
  'shades-glasses': 'Eyewear',
  'bracelets-watches': 'Wristwear',
  decor: 'More',
}

const formatSectionLabel = (section: string) =>
  SUBCATEGORY_DISPLAY_MAP[section] ??
  section
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

function SubcategoryThumb({ paths, alt }: { paths: string[]; alt: string }) {
  const [idx, setIdx] = useState(0)
  const safeIdx = Math.min(idx, Math.max(0, paths.length - 1))
  const src = paths[safeIdx] ?? '/assets/images/placeholder.jpg'
  return (
    <SafeImage
      src={src}
      alt={alt}
      fill
      unoptimized
      className="w-full h-full object-cover rounded-2xl"
      sizes="(max-width: 640px) 160px, 192px"
      loading="lazy"
      onError={() => setIdx((i) => (i < paths.length - 1 ? i + 1 : i))}
    />
  )
}

function getThumbPathVariants(folder: string, thumbIndex: number): string[] {
  const base = `/assets/images/products-sections/fashion/${folder}/thumb${thumbIndex}`
  return [`${base}.jpg`, `${base}.JPG`, `${base}.jpeg`, `${base}.png`, `${base}.webp`]
}

const ProductGridCard = memo(function ProductGridCard({
  product,
  index,
  onOpen,
  accentBottomLeft = true,
  highlighted = false,
}: {
  product: Product
  index: number
  onOpen: (p: Product) => void
  accentBottomLeft?: boolean
  highlighted?: boolean
}) {
  const multi = isMultiInventory(product.inventory_mode ?? 'unique')
  const cardLayout = featuredProductCardLayout(accentBottomLeft ? 'bottom-left' : 'none', {
    contentSized: true,
  })
  const [isInCart, setIsInCart] = useState(() =>
    multi ? false : CartManager.isProductInCart(product.id)
  )
  useEffect(() => {
    const sync = () => {
      if (multi) {
        setIsInCart(false)
        return
      }
      setIsInCart(CartManager.isProductInCart(product.id))
    }
    sync()
    window.addEventListener('cartUpdated', sync)
    return () => window.removeEventListener('cartUpdated', sync)
  }, [product.id])

  const hasDiscount = Boolean(product.original_price && product.original_price > product.price_ugx)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      data-product-id={product.id}
      className={`group relative flex w-full flex-col transition-all duration-300 cursor-pointer rounded-lg ${
        highlighted ? 'ring-2 ring-accent-500 shadow-lg shadow-accent-500/25' : ''
      }`}
      onClick={() => onOpen(product)}
    >
      <div
        className={`hero-glass-frame relative w-full backdrop-blur-md transition-shadow duration-300 group-hover:shadow-xl${cardLayout.glassFrameClass}`}
      >
        <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0" aria-hidden />
        <div
          className={`glass-inner-panel flex flex-col gap-1.5 border border-primary-500/30 p-1.5 sm:gap-1.5 sm:p-2${cardLayout.innerPanelRoundedClass}`}
        >
          <div className="glass-inner-well relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden rounded-lg">
            <SafeImage
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 180px, 220px"
              loading="lazy"
            />
            {hasDiscount && (
              <div className="absolute left-1.5 top-1.5 z-30 rounded-full bg-accent-500 px-1.5 py-0.5 text-[10px] font-bold text-white sm:text-xs">
                {Math.round(((product.original_price! - product.price_ugx) / product.original_price!) * 100)}% OFF
              </div>
            )}
            {isInCart && (
              <div
                className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-black/55"
                aria-hidden
              >
                <CircleSlash className="h-9 w-9 text-white drop-shadow-lg sm:h-11 sm:w-11" strokeWidth={2} />
              </div>
            )}
          </div>

          <div className={cardLayout.detailsWrapClass}>
            <div className="flex w-full items-center gap-1 sm:gap-1.5">
              <Button
                variant="default"
                size="sm"
                className="shrink-0 justify-center gap-0.5 px-1.5 py-px text-[9px] font-medium leading-tight sm:gap-1 sm:px-2 sm:py-0.5 sm:text-[10px] md:px-2.5 md:py-1 md:text-[11px] lg:px-2.5 lg:py-1 lg:text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpen(product)
                }}
                aria-label={`View ${product.name}`}
              >
                <ShoppingCart className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />
                <span>View</span>
              </Button>
              <p className="min-w-0 flex-1 line-clamp-1 text-right text-[10px] leading-tight text-primary-700 dark:text-primary-400 sm:text-xs">
                {product.brand}
              </p>
            </div>
            <h3 className="-mt-0.5 mb-px w-full self-stretch text-right text-[11px] font-bold leading-snug text-neutral-850 dark:text-primary-50 sm:text-xs">
              {product.name}
            </h3>
            <div className={cardLayout.priceRowClass}>
              <span className="text-[11px] font-bold text-primary-600 dark:text-primary-300 sm:text-xs">
                UGX {product.price_ugx.toLocaleString()}
              </span>
              {product.original_price && (
                <span className="text-[10px] leading-none text-neutral-600 line-through dark:text-neutral-400 sm:text-[11px]">
                  UGX {product.original_price.toLocaleString()}
                </span>
              )}
            </div>
            <InventoryChips
              sizes={product.sizes}
              colors={product.colors}
              inventory_mode={product.inventory_mode}
              align={cardLayout.inventoryChipsAlign}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
})

function ProductSectionCards({
  section,
  visibleProducts,
  openProductModal,
  highlightProductId,
}: {
  section: string
  visibleProducts: Product[]
  openProductModal: (p: Product) => void
  highlightProductId?: string | null
}) {
  const innerRef = useRef<HTMLDivElement>(null)
  /** 'center' = few cards fit in row (center them); 'scroll' = horizontal strip */
  const [rowMode, setRowMode] = useState<'center' | 'scroll'>('center')

  useLayoutEffect(() => {
    const inner = innerRef.current
    if (!inner) return
    /** Skip display:contents wrappers so we measure the real overflow-x container */
    let scrollport: HTMLElement | null = inner.parentElement
    while (scrollport) {
      const ox = getComputedStyle(scrollport).overflowX
      if (ox === 'auto' || ox === 'scroll') break
      scrollport = scrollport.parentElement
    }
    if (!scrollport) return

    const measure = () => {
      /** Same as mobile: real scroll width (incl. padding) vs viewport — manual child sum missed padding and misclassified desktop rows. */
      const overflow = inner.scrollWidth > scrollport.clientWidth + 2
      setRowMode(overflow ? 'scroll' : 'center')
    }

    measure()
    const ro = new ResizeObserver(() => requestAnimationFrame(measure))
    ro.observe(inner)
    ro.observe(scrollport)
    scrollport.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    const mql = window.matchMedia('(min-width: 768px)')
    mql.addEventListener('change', measure)
    return () => {
      ro.disconnect()
      scrollport.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
      mql.removeEventListener('change', measure)
    }
  }, [visibleProducts])

  const label = section.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const innerClass = `flex min-h-[1px] flex-row items-start gap-2.5 px-2.5 sm:gap-3 sm:px-5 md:gap-4 lg:gap-5 ${
    rowMode === 'center'
      ? 'w-full min-w-0 justify-center md:w-max md:shrink-0 md:justify-start'
      : 'w-max min-w-full justify-start'
  }`

  /** Desktop only: flex wrapper centers the short row; mobile uses contents (no layout change vs direct child). */
  const centerWrapClass =
    rowMode === 'center'
      ? 'contents md:flex md:w-full md:min-w-0 md:justify-center'
      : 'contents'

  return (
    <div data-section={section}>
    <HorizontalScrollAffordance
      showEdgeFades={false}
      syncScrollEdgeLines
      syncScrollEdgeLineClassName={SLIDER_SYNC_EDGE_LINE_CLASS}
      hideScrollbar
      keyboardFocusable={false}
      className="mx-auto mb-8 w-full max-w-6xl -mx-4 px-4 sm:mx-auto sm:mb-10 sm:px-0 md:mb-12"
      scrollClassName="pt-6 pb-8"
      scrollAriaLabel={`${label} products`}
    >
      <div className={centerWrapClass}>
        <div ref={innerRef} className={innerClass}>
          {visibleProducts.map((product: Product, index: number) => (
            <div
              key={product.id}
              className="w-[min(180px,calc(100vw-2.25rem))] flex-shrink-0 sm:w-[min(204px,calc((min(72rem,100vw)-6.5rem)/2))] md:w-[min(220px,calc((min(72rem,100vw)-9rem)/3))]"
            >
              <ProductGridCard
                product={product}
                index={index}
                onOpen={openProductModal}
                accentBottomLeft
                highlighted={highlightProductId === product.id}
              />
            </div>
          ))}
        </div>
      </div>
    </HorizontalScrollAffordance>
    </div>
  )
}

export default function ProductCategoryPage() {
  const params = useParams()
  const category = params.category as string
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [catalog, setCatalog] = useState<any>({ products: {} })
  const [loading, setLoading] = useState(true)
  const [showBackButton, setShowBackButton] = useState(true)
  const quickViewFetchGen = useRef(0)

  const categoryData = catalog.products?.[category]
  const sectionKeys = categoryData ? Object.keys(categoryData.subcategories) : []

  const { selectedSection, highlightProductId, scrollToSection } = useCategoryDeepLink({
    loading,
    categoryKey: category,
    sectionKeys,
    productScrollDelay: 450,
  })

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

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setShowBackButton(scrollTop < 100)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const openProductModal = useCallback(async (product: Product) => {
    const gen = ++quickViewFetchGen.current
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.id)}`, { cache: 'no-store' })
      if (gen !== quickViewFetchGen.current) return
      if (res.ok) {
        const full = (await res.json()) as Product
        setSelectedProduct(full)
      } else {
        setSelectedProduct(product)
      }
    } catch {
      if (gen !== quickViewFetchGen.current) return
      setSelectedProduct(product)
    }
    AuthManager.addViewedItem(product.id)
  }, [])

  const closeProductModal = useCallback(() => {
    setSelectedProduct(null)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-unified relative overflow-hidden pt-20">
        <section className="relative text-center pt-16 pb-12 md:pt-12 md:pb-20 px-4">
          <div className="relative max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-6">
              <div className="hero-glass-frame hero-glass-frame-compact category-hero-br-accent relative flex-shrink-0 backdrop-blur-md">
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                <div className="glass-inner-panel border border-primary-500/30 dark:border-primary-500/40 overflow-hidden">
                  <div className="skeleton w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40" />
                </div>
              </div>
              <div className="skeleton h-14 w-64 md:w-96 rounded-xl" />
            </div>
            <div className="skeleton h-12 w-full max-w-2xl mx-auto rounded-xl mb-8" />
            <div className="flex justify-center gap-3 flex-wrap">
              <div className="skeleton h-10 w-28 rounded-full" />
              <div className="skeleton h-10 w-28 rounded-full" />
              <div className="skeleton h-10 w-28 rounded-full" />
              <div className="skeleton h-10 w-28 rounded-full" />
            </div>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="flex flex-wrap justify-center gap-4 md:gap-5">
            <div className="skeleton w-[min(180px,calc(100vw-2.25rem))] sm:w-[204px] md:w-[220px] h-[340px] rounded-xl" />
            <div className="skeleton w-[min(180px,calc(100vw-2.25rem))] sm:w-[204px] md:w-[220px] h-[340px] rounded-xl" />
            <div className="skeleton w-[min(180px,calc(100vw-2.25rem))] sm:w-[204px] md:w-[220px] h-[340px] rounded-xl" />
          </div>
        </div>
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
    label: formatSectionLabel(section),
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
    if (categorySlug === 'pants-and-shorts' && sectionSlug === 'gentle') {
      return '/assets/images/products-sections/fashion/pants-and-shorts/thumb1.jpg'
    }
    if (categorySlug === 'accessories' && sectionSlug === 'rings-necklaces') {
      return '/assets/images/products-sections/fashion/accessories/thumb1.jpg'
    }

    const subcategories = [...(CATEGORY_SUBCATEGORY_SLUGS[categorySlug] ?? [])]
    const thumbIndex = subcategories.indexOf(sectionSlug) + 1
    
    if (thumbIndex > 0) {
      return getThumbPathVariants(categorySlug, thumbIndex)[0]
    }
    
    return '/assets/images/placeholder.jpg'
  }

  const getSubcategoryImageCandidates = (categorySlug: string, sectionSlug: string): string[] => {
    if (categorySlug === 'pants-and-shorts' && sectionSlug === 'gentle') {
      const base = '/assets/images/products-sections/fashion/pants-and-shorts/thumb1'
      const gentlePaths = [
        `${base}.jpg`,
        `${base}.JPG`,
        `${base}.jpeg`,
        `${base}.png`,
        `${base}.webp`,
        ...getThumbPathVariants('pants-and-shorts', 1),
        ...getThumbPathVariants('bottoms', 1),
        ...getThumbPathVariants('pants', 1),
      ]
      const unique: string[] = []
      for (const p of gentlePaths) {
        if (!unique.includes(p)) unique.push(p)
      }
      return unique
    }
    if (categorySlug === 'accessories' && sectionSlug === 'rings-necklaces') {
      return ['/assets/images/products-sections/fashion/accessories/thumb1.jpg']
    }

    const subcategories = [...(CATEGORY_SUBCATEGORY_SLUGS[categorySlug] ?? [])]
    const thumbIndex = subcategories.indexOf(sectionSlug) + 1
    const paths = thumbIndex > 0 ? [...getThumbPathVariants(categorySlug, thumbIndex)] : [getSubcategoryImage(categorySlug, sectionSlug)]
    if (categorySlug === 'pants-and-shorts') {
      const normalized = thumbIndex > 0 ? thumbIndex : (sections.indexOf(sectionSlug) % 4) + 1
      paths.push(...getThumbPathVariants('bottoms', normalized), ...getThumbPathVariants('pants', normalized))
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
        text: 'Accessories are like vitamins to fashion, they enhance the outfit.',
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
        <Link href="/sections/shop#our-catalogue" className="focus-ring-none inline-flex items-center gap-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 transition-colors duration-300">
          <span className="btn-unified-circle flex-shrink-0">⟸</span>
          <span className="text-sm font-medium">Back to Shop</span>
        </Link>
      </motion.div>

      {/* Hero Section */}
      <ScrollScale as="section" variant="centerPeak" intensity="emphasis" className="relative text-center pt-16 pb-12 md:pt-12 md:pb-20 px-4 overflow-hidden">
        <div className="relative max-w-6xl mx-auto">
          {/* Main Product Image and Title */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-1 md:mb-6"
          >
            {/* Main Product Image */}
            <div className="hero-glass-frame hero-glass-frame-compact category-hero-br-accent relative flex-shrink-0 backdrop-blur-md">
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <div className="glass-inner-panel border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 overflow-hidden shrink-0 mx-auto">
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
            className="w-full max-w-4xl mx-auto px-1 overflow-x-auto scrollbar-hide"
          >
            <SegmentedPillNav
              items={sectionNavItems}
              value={selectedSection ?? sections[0] ?? null}
              onSelect={(id) => scrollToSection(id)}
              className="focus-ring-none min-w-max"
            />
          </motion.div>
        </div>
      </ScrollScale>

      {/* Products Grid by Section */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {productsBySection.map(([section, products]) => {
          const visibleProducts = products.filter((product: any) => product.isActive !== false)
          return (
          <ScrollScale
            as="section"
            key={section}
            id={section}
            variant="centerPeak"
            intensity="subtle"
            className="mb-32 scroll-mt-24 md:scroll-mt-28"
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
              <div className="glass-inner-panel rounded-2xl border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shrink-0 mx-auto">
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
            </div>
            </motion.div>
            
            <h2 className="text-4xl font-bold text-center mb-12 capitalize">
              {formatSectionLabel(section)}
            </h2>
            
            {visibleProducts.length === 0 ? (
              <div className="glass-inner-panel mx-auto max-w-xl rounded-2xl border border-primary-500/20 p-6 text-center dark:border-primary-400/30 sm:p-8">
                <p className="text-xl sm:text-2xl font-semibold text-primary-800 dark:text-primary-100">
                  Products Not Available
                </p>
                <div className="hero-cta-buttons flex justify-center mt-6">
                  <Button
                    href="/sections/shop#our-catalogue"
                    variant="default"
                    size="md"
                    className="inline-flex items-center justify-center"
                  >
                    Check Other Products
                  </Button>
                </div>
              </div>
            ) : (
              <ProductSectionCards
                section={section}
                visibleProducts={visibleProducts}
                openProductModal={openProductModal}
                highlightProductId={highlightProductId}
              />
            )}
          </ScrollScale>
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
  const [cartQty, setCartQty] = useState(1)

  const multi = isMultiInventory(product.inventory_mode ?? 'unique')
  const variants = product.variants ?? []
  const initialSize = product.sizes?.[0] ?? ''
  const initialColor = product.colors?.[0] ?? ''
  const [selectedSize, setSelectedSize] = useState(initialSize)
  const [selectedColor, setSelectedColor] = useState(initialColor)

  const variantStock = multi
    ? getVariantStock(variants, selectedSize, selectedColor)
    : product.stock_qty

  useEffect(() => {
    const checkCartStatus = () => {
      if (multi) {
        const line = CartManager.getCartLineForProduct(product.id, selectedSize, selectedColor)
        setIsInCart(Boolean(line))
        if (line) setCartQty(line.quantity)
        return
      }
      setIsInCart(CartManager.isProductInCart(product.id))
    }

    checkCartStatus()
    window.addEventListener('cartUpdated', checkCartStatus)
    return () => window.removeEventListener('cartUpdated', checkCartStatus)
  }, [product.id, multi, selectedSize, selectedColor])

  useEffect(() => {
    setCartQty(1)
    setAddedToCart(false)
  }, [selectedSize, selectedColor])

  const addToCart = () => {
    if (!multi && (isInCart || addedToCart)) {
      alert('This unique piece is already in your cart.')
      return
    }
    if (multi && (!selectedSize || !selectedColor)) {
      alert('Please select a size and color.')
      return
    }
    if (variantStock <= 0) {
      alert('This option is out of stock.')
      return
    }

    setIsAddingToCart(true)

    const built = buildCartItemFromProduct(product, selectedSize, selectedColor)
    const cartItem = { ...built, quantity: multi ? Math.min(cartQty, variantStock) : 1 }

    let success = false
    try {
      success = CartManager.addToCart(cartItem)
    } catch (error) {
      console.error('Failed to add product to cart:', error)
      setIsAddingToCart(false)
      alert('Could not add this item right now. Please try again.')
      return
    }

    if (!success) {
      alert(
        multi
          ? 'Could not add — check quantity or this size/color may already be at the maximum in your cart.'
          : 'This item is already in your cart.'
      )
      setIsAddingToCart(false)
      if (!multi) setAddedToCart(true)
      return
    }

    setTimeout(() => {
      setIsAddingToCart(false)
      setAddedToCart(true)
    }, 300)
  }

  const outOfStock = multi ? variantStock <= 0 : product.stock_qty === 0
  const canAdd = !outOfStock && (!isInCart || multi)
  const showQtyStepper = multi && variantStock > 1 && !isInCart

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
          background: rgba(113, 113, 122, 0.35);
          border-radius: 9999px;
        }
        .modal-scroll::-webkit-scrollbar-track {
          background: rgba(113, 113, 122, 0.12);
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
        className="hero-glass-frame relative w-full max-w-md sm:max-w-3xl md:max-w-5xl backdrop-blur-md dark:border-neutral-600"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
        <ModalCloseButton onClose={onClose} className="absolute top-2 right-2 z-40 flex-shrink-0" aria-label="Close modal" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-inner-panel relative flex w-full max-h-[70vh] flex-col overflow-hidden rounded-bl-2xl rounded-br-none rounded-tl-2xl rounded-tr-none border border-neutral-200 shadow-2xl dark:border-neutral-700 sm:max-h-[80vh] md:max-h-[85vh]"
      >
        <div className="modal-scroll min-h-0 flex-1 overflow-y-auto pt-10 sm:pt-8 md:pt-6 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
        <div className="flex flex-col md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-5 sm:gap-6 md:gap-10">
          {/* Image Gallery */}
          <div className="flex-shrink-0 flex flex-col space-y-4">
            <div className="glass-inner-well relative mx-auto flex aspect-square w-full max-w-[28rem] items-center justify-center overflow-hidden rounded-lg group">
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
                syncScrollEdgeLineClassName={SLIDER_SYNC_EDGE_LINE_CLASS}
                hideScrollbar
                className="mx-auto w-full max-w-[28rem] pt-2"
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
                      className={`focus-ring-none glass-inner-well relative aspect-square w-14 flex-shrink-0 overflow-hidden rounded-xl border transition-all duration-200 sm:w-16 md:w-[4.75rem] ${
                        isActive
                          ? 'z-[1] border-2 border-primary-600 shadow-md dark:border-primary-400'
                          : 'border-neutral-300/90 hover:border-primary-400/70 dark:border-neutral-600 dark:hover:border-primary-500/60'
                      }`}
                    >
                      <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
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

              <ProductDescriptionDisclosure
                key={product.id}
                productKey={product.id}
                description={product.description ?? ''}
              />

              <ProductVariantPicker
                inventory_mode={product.inventory_mode}
                sizes={product.sizes ?? []}
                colors={product.colors ?? []}
                variants={variants}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onSizeChange={setSelectedSize}
                onColorChange={setSelectedColor}
              />

              {showQtyStepper && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-neutral-700 dark:text-primary-300">Quantity</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCartQty((q) => Math.max(1, q - 1))}
                      className="focus-ring-none flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-600"
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center font-semibold">{cartQty}</span>
                    <button
                      type="button"
                      onClick={() => setCartQty((q) => Math.min(variantStock, q + 1))}
                      disabled={cartQty >= variantStock}
                      className="focus-ring-none flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 disabled:opacity-40 dark:border-neutral-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <div className="pt-5 mt-5 border-t border-neutral-200 dark:border-primary-600/40">
              <div
                className={`relative w-full ${!multi && (addedToCart || isInCart) ? 'group/modaladdcart' : ''}`}
              >
                <Button
                  variant="default"
                  size="md"
                  onClick={addToCart}
                  disabled={isAddingToCart || !canAdd || (!multi && (addedToCart || isInCart))}
                  className={`w-full justify-center gap-2 ${
                    isAddingToCart
                      ? 'opacity-60 cursor-wait pointer-events-none'
                      : !canAdd
                        ? 'opacity-60 cursor-not-allowed pointer-events-none'
                        : !multi && (addedToCart || isInCart)
                          ? 'opacity-60 disabled:cursor-pointer'
                          : ''
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>
                    {isAddingToCart
                      ? 'Adding...'
                      : outOfStock
                        ? 'Out of Stock'
                        : !multi && (addedToCart || isInCart)
                          ? 'Already in Cart'
                          : multi && isInCart
                            ? 'Update quantity in cart'
                            : 'Add to Cart'}
                  </span>
                </Button>
                {!multi && (addedToCart || isInCart) && (
                  <div
                    className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity duration-200 group-hover/modaladdcart:opacity-100 dark:bg-black/50"
                    aria-hidden
                  >
                    <CircleSlash className="h-7 w-7 text-white drop-shadow-md" strokeWidth={2} />
                  </div>
                )}
              </div>
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

