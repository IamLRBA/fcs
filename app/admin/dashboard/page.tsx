'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, DollarSign, ShoppingCart, BarChart3, LogOut } from 'lucide-react'
import { AuthManager } from '@/lib/auth'
import { ProductManager, type Product } from '@/lib/products'
import { OrderManager, type Order } from '@/lib/cart'

const categories = ['shirts', 'tees', 'coats', 'pants-and-shorts', 'footwear', 'accessories']

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [showBackButton, setShowBackButton] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!AuthManager.isAdmin()) {
      router.push('/admin/login')
      return
    }
    setIsAdmin(true)
    loadData()
  }, [router])

  const loadData = () => {
    setProducts(ProductManager.getAllProductsArray())
    setOrders(OrderManager.getOrders())
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setProductImages(prev => [...prev, base64String])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleLogout = () => {
    AuthManager.adminLogout()
    router.push('/')
  }

  const boughtProducts = ProductManager.getBoughtProducts()
  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalItemsSold: orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
    boughtProducts: boughtProducts.length
  }

  // Show/hide back button based on scroll position (run for all renders to keep hook order stable)
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      // Show button when at top (within 100px), hide when scrolled down
      setShowBackButton(scrollTop < 100)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-unified pt-24 pb-20">
      {!isAdmin ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-neutral-800 dark:text-neutral-100">Loading...</div>
        </div>
      ) : (
        <div className="container-custom mt-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
            <motion.div
              animate={{ opacity: showBackButton ? 1 : 0, y: showBackButton ? 0 : -20 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-none"
              style={{ pointerEvents: showBackButton ? 'auto' : 'none' }}
            >
              <Link href="/" className="focus-ring-none inline-flex items-center space-x-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 transition-colors duration-300">
                <span className="text-base font-medium">⟸</span>
                <span className="text-sm font-medium">Back to Home</span>
              </Link>
            </motion.div>
          </div>

          {/* Main container - semi-transparent like account page */}
          <div className="hero-glass-frame relative backdrop-blur-lg w-full rounded-2xl">
            <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
            <div className="relative z-10 bg-neutral-100/80 dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6 md:p-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-800 dark:text-primary-100 mb-6 sm:mb-8 text-center">Admin Dashboard</h1>

              {/* Stats - section with darker shades in light mode */}
              <div className="hero-glass-frame relative backdrop-blur-lg rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                <div className="relative z-10 p-3 sm:p-4">
                  <h2 className="text-lg sm:text-xl font-bold text-primary-800 dark:text-primary-100 mb-4 text-center">Overview</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 justify-items-center sm:justify-items-stretch">
              {/* Total Products */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-sm rounded-xl w-full max-w-xs sm:max-w-none text-center sm:text-left"
              >
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                <div className="relative z-10 bg-neutral-200/60 dark:bg-neutral-800 rounded-xl p-4 sm:p-6 shadow-lg border border-neutral-300/80 dark:border-neutral-700">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Total Products</p>
                      <p className="text-2xl sm:text-3xl font-bold text-primary-800 dark:text-primary-200">{stats.totalProducts}</p>
                    </div>
                    <Package className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  </div>
                </div>
              </motion.div>

              {/* Total Orders */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-sm rounded-xl w-full max-w-xs sm:max-w-none text-center sm:text-left"
              >
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                <div className="relative z-10 bg-neutral-300/50 dark:bg-neutral-800 rounded-xl p-4 sm:p-6 shadow-lg border border-neutral-300/80 dark:border-neutral-700">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Total Orders</p>
                      <p className="text-2xl sm:text-3xl font-bold text-primary-800 dark:text-primary-200">{stats.totalOrders}</p>
                    </div>
                    <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  </div>
                </div>
              </motion.div>

              {/* Total Revenue */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-sm rounded-xl w-full max-w-xs sm:max-w-none text-center sm:text-left"
              >
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                <div className="relative z-10 bg-neutral-200/70 dark:bg-neutral-800 rounded-xl p-4 sm:p-6 shadow-lg border border-neutral-300/80 dark:border-neutral-700">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Total Revenue</p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-800 dark:text-primary-200">
                        UGX {stats.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  </div>
                </div>
              </motion.div>

              {/* Items Sold */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-sm rounded-xl w-full max-w-xs sm:max-w-none text-center sm:text-left"
              >
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                <div className="relative z-10 bg-neutral-300/50 dark:bg-neutral-800 rounded-xl p-4 sm:p-6 shadow-lg border border-neutral-300/80 dark:border-neutral-700">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Items Sold</p>
                      <p className="text-2xl sm:text-3xl font-bold text-primary-800 dark:text-primary-200">{stats.totalItemsSold}</p>
                    </div>
                    <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Products - single CTA to products list page */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <Link
            href="/admin/products"
            className="focus-ring-none btn btn-outline btn-hover-secondary-filled inline-flex items-center gap-2"
          >
            <Package className="w-5 h-5" />
            <span>Products</span>
          </Link>
        </div>

              {/* Analytics - charts */}
              <div className="hero-glass-frame relative backdrop-blur-lg rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                <div className="relative z-10 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-primary-800 dark:text-primary-100 mb-4 text-center">Analytics</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-sm rounded-xl p-4">
                      <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                      <div className="relative z-10 bg-neutral-200/60 dark:bg-neutral-800/80 rounded-xl p-4 border border-neutral-300/80 dark:border-neutral-700">
                        <h3 className="text-sm font-semibold text-primary-800 dark:text-primary-200 mb-4 text-center">Products by category</h3>
                        <div className="space-y-3">
                          {categories.map((cat, i) => {
                            const count = products.filter(p => p.category === cat).length
                            const maxCount = Math.max(1, ...categories.map(c => products.filter(p => p.category === c).length))
                            const pct = (count / maxCount) * 100
                            return (
                              <div key={cat} className="flex items-center gap-3">
                                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 w-24 truncate capitalize">{cat.replace(/-/g, ' ')}</span>
                                <div className="flex-1 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.05 }}
                                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-500 dark:to-primary-400"
                                  />
                                </div>
                                <span className="text-sm font-medium text-primary-800 dark:text-primary-200 w-8 text-right">{count}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-sm rounded-xl p-4">
                      <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                      <div className="relative z-10 bg-neutral-300/50 dark:bg-neutral-800/80 rounded-xl p-4 border border-neutral-300/80 dark:border-neutral-700">
                        <h3 className="text-sm font-semibold text-primary-800 dark:text-primary-200 mb-4 text-center">Revenue & orders</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Total revenue</p>
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.5 }}
                              className="text-2xl font-bold text-primary-700 dark:text-primary-300"
                            >
                              UGX {stats.totalRevenue.toLocaleString()}
                            </motion.div>
                          </div>
                          <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: orders.length > 0 ? `${Math.min(100, (stats.totalOrders / 20) * 100)}%` : '0%' }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className="h-full rounded-full bg-gradient-to-r from-primary-600 to-accent-500 dark:from-primary-500 dark:to-accent-400"
                            />
                          </div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">Orders: {stats.totalOrders}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout at bottom */}
              <div className="flex justify-center pt-4 pb-2">
                <button
                  onClick={handleLogout}
                  className="focus-ring-none flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>

          </div>
        </div>
      </div>
      )}
    </div>
  )
}

