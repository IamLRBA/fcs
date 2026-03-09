'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ShoppingCart, ArrowRight, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
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
    const loadFeaturedProducts = () => {
      try {
        const getProductsData = () => {
          return require('@/data/products.json')
        }
        
        const productsData = getProductsData()
        const categories = [
          { slug: 'shirts', name: 'Shirts' },
          { slug: 'tees', name: 'Tees' },
          { slug: 'coats', name: 'OuterWear' },
          { slug: 'pants-and-shorts', name: 'Bottoms' },
          { slug: 'footwear', name: 'FootWear' },
          { slug: 'accessories', name: 'Accessories' }
        ]

        const featured: FeaturedProduct[] = []

        categories.forEach(({ slug, name }) => {
          const categoryData = productsData.products[slug]
          if (categoryData && categoryData.subcategories) {
            const subcategories = Object.values(categoryData.subcategories)
            if (subcategories.length > 0) {
              const firstSubcategory = subcategories[0] as Product[]
              if (firstSubcategory && firstSubcategory.length > 0) {
                featured.push({
                  product: firstSubcategory[0],
                  categoryName: name,
                  categorySlug: slug
                })
              }
            }
          }
        })

        setFeaturedProducts(featured)
      } catch (error) {
        console.error('Error loading featured products:', error)
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

    const success = CartManager.addToCart(cartItem)
    if (!success) {
      alert('This product is already in your cart. Each product is a single unique piece.')
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
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 sm:gap-y-8 sm:gap-x-10 md:gap-8 lg:gap-15 max-w-6xl mx-auto px-8 sm:px-10 sm:justify-items-stretch">
            {featuredProducts.map((item, index) => {
              const { product, categoryName, categorySlug } = item
              const isAdding = addingToCart === product.id
              const isInCart = addedToCart.has(product.id) || CartManager.isProductInCart(product.id)
              const hasDiscount = product.original_price && product.original_price > product.price_ugx
              const isLeftAligned = index % 2 === 0

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
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  className={`group relative w-[280px] sm:min-w-0 sm:w-full h-full flex flex-col ${isLeftAligned ? 'justify-self-start sm:justify-self-stretch' : 'justify-self-end sm:justify-self-stretch'}`}
                >
                  {/* Outer glass frame (same style as hero image containers) */}
                  <div className="hero-glass-frame relative w-full h-full flex flex-col flex-1 min-h-0 backdrop-blur-lg group-hover:shadow-xl transition-shadow duration-300">
                    <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
                    <motion.div
                      className="relative z-10 flex-1 min-h-0 flex flex-col bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-neutral-800 dark:to-neutral-700 rounded-xl shadow-md transition-all duration-300 overflow-hidden border border-primary-500/30 dark:border-primary-500/40"
                  >

                    <Link href={`/products/${categorySlug}`} className="focus-ring-none">
                      <div className="relative h-40 sm:h-44 md:h-40 bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
                        <motion.img
                          src={product.images[0] || '/assets/images/placeholder.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.15 }}
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
                            className="absolute bottom-3 right-3 px-2 py-1 bg-accent-500 text-neutral-850 dark:text-white text-xs font-bold rounded-full shadow-lg"
                          >
                            {Math.round(((product.original_price! - product.price_ugx) / product.original_price!) * 100)}% OFF
                          </motion.div>
                        )}
                      </div>
                    </Link>

                    <div className="px-2 pt-1.5 pb-2 flex-1 flex flex-col relative z-10">
                      <Link href={`/products/${categorySlug}`} className="focus-ring-none">
                        <motion.div
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                          className="mb-0 text-center"
                        >
                          <h3 className="text-sm sm:text-sm font-bold text-neutral-850 dark:text-primary-50 mb-0 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-100 transition-colors leading-tight">
                            {product.name}
                          </h3>
                        </motion.div>
                      </Link>

                      <div className="mt-1.5 mb-1 sm:mb-1">
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + 0.6 }}
                          className="flex items-baseline justify-center space-x-1 flex-wrap"
                        >
                          <span className="text-base sm:text-sm font-bold text-neutral-800 dark:text-white dark:drop-shadow-sm group-hover:text-neutral-900 dark:group-hover:text-accent-50 transition-colors">
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
                        className={`mb-2 sm:mb-2 ${isInCart || product.stock_qty === 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                      >
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          disabled={isAdding || isInCart || product.stock_qty === 0}
                          className="w-full text-xs font-semibold justify-center gap-2 py-1.5 sm:py-1.5"
                        >
                          <motion.div
                            animate={isAdding ? { rotate: 360 } : {}}
                            transition={{ duration: 0.5, repeat: isAdding ? Infinity : 0 }}
                          >
                            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                          </motion.div>
                          <span>
                            {isAdding
                              ? 'Adding...'
                              : isInCart
                              ? 'In Cart'
                              : product.stock_qty === 0
                              ? 'Out of Stock'
                              : 'Add to Cart'}
                          </span>
                        </Button>
                      </motion.div>

                      <motion.div className="flex justify-center">
                        <Button
                          href={`/products/${categorySlug}`}
                          variant="default"
                          size="sm"
                          className="group/view-collection mt-1.5 sm:mt-1.5 text-xs font-semibold gap-1 px-3 sm:px-3 py-1.5 sm:py-1.5"
                        >
                          <span>View Collection</span>
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
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-primary-600 dark:text-primary-300">Loading featured collections...</p>
          </div>
        )}
      </div>
    </section>
  )
}


