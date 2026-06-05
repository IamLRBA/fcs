'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ScrollScale from '@/components/motion/ScrollScale'
import Link from 'next/link'
import { ShoppingCart, Sparkles, CircleSlash, ExternalLink } from 'lucide-react'
import SafeImage from '@/components/common/SafeImage'
import Button from '@/components/ui/Button'
import { SkeletonFeaturedCollections } from '@/components/ui/Skeleton'
import HorizontalScrollAffordance from '@/components/ui/HorizontalScrollAffordance'
import { CartManager, buildCartItemFromProduct } from '@/lib/cart'
import { isMultiInventory } from '@/lib/inventory'
import type { InventoryModeClient } from '@/lib/catalog/types'
import InventoryChips from '@/components/product/InventoryChips'
import { featuredProductCardLayout } from '@/lib/product-card-layout'
import { buildProductCategoryHref } from '@/lib/catalog/product-deep-link'

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
  inventory_mode?: InventoryModeClient
}

interface FeaturedProduct {
  product: Product
  categoryName: string
  categorySlug: string
}

function FeaturedCollectionsRow({
  items,
  rowIndex,
  addingToCart,
  addedToCart,
  onAddToCart,
  isFirstRow,
}: {
  items: FeaturedProduct[]
  rowIndex: number
  addingToCart: string | null
  addedToCart: Set<string>
  onAddToCart: (product: Product) => void
  isFirstRow: boolean
}) {
  const reverseSlideDirection = rowIndex >= 2
  const cardAccent = rowIndex < 2 ? 'bottom-left' : 'bottom-right'
  const cardLayout = featuredProductCardLayout(cardAccent)

  return (
    <HorizontalScrollAffordance
      showEdgeFades={false}
      syncScrollEdgeLines
      hideScrollbar
      reverseSlideDirection={reverseSlideDirection}
      className={`max-w-6xl mx-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:mb-7 ${isFirstRow ? 'mt-10 mb-6' : 'mt-0 mb-6'}`}
      scrollClassName="pt-6 pb-8"
      scrollAriaLabel={`Featured collections row ${rowIndex + 1}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: rowIndex * 0.08 }}
        className="mx-auto flex w-max min-w-full flex-row justify-center gap-2.5 px-2.5 sm:gap-3 sm:px-5 md:gap-4 lg:gap-5"
      >
        {items.map((item, index) => {
          const { product, categorySlug } = item
          const isAdding = addingToCart === product.id
          const multi = isMultiInventory(product.inventory_mode ?? 'unique')
          const isInCart = !multi && (addedToCart.has(product.id) || CartManager.isProductInCart(product.id))
          const hasDiscount = Boolean(product.original_price && product.original_price > product.price_ugx)
          const productPageHref = buildProductCategoryHref(categorySlug, {
            section: product.section,
            productId: product.id,
          })

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative flex h-full w-[min(180px,calc(100vw-2.25rem))] flex-shrink-0 flex-col sm:w-[min(204px,calc((min(72rem,100vw)-6.5rem)/2))] md:w-[min(220px,calc((min(72rem,100vw)-9rem)/3))]"
            >
              <div
                className={`hero-glass-frame relative h-full w-full backdrop-blur-md transition-shadow duration-300 group-hover:shadow-xl${cardLayout.glassFrameClass}`}
              >
                <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0" aria-hidden />
                <div
                  className={`glass-inner-panel flex h-full min-h-0 flex-1 flex-col gap-1.5 overflow-hidden border border-primary-500/30 p-1.5 sm:gap-1.5 sm:p-2${cardLayout.innerPanelRoundedClass}`}
                >
                  <Link href={productPageHref} className="focus-ring-none block w-full shrink-0">
                    <div className="glass-inner-well relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg">
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

                  <div className={cardLayout.detailsWrapClass}>
                    <Link href={productPageHref} className="focus-ring-none">
                      <h3 className="mb-px line-clamp-2 text-[11px] font-bold leading-snug text-neutral-850 dark:text-primary-50 sm:text-xs">
                        {product.name}
                      </h3>
                    </Link>

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
                      className="mb-1"
                    />

                    <div className={cardLayout.actionWrapClass}>
                      {multi ? (
                        <Button
                          href={productPageHref}
                          variant="default"
                          size="sm"
                          className={cardLayout.multiBtnClass}
                        >
                          <span>Choose size & color</span>
                        </Button>
                      ) : (
                        <div
                          className={
                            cardLayout.accentActionWrapClass
                              ? `${cardLayout.accentActionWrapClass}${
                                  product.stock_qty === 0
                                    ? ' pointer-events-none opacity-50'
                                    : isInCart
                                      ? ' opacity-50'
                                      : ''
                                }`
                              : product.stock_qty === 0
                                ? 'pointer-events-none opacity-50'
                                : isInCart
                                  ? 'opacity-50'
                                  : ''
                          }
                        >
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onAddToCart(product)}
                            disabled={isAdding || isInCart || product.stock_qty === 0}
                            className={`${cardLayout.actionBtnClass}${isInCart ? ' disabled:cursor-pointer' : ''}`}
                          >
                            <motion.div
                              animate={isAdding ? { rotate: 360 } : {}}
                              transition={{ duration: 0.5, repeat: isAdding ? Infinity : 0 }}
                            >
                              <ShoppingCart className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                            </motion.div>
                            <span>
                              {isAdding ? '…' : isInCart ? 'Added' : product.stock_qty === 0 ? 'Out' : 'Add'}
                            </span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  href={productPageHref}
                  variant="circle"
                  size="sm"
                  className={cardLayout.collectionLinkBtnClass}
                  aria-label={`View ${item.categoryName} collection`}
                >
                  <ExternalLink
                    className="relative z-10 h-[1.05rem] w-[1.05rem] shrink-0 sm:h-5 sm:w-5"
                    strokeWidth={1}
                    aria-hidden
                  />
                </Button>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </HorizontalScrollAffordance>
  )
}

export default function FeaturedCollections() {
  const [featuredRows, setFeaturedRows] = useState<FeaturedProduct[][]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/products?featured=1', { cache: 'no-store' })
        if (!res.ok) {
          setFeaturedRows([])
          return
        }
        const data: { rows?: FeaturedProduct[][] } = await res.json()
        setFeaturedRows(Array.isArray(data.rows) ? data.rows : [])
      } catch (error) {
        console.error('Error loading featured products:', error)
        setFeaturedRows([])
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
    if (isMultiInventory(product.inventory_mode ?? 'unique')) return

    if (addedToCart.has(product.id) || CartManager.isProductInCart(product.id)) {
      alert('This unique piece is already in your cart.')
      return
    }

    setAddingToCart(product.id)

    const productSize = product.sizes?.[0] ?? ''
    const productColor = product.colors?.[0] ?? ''
    const cartItem = buildCartItemFromProduct(
      { ...product, inventory_mode: 'unique' },
      productSize,
      productColor
    )

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

  const hasFeatured = featuredRows.some((row) => row.length > 0)

  return (
    <section className="relative px-4 pt-20 pb-0 sm:pb-0">
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
            Sample products from our Cataloque.
          </p>
        </motion.div>

        {isLoading ? (
          <SkeletonFeaturedCollections />
        ) : hasFeatured ? (
          featuredRows.map((row, rowIndex) => (
            <ScrollScale
              key={rowIndex}
              as="div"
              variant="centerPeak"
              intensity="normal"
              className="relative"
            >
              <FeaturedCollectionsRow
                items={row}
                rowIndex={rowIndex}
                isFirstRow={rowIndex === 0}
                addingToCart={addingToCart}
                addedToCart={addedToCart}
                onAddToCart={handleAddToCart}
              />
            </ScrollScale>
          ))
        ) : (
          <motion.div className="mt-10 mb-6 max-w-6xl mx-auto text-center sm:mb-7">
            <p className="text-base text-primary-700 dark:text-primary-300">No featured collections right now.</p>
          </motion.div>
        )}
      </div>
    </section>
  )
}

