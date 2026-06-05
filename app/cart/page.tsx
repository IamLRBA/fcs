'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react'
import { CartManager } from '@/lib/cart'
import { isMultiInventory } from '@/lib/inventory'
import Button from '@/components/ui/Button'
import SafeImage from '@/components/common/SafeImage'
import ScrollScale from '@/components/motion/ScrollScale'

export default function CartPage() {
  const [cart, setCart] = useState(CartManager.getCart())
  const [isUpdating, setIsUpdating] = useState(false)
  const [showBackButton, setShowBackButton] = useState(true)

  useEffect(() => {
    const loadCart = () => setCart(CartManager.getCart())

    loadCart()

    const handleCartUpdate = () => loadCart()

    window.addEventListener('storage', handleCartUpdate)
    window.addEventListener('cartUpdated', handleCartUpdate)

    return () => {
      window.removeEventListener('storage', handleCartUpdate)
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setShowBackButton(scrollTop < 100)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const removeItem = (index: number) => {
    setIsUpdating(true)
    CartManager.removeFromCart(index)
    setCart(CartManager.getCart())
    setTimeout(() => setIsUpdating(false), 200)
  }

  const changeQty = (index: number, delta: number) => {
    const item = cart[index]
    if (!item || !isMultiInventory(item.inventory_mode ?? 'unique')) return
    setIsUpdating(true)
    CartManager.updateQuantity(index, item.quantity + delta)
    setCart(CartManager.getCart())
    setTimeout(() => setIsUpdating(false), 200)
  }

  const clearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      setIsUpdating(true)
      CartManager.clearCart()
      setCart([])
      setTimeout(() => setIsUpdating(false), 200)
    }
  }

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="min-h-screen bg-unified pt-24 pb-20">
      <motion.div
        animate={{ opacity: showBackButton ? 1 : 0, x: showBackButton ? 0 : -120, y: showBackButton ? 0 : -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-20 left-4 sm:left-8 z-50 pointer-events-none"
        style={{ pointerEvents: showBackButton ? 'auto' : 'none' }}
      >
        <Link
          href="/sections/shop"
          className="focus-ring-none inline-flex items-center gap-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 transition-colors duration-300"
        >
          <span className="btn-unified-circle flex-shrink-0">⟸</span>
          <span className="text-sm font-medium">Continue Shopping</span>
        </Link>
      </motion.div>
      <div className="max-w-7xl mx-auto px-4">
        <ScrollScale as="section" variant="centerPeak" intensity="subtle" className="mb-8 mt-10 sm:mt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-850 dark:text-primary-50 mb-2">
                Shopping Cart
              </h1>
              <p className="text-neutral-600 dark:text-primary-300">
                {cart.length === 0
                  ? 'Your cart is empty'
                  : `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart`}
              </p>
            </div>
            {cart.length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={clearCart}
                className="shrink-0 self-start sm:mt-2 !border-red-400 !text-red-400 hover:!bg-red-500/20 hover:!text-red-300 dark:!border-red-400 dark:!text-red-400 dark:hover:!bg-red-500/20 dark:hover:!text-red-300"
              >
                Clear Cart
              </Button>
            )}
          </div>
        </motion.div>
        </ScrollScale>

        <ScrollScale as="section" variant="centerPeak" intensity="subtle">
        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <ShoppingCart className="w-24 h-24 mx-auto text-primary-400/70 dark:text-primary-500/30 mb-6" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-primary-50 mb-4">Your cart is empty</h2>
            <p className="text-neutral-600 dark:text-primary-400 mb-8">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <div className="hero-cta-buttons flex justify-center">
              <Button href="/sections/shop" variant="default" size="md" className="inline-flex items-center justify-center">
                Start Shopping
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="hero-glass-frame relative backdrop-blur-md"
              >
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                <div className="glass-inner-panel relative overflow-hidden rounded-xl border border-neutral-200 shadow-xl dark:border-primary-500/30 dark:shadow-xl">
                  {cart.map((item, index) => {
                    const multi = isMultiInventory(item.inventory_mode ?? 'unique')
                    const canInc = CartManager.canIncreaseQuantity(index)
                    return (
                      <div key={`${item.id}-${index}`}>
                        <div className="flex flex-col gap-4 p-6 sm:flex-row">
                          <div className="glass-inner-well relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-lg sm:mx-0 sm:h-32 sm:w-32">
                            <SafeImage
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 639px) 112px, 128px"
                              loading="lazy"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="mb-2 line-clamp-2 text-xl font-bold text-neutral-900 dark:text-primary-50">
                              {item.name}
                            </h3>
                            <p className="mb-2 text-sm text-neutral-600 dark:text-primary-400">SKU: {item.sku}</p>
                            {item.size && (
                              <p className="mb-1 text-sm text-neutral-700 dark:text-primary-300">Size: {item.size}</p>
                            )}
                            {item.color && (
                              <p className="mb-3 text-sm text-neutral-700 dark:text-primary-300">Color: {item.color}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-3">
                              {multi && item.max_quantity && item.max_quantity > 1 ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => changeQty(index, -1)}
                                    disabled={isUpdating || item.quantity <= 1}
                                    className="focus-ring-none flex h-9 w-9 items-center justify-center rounded-lg border border-primary-300 dark:border-primary-500/40 disabled:opacity-40"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="min-w-[2rem] text-center text-sm font-semibold text-primary-800 dark:text-primary-200">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => changeQty(index, 1)}
                                    disabled={isUpdating || !canInc}
                                    className="focus-ring-none flex h-9 w-9 items-center justify-center rounded-lg border border-primary-300 dark:border-primary-500/40 disabled:opacity-40"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="glass-inner-well rounded-lg border border-primary-300 px-3 py-2 dark:border-primary-500/30">
                                  <span className="text-sm text-primary-700 dark:text-primary-300">
                                    {multi ? `Qty: ${item.quantity}` : 'Single unique piece'}
                                  </span>
                                </div>
                              )}

                              <Button
                                variant="default"
                                size="icon"
                                onClick={() => removeItem(index)}
                                disabled={isUpdating}
                                className="h-10 w-10 !border-red-400 !text-red-400 hover:!bg-red-500/20 hover:!text-red-300 disabled:opacity-50 dark:!border-red-400 dark:!text-red-400 dark:hover:!bg-red-500/20 dark:hover:!text-red-300"
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="mb-1 text-2xl font-bold text-primary-600 dark:text-primary-300">
                              UGX {(item.price * item.quantity).toLocaleString()}
                            </p>
                            {item.quantity > 1 && (
                              <p className="mt-1 text-xs text-neutral-600 dark:text-primary-300">
                                {item.quantity} × UGX {item.price.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        {index < cart.length - 1 ? (
                          <div
                            className="h-px w-full bg-gradient-to-r from-transparent via-neutral-300/70 to-transparent dark:from-transparent dark:via-white/[0.1] dark:to-transparent"
                            aria-hidden
                          />
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>

            <div className="md:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="sticky top-24"
              >
                <div className="hero-glass-frame relative backdrop-blur-lg">
                  <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
                  <div className="glass-inner-panel rounded-xl border border-neutral-200 p-6 shadow-xl dark:border-primary-500/30 dark:shadow-xl">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-primary-50 mb-6">Order Summary</h2>

                    <div className="space-y-4 pb-6 border-b border-neutral-200 dark:border-primary-600/50">
                      <div className="flex justify-between text-neutral-700 dark:text-primary-300">
                        <span>
                          Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                        </span>
                        <span className="font-medium">UGX {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-neutral-700 dark:text-primary-300">
                        <span>Delivery</span>
                        <span className="text-neutral-600 dark:text-primary-300">Calculated at checkout</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-6">
                      <span className="text-xl font-bold text-neutral-900 dark:text-primary-50">Total</span>
                      <span className="text-3xl font-bold text-primary-600 dark:text-primary-300">
                        UGX {subtotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="hero-cta-buttons space-y-3">
                      <Button href="/checkout" variant="filled" size="md" className="w-full justify-center">
                        Proceed to Checkout
                      </Button>
                      <Button href="/sections/shop" variant="default" size="md" className="w-full justify-center">
                        Continue Shopping
                      </Button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-primary-700/50">
                      <div className="flex items-start space-x-3 text-sm text-neutral-600 dark:text-primary-400">
                        <div className="flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-primary-600 dark:text-primary-300" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800 dark:text-primary-300 mb-1">Secure Checkout</p>
                          <p className="text-neutral-600 dark:text-neutral-300">
                            Pay on delivery available. Your information is safe and secure.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
        </ScrollScale>
      </div>
    </div>
  )
}
