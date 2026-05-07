'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ShoppingCart, Sparkles, CircleSlash } from 'lucide-react'
import SafeImage from '@/components/common/SafeImage'
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
  const [isLoading, setIsLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      setIsLoading(true)
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
      } finally {
        setIsLoading(false)
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
    <section className="relative overflow-hidden px-4 pt-20 pb-0 sm:pb-0">
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
            Sample products from our 6 categories. Add directly or click to view them all!
          </p>
        </motion.div>

        {isLoading ? (
          <SkeletonFeaturedCollections />
        ) : featuredProducts.length > 0 ? (
          <HorizontalScrollAffordance
            showEdgeFades={false}
            syncScrollEdgeLines
            hideScrollbar
            className="mt-10 mb-6 max-w-6xl mx-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:mb-7"
            scrollClassName="pt-6 pb-8"
            scrollAriaLabel="Featured collections"
          >
            <div className="mx-auto flex w-max min-w-full flex-row justify-center gap-2.5 px-2.5 sm:gap-3 sm:px-5 md:gap-4 lg:gap-5">
            {featuredProducts.map((item, index) => {
              const { product, categorySlug } = item
              const isAdding = addingToCart === product.id
              const isInCart = addedToCart.has(product.id) || CartManager.isProductInCart(product.id)
              const hasDiscount = Boolean(product.original_price && product.original_price > product.price_ugx)

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative flex h-full w-[min(180px,calc(100vw-2.25rem))] flex-shrink-0 flex-col sm:w-[min(204px,calc((min(72rem,100vw)-6.5rem)/2))] md:w-[min(220px,calc((min(72rem,100vw)-9rem)/3))]"
                >
                  <div className="hero-glass-frame relative h-full w-full backdrop-blur-md transition-shadow duration-300 group-hover:shadow-xl">
                    <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0" aria-hidden />
                    <div className="flex h-full min-h-0 flex-1 flex-col gap-1.5 overflow-hidden rounded-md border border-primary-500/30 bg-primary-800/30 p-1.5 sm:gap-1.5 sm:p-2">
                      <Link href={`/products/${categorySlug}`} className="focus-ring-none block w-full shrink-0">
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
                      </Link>

                      <div className="flex min-h-0 flex-1 flex-col px-0.5 pb-0.5 pt-0 text-center sm:px-1">
                        <Link href={`/products/${categorySlug}`} className="focus-ring-none">
                          <h3 className="mb-px line-clamp-2 text-[11px] font-bold leading-snug text-neutral-850 dark:text-primary-50 sm:text-xs">
                            {product.name}
                          </h3>
                        </Link>

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

                        <div className="mt-0.5 flex w-full flex-col gap-1">
                          <div
                            className={
                              product.stock_qty === 0
                                ? 'pointer-events-none opacity-50'
                                : isInCart
                                  ? 'opacity-50'
                                  : ''
                            }
                          >
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAddToCart(product)}
                              disabled={isAdding || isInCart || product.stock_qty === 0}
                              className={`w-full justify-center gap-1 py-1 text-[11px] font-medium sm:gap-1 sm:py-1.5 sm:text-xs${isInCart ? ' disabled:cursor-pointer' : ''}`}
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
                                <ShoppingCart className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
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
                          </div>

                          <Button
                            href={`/products/${categorySlug}`}
                            variant="default"
                            size="sm"
                            className="w-full justify-center gap-1 py-1 text-[11px] font-medium sm:gap-1 sm:py-1.5 sm:text-xs"
                            aria-label={`View ${item.categoryName} collection`}
                          >
                            <span>View</span>
                            <span aria-hidden className="translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5">
                              ⟹
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
            </div>
          </HorizontalScrollAffordance>
        ) : (
          <div className="mt-10 mb-6 max-w-6xl mx-auto text-center sm:mb-7">
            <p className="text-base text-primary-700 dark:text-primary-300">No featured collections right now.</p>
          </div>
        )}
      </div>
    </section>
  )
}


