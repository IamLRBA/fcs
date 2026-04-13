'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ShoppingCart, Sparkles, CircleSlash } from 'lucide-react'
import Button from '@/components/ui/Button'
import { SkeletonFeaturedCollections } from '@/components/ui/Skeleton'
import HorizontalScrollAffordance from '@/components/ui/HorizontalScrollAffordance'
import { CartManager, type CartItem } from '@/lib/cart'

interface Product {
  id: string
  name: string
  brand: string
  category: string
  section: string
  price_ugx: number
  original_price?: number
  sizes: string[]
  colors: string[]
  images: string[]
  description: string
  condition: string
  sku: string
  stock_qty: number
}

interface FeaturedProduct {
  product: Product
  categoryName: string
  categorySlug: string
}

export default function FeaturedCollections() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const res = await fetch('/api/products?featured=1')
        if (!res.ok) {
          setFeaturedProducts([])
          return
        }
        const data: FeaturedProduct[] = await res.json()
        setFeaturedProducts(data)
      } catch (error) {
        console.error('Error loading featured products:', error)
        setFeaturedProducts([])
      }
    }

    loadFeaturedProducts()
    
    const checkCartStatus = () => {
      const cart = CartManager.getCart()
      const cartProductIds = new Set(cart.map(item => item.productId))
      setAddedToCart(cartProductIds)
    }

    checkCartStatus()
    window.addEventListener('cartUpdated', checkCartStatus)
    return () => {
      window.removeEventListener('cartUpdated', checkCartStatus)
    }
  }, [])

  const handleAddToCart = (product: Product) => {
    if (addedToCart.has(product.id) || CartManager.isProductInCart(product.id)) {
      alert('This product is already in your cart. Each product is a single unique piece.')
      return
    }

    setAddingToCart(product.id)

    const productSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : ''
    const productColor = product.colors && product.colors.length > 0 ? product.colors[0] : ''

    const cartItem: CartItem = {
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price_ugx,
      size: productSize,
      color: productColor,
      quantity: 1,
      image: product.images[0] || '/assets/images/placeholder.jpg',
      sku: product.sku
    }

    let success = false
    try {
      success = CartManager.addToCart(cartItem)
    } catch (error) {
      console.error('Failed to add featured item to cart:', error)
      setAddingToCart(null)
      alert('Could not add this item right now. Please try again.')
      return
    }
    if (!success) {
      alert('This item is already in your cart, or storage is full.')
      setAddingToCart(null)
      return
    }

    setTimeout(() => {
      setAddingToCart(null)
      const updatedSet = new Set(addedToCart)
      updatedSet.add(product.id)
      setAddedToCart(updatedSet)
    }, 300)
  }

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-300 mb-4"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            <span className="text-sm font-semibold uppercase tracking-wider">Featured</span>
            <motion.div
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary-800 dark:text-primary-100 mb-4">
            Featured <span className="text-accent-600 dark:text-accent-400">Collections</span>
          </h2>
          <p className="text-xl text-primary-700 dark:text-primary-300 max-w-3xl mx-auto mb-6">
            Carefully curated selections. Each piece chosen for its unique story
          </p>
        </motion.div>

        {featuredProducts.length > 0 ? (
          <HorizontalScrollAffordance
            showEdgeFades={false}
            syncScrollEdgeLines
            hideScrollbar
            className="mt-10 mb-14 max-w-6xl mx-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:mb-16"
            scrollClassName="pt-6 pb-8"
            scrollAriaLabel="Featured collections"
          >
            <div className="mx-auto flex w-max min-w-full flex-row justify-center gap-2.5 px-2.5 sm:gap-3 sm:px-5 md:gap-4 lg:gap-5">
            {featuredProducts.map((item, index) => {
              const { product, categorySlug } = item
              const isAdding = addingToCart === product.id
              const isInCart = addedToCart.has(product.id) || CartManager.isProductInCart(product.id)
              const hasDiscount = product.original_price && product.original_price > product.price_ugx

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -4,
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  className="group relative flex h-full flex-shrink-0 flex-col w-[min(180px,calc(100vw-2.25rem))] sm:w-[min(204px,calc((min(72rem,100vw)-6.5rem)/2))] md:w-[min(220px,calc((min(72rem,100vw)-9rem)/3))]"
                >
                  {/* Outer glass frame (same style as hero image containers) */}
                  <div className="hero-glass-frame relative w-full h-full flex flex-col flex-1 min-h-0 backdrop-blur-lg group-hover:shadow-xl transition-shadow duration-300">
                    <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
                    <motion.div
                      className="relative z-10 flex-1 min-h-0 flex flex-col bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-neutral-800 dark:to-neutral-700 rounded-md shadow-md transition-all duration-300 overflow-hidden border border-primary-500/30 dark:border-primary-500/40"
                  >

                    <Link href={`/products/${categorySlug}`} className="focus-ring-none block w-full">
                      <div className="relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200">
                        <motion.img
                          src={product.images[0] || '/assets/images/placeholder.jpg'}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain"
                          whileHover={{ scale: 1.06 }}
                          transition={{ duration: 0.4 }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/assets/images/placeholder.jpg'
                          }}
                        />
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                        {hasDiscount && (
                          <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                            className="absolute bottom-1.5 right-1.5 z-30 px-1 py-0.5 bg-accent-500 text-white text-[9px] font-bold leading-none rounded-full shadow-lg sm:bottom-2 sm:right-2 sm:px-1.5 sm:text-[10px]"
                          >
                            {Math.round(((product.original_price! - product.price_ugx) / product.original_price!) * 100)}% OFF
                          </motion.div>
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
                    </Link>

                    <div className="flex flex-1 flex-col px-1 pt-0.5 pb-1 relative z-10 sm:px-1.5 sm:pt-1 sm:pb-1.5">
                      <Link href={`/products/${categorySlug}`} className="focus-ring-none">
                        <motion.div
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                          className="mb-0 text-center"
                        >
                          <h3 className="text-[11px] sm:text-xs font-bold text-neutral-850 dark:text-primary-50 mb-0 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-100 transition-colors leading-snug">
                            {product.name}
                          </h3>
                        </motion.div>
                      </Link>

                      <div className="mt-0.5 mb-px sm:mt-1 sm:mb-0.5">
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + 0.6 }}
                          className="flex items-baseline justify-center space-x-1 flex-wrap"
                        >
                          <span className="text-xs font-bold text-neutral-800 dark:text-white dark:drop-shadow-sm group-hover:text-neutral-900 dark:group-hover:text-accent-50 transition-colors sm:text-[13px]">
                            UGX {product.price_ugx.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-neutral-600 dark:text-primary-400 line-through group-hover:text-neutral-700 dark:group-hover:text-primary-300 transition-colors">
                              UGX {product.original_price!.toLocaleString()}
                            </span>
                          )}
                        </motion.div>
                      </div>

                      <motion.div
                        whileHover={!(isAdding || isInCart || product.stock_qty === 0) ? { scale: 1.02 } : undefined}
                        whileTap={!(isAdding || isInCart || product.stock_qty === 0) ? { scale: 0.98 } : undefined}
                        className={`mb-1 sm:mb-1.5 ${
                          product.stock_qty === 0
                            ? 'opacity-50 cursor-not-allowed pointer-events-none'
                            : isInCart
                              ? 'opacity-50 cursor-pointer'
                              : ''
                        }`}
                      >
                        <div className={`relative w-full ${isInCart ? 'group/cartadd' : ''}`}>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            disabled={isAdding || isInCart || product.stock_qty === 0}
                            className={`w-full justify-center gap-1 py-0.5 text-[10px] font-semibold sm:gap-1.5 sm:py-1 sm:text-[11px]${isInCart ? ' disabled:cursor-pointer' : ''}`}
                            aria-label={
                              isAdding
                                ? 'Adding to cart'
                                : isInCart
                                  ? 'Already in cart'
                                  : product.stock_qty === 0
                                    ? 'Out of stock'
                                    : 'Add to cart'
                            }
                          >
                            <motion.div
                              animate={isAdding ? { rotate: 360 } : {}}
                              transition={{ duration: 0.5, repeat: isAdding ? Infinity : 0 }}
                            >
                              <ShoppingCart className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </motion.div>
                            <span>
                              {isAdding
                                ? '…'
                                : isInCart
                                  ? 'Added'
                                  : product.stock_qty === 0
                                    ? 'Out'
                                    : 'Add'}
                            </span>
                          </Button>
                          {isInCart && (
                            <div
                              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity duration-200 group-hover/cartadd:opacity-100 dark:bg-black/50"
                              aria-hidden
                            >
                              <CircleSlash className="h-5 w-5 text-white drop-shadow-md sm:h-6 sm:w-6" strokeWidth={2} />
                            </div>
                          )}
                        </div>
                      </motion.div>

                      <motion.div className="flex justify-center">
                        <Button
                          href={`/products/${categorySlug}`}
                          variant="default"
                          size="sm"
                          className="group/view-collection mt-0.5 gap-0.5 px-2 py-0.5 text-[10px] font-semibold sm:mt-1 sm:gap-1 sm:px-2.5 sm:py-1 sm:text-[11px]"
                          aria-label={`View ${item.categoryName} collection`}
                        >
                          <span>View</span>
                          <motion.span
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="group-hover/view-collection:translate-x-1 transition-transform duration-200"
                          >
                            ⟹
                          </motion.span>
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                  </div>
                </motion.div>
              )
            })}
            </div>
          </HorizontalScrollAffordance>
        ) : (
          <SkeletonFeaturedCollections />
        )}
      </div>
    </section>
  )
}


