'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Package, DollarSign, ShoppingCart, BarChart3 } from 'lucide-react'
import { AuthManager } from '@/lib/auth'
import { ProductManager, type Product } from '@/lib/products'
import { OrderManager, type Order } from '@/lib/cart'
import { SkeletonAdminDashboard } from '@/components/ui/Skeleton'

const categories = ['shirts', 'tees', 'coats', 'pants-and-shorts', 'footwear', 'accessories']

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
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

  const boughtProducts = ProductManager.getBoughtProducts()
  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalItemsSold: orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
    boughtProducts: boughtProducts.length
  }

  return (
    <div className="min-h-screen pb-20">
      {!isAdmin ? (
        <SkeletonAdminDashboard />
      ) : (
        <div className="container-custom mt-1 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
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

              {/* Analytics - bar graphs and pie chart with hover */}
              <div className="hero-glass-frame relative backdrop-blur-lg rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                <div className="relative z-10 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-primary-800 dark:text-primary-100 mb-4 text-center">Analytics</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar chart - products by category with hover */}
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
                              <motion.div
                                key={cat}
                                className="flex items-center gap-3 group"
                                whileHover={{ x: 4 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                              >
                                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 w-24 truncate capitalize group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">{cat.replace(/-/g, ' ')}</span>
                                <div className="flex-1 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden relative">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-500 dark:to-primary-400 cursor-default"
                                    title={`${count} products`}
                                  />
                                </div>
                                <span className="text-sm font-medium text-primary-800 dark:text-primary-200 w-8 text-right group-hover:scale-110 transition-transform">{count}</span>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                    {/* Pie chart - revenue vs orders share with hover */}
                    <div className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-sm rounded-xl p-4">
                      <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                      <div className="relative z-10 bg-neutral-300/50 dark:bg-neutral-800/80 rounded-xl p-4 border border-neutral-300/80 dark:border-neutral-700">
                        <h3 className="text-sm font-semibold text-primary-800 dark:text-primary-200 mb-4 text-center">Revenue & orders</h3>
                          <div className="flex flex-col sm:flex-row items-center gap-6">
                          <div className="relative w-36 h-36 flex-shrink-0">
                            {(() => {
                              const total = stats.totalRevenue + (stats.totalOrders * 50000)
                              const revPct = total > 0 ? (stats.totalRevenue / total) * 100 : 50
                              const orderPct = 100 - revPct
                              const C = 2 * Math.PI * 14
                              const revLen = (revPct / 100) * C
                              const orderLen = (orderPct / 100) * C
                              return (
                                <>
                                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                    <motion.circle
                                      cx="18" cy="18" r="14"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="6"
                                      className="text-primary-500 dark:text-primary-400"
                                      strokeDasharray={`${revLen} ${C - revLen}`}
                                      initial={{ strokeDasharray: `0 ${C}` }}
                                      animate={{ strokeDasharray: `${revLen} ${C - revLen}` }}
                                      transition={{ duration: 1, delay: 0.2 }}
                                    />
                                    <motion.circle
                                      cx="18" cy="18" r="14"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="6"
                                      className="text-accent-500 dark:text-accent-400"
                                      strokeDasharray={`${orderLen} ${C - orderLen}`}
                                      strokeDashoffset={-revLen}
                                      initial={{ strokeDasharray: `0 ${C}`, strokeDashoffset: 0 }}
                                      animate={{ strokeDasharray: `${orderLen} ${C - orderLen}`, strokeDashoffset: -revLen }}
                                      transition={{ duration: 1, delay: 0.2 }}
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-bold text-primary-800 dark:text-primary-200">{stats.totalOrders}</span>
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-0.5">orders</span>
                                  </div>
                                </>
                              )
                            })()}
                          </div>
                          <div className="space-y-3 flex-1">
                            <motion.div
                              className="flex items-center justify-between p-2 rounded-lg bg-neutral-200/60 dark:bg-neutral-700/50 hover:bg-primary-100/50 dark:hover:bg-primary-900/20 transition-colors"
                              whileHover={{ scale: 1.02 }}
                            >
                              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Revenue</span>
                              <span className="text-sm font-bold text-primary-700 dark:text-primary-300">UGX {stats.totalRevenue.toLocaleString()}</span>
                            </motion.div>
                            <motion.div
                              className="flex items-center justify-between p-2 rounded-lg bg-neutral-200/60 dark:bg-neutral-700/50 hover:bg-accent-100/50 dark:hover:bg-accent-900/20 transition-colors"
                              whileHover={{ scale: 1.02 }}
                            >
                              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Orders</span>
                              <span className="text-sm font-bold text-accent-700 dark:text-accent-300">{stats.totalOrders}</span>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

          </div>
        </div>
      </div>
      )}
    </div>
  )
}

