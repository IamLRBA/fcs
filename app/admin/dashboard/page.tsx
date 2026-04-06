'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Package, DollarSign, ShoppingCart, BarChart3, Users, ShoppingBag } from 'lucide-react'
import { AuthManager } from '@/lib/auth'
import { OrderManager, type Order } from '@/lib/cart'
import { SkeletonAdminDashboard } from '@/components/ui/Skeleton'
import AdminNavHeader from '@/components/admin/AdminNavHeader'

interface Product {
  id: string
  category: string
  name?: string
}
interface UserAccount {
  id: string
  isActive: boolean
}

const categories = ['shirts', 'tees', 'coats', 'pants-and-shorts', 'footwear', 'accessories']

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function aggregateSalesByProductInMonth(
  orders: Order[],
  catalog: { id: string; name?: string }[],
  year: number,
  month: number
) {
  const map = new Map<string, { name: string; qty: number }>()
  for (const order of orders) {
    const d = new Date(order.timestamp)
    if (Number.isNaN(d.getTime())) continue
    if (d.getFullYear() !== year || d.getMonth() !== month) continue
    for (const item of order.items) {
      const key = item.productId || item.sku || item.name
      const catalogMatch = item.productId ? catalog.find((p) => p.id === item.productId) : undefined
      const resolvedName = (catalogMatch?.name || item.name || key).trim() || key
      const prev = map.get(key) ?? { name: resolvedName, qty: 0 }
      prev.qty += item.quantity
      prev.name = catalogMatch?.name || prev.name
      map.set(key, prev)
    }
  }
  return Array.from(map.values())
    .filter((v) => v.qty > 0)
    .sort((a, b) => b.qty - a.qty)
}

function topProductPerMonth(orders: Order[], catalog: { id: string; name?: string }[], year: number) {
  return MONTH_LABELS.map((label, month) => {
    const rows = aggregateSalesByProductInMonth(orders, catalog, year, month)
    const top = rows[0]
    return { month, label, productName: top?.name ?? '—', qty: top?.qty ?? 0 }
  })
}

function yearRangeFromOrders(orders: Order[]): number[] {
  const years = new Set<number>()
  const yNow = new Date().getFullYear()
  years.add(yNow)
  years.add(yNow - 1)
  years.add(yNow - 2)
  for (const order of orders) {
    const d = new Date(order.timestamp)
    if (!Number.isNaN(d.getTime())) years.add(d.getFullYear())
  }
  return Array.from(years).sort((a, b) => b - a)
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<UserAccount[]>([])
  const [salesChartMode, setSalesChartMode] = useState<'monthly' | 'yearly'>('monthly')
  const [chartYear, setChartYear] = useState(() => new Date().getFullYear())
  const [chartMonth, setChartMonth] = useState(() => new Date().getMonth())
  const [removalSummary, setRemovalSummary] = useState<{
    PRODUCT_BOUGHT: number
  } | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!AuthManager.isAdmin()) {
      router.push('/admin/login')
      return
    }
    setIsAdmin(true)
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      const [productsRes, usersRes, ordersRes, removalsRes] = await Promise.all([
        fetch('/api/products?includeInactive=1', { cache: 'no-store' }),
        fetch('/api/users', { cache: 'no-store' }),
        fetch('/api/orders', { cache: 'no-store' }),
        fetch('/api/product-removals/summary', { cache: 'no-store' }),
      ])
      if (productsRes.ok) setProducts(await productsRes.json())
      if (removalsRes.ok) {
        const r = await removalsRes.json()
        setRemovalSummary({ PRODUCT_BOUGHT: Number(r.PRODUCT_BOUGHT) || 0 })
      } else {
        setRemovalSummary(null)
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.map((u: any) => ({ id: u.id, isActive: u.isActive !== false })))
      }
      /** Analytics use completed (delivered) orders only: API first, plus local-only delivered not in API. */
      const localDelivered = OrderManager.getOrders().filter((o) => o.status === 'delivered')
      if (ordersRes.ok) {
        const allApi = (await ordersRes.json()) as Order[]
        const apiDelivered = allApi.filter((o) => o.status === 'delivered')
        const apiIds = new Set(apiDelivered.map((o) => o.id))
        const extraLocal = localDelivered.filter((o) => !apiIds.has(o.id))
        setOrders([...apiDelivered, ...extraLocal])
      } else {
        setOrders(localDelivered)
      }
    } catch (error) {
      console.error('Failed to load products for dashboard', error)
      setOrders(OrderManager.getOrders().filter((o) => o.status === 'delivered'))
    }
  }
  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalItemsSold: orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
    totalUsers: users.length,
  }
  /* Same bar shades in light and dark (matches previous dark-mode palette) */
  const categoryBarTones = [
    'bg-primary-500',
    'bg-primary-400',
    'bg-accent-500',
    'bg-accent-400',
    'bg-primary-600',
    'bg-accent-600',
  ] as const

  const yearOptions = useMemo(() => {
    const years = new Set(yearRangeFromOrders(orders))
    years.add(chartYear)
    return Array.from(years).sort((a, b) => b - a)
  }, [orders, chartYear])

  const monthlyProductSales = useMemo(
    () => aggregateSalesByProductInMonth(orders, products, chartYear, chartMonth).slice(0, 14),
    [orders, products, chartYear, chartMonth]
  )

  const yearlyTopByMonth = useMemo(
    () => topProductPerMonth(orders, products, chartYear),
    [orders, products, chartYear]
  )

  const salesChartMaxY = useMemo(() => {
    if (salesChartMode === 'monthly') {
      return Math.max(1, ...monthlyProductSales.map((r) => r.qty))
    }
    return Math.max(1, ...yearlyTopByMonth.map((r) => r.qty))
  }, [salesChartMode, monthlyProductSales, yearlyTopByMonth])

  const overviewCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, delay: 0 },
    { label: 'Completed orders', value: stats.totalOrders, icon: ShoppingCart, delay: 0.1 },
    { label: 'Total Revenue', value: `UGX ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, delay: 0.2 },
    { label: 'Items Sold', value: stats.totalItemsSold, icon: BarChart3, delay: 0.3 },
    {
      label: 'Sold off catalog',
      value: removalSummary?.PRODUCT_BOUGHT ?? '—',
      icon: ShoppingBag,
      delay: 0.32,
    },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, delay: 0.35 },
  ] as const

  return (
    <div className="min-h-screen pb-20">
      {!isAdmin ? (
        <SkeletonAdminDashboard />
      ) : (
        <div className="mt-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdminNavHeader
            title="Admin Dashboard"
            subtitle="Comprehensive analytics and management overview"
          />
          {/* Main container - semi-transparent like account page */}
          <div className="hero-glass-frame relative backdrop-blur-lg w-full rounded-2xl">
            <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
            <div className="relative z-10 bg-neutral-100/80 dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6 md:p-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-800 dark:text-primary-100 mb-6 sm:mb-8 text-center">Admin Dashboard</h1>

              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-primary-800 dark:text-primary-100 mb-4 text-center">Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {overviewCards.map((card) => {
                    const Icon = card.icon
                    return (
                      <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: card.delay }}
                        className="rounded-lg border border-neutral-300/70 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/40 py-4 px-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">{card.label}</p>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 break-words leading-tight">{card.value}</p>
                          </div>
                          <Icon className="w-5 h-5 text-primary-700 dark:text-primary-300 flex-shrink-0" />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 text-center mt-3 max-w-xl mx-auto leading-snug">
                  When an order is marked <strong>delivered</strong>, each line item with a catalog product is removed from the shop and recorded as{' '}
                  <strong>purchased</strong> (<code className="text-[10px]">PRODUCT_BOUGHT</code>). Revenue and items-sold charts use delivered orders; product counts reflect the live catalog.
                </p>
              </div>

              {/* Analytics */}
              <div className="rounded-xl sm:rounded-2xl mb-6 sm:mb-8 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-primary-800 dark:text-primary-100 mb-4 text-center">Analytics</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Bar chart - products by category with hover */}
                    <div className="rounded-xl p-4 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
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
                                    className={`h-full rounded-full ${categoryBarTones[i % categoryBarTones.length]} cursor-default`}
                                    title={`${count} products`}
                                  />
                                </div>
                                <span className="text-sm font-medium text-primary-800 dark:text-primary-200 w-8 text-right group-hover:scale-110 transition-transform">{count}</span>
                              </motion.div>
                            )
                          })}
                        </div>
                    </div>
                    {/* Pie chart - revenue vs orders share with hover */}
                    <div className="rounded-xl p-4 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
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
                                      className="text-primary-400"
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
                                      className="text-accent-400"
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
                  <div className="mt-6 w-full">
                    <div className="rounded-xl p-4 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
                      <h3 className="text-sm font-semibold text-primary-800 dark:text-primary-200 mb-3 text-center">
                        Product sales performance
                      </h3>
                      <p className="text-xs text-center text-neutral-600 dark:text-neutral-400 mb-4">
                        {salesChartMode === 'monthly'
                          ? 'Units sold per product in the selected month.'
                          : 'Best-selling product each month of the selected year (bar height = units sold).'}
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                        <div className="inline-flex !rounded-full bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(0,0,0,0.35)] p-[1px]">
                          <div className="relative grid grid-cols-2 p-[1px] min-w-[200px]">
                            <button
                              type="button"
                              onClick={() => setSalesChartMode('monthly')}
                              className={`relative z-10 !rounded-full px-4 py-2 text-xs font-medium transition-colors focus:outline-none focus-visible:outline-none focus:ring-0 ${
                                salesChartMode === 'monthly'
                                  ? 'bg-white dark:bg-neutral-800 text-primary-800 dark:text-primary-100 shadow-sm'
                                  : 'text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100'
                              }`}
                            >
                              By month
                            </button>
                            <button
                              type="button"
                              onClick={() => setSalesChartMode('yearly')}
                              className={`relative z-10 !rounded-full px-4 py-2 text-xs font-medium transition-colors focus:outline-none focus-visible:outline-none focus:ring-0 ${
                                salesChartMode === 'yearly'
                                  ? 'bg-white dark:bg-neutral-800 text-primary-800 dark:text-primary-100 shadow-sm'
                                  : 'text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100'
                              }`}
                            >
                              By year
                            </button>
                          </div>
                        </div>
                        <label className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                          <span>Year</span>
                          <select
                            value={chartYear}
                            onChange={(e) => setChartYear(Number(e.target.value))}
                            className="rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-2 py-1.5 text-xs text-neutral-800 dark:text-neutral-100"
                          >
                            {yearOptions.map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>
                        </label>
                        {salesChartMode === 'monthly' ? (
                          <label className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                            <span>Month</span>
                            <select
                              value={chartMonth}
                              onChange={(e) => setChartMonth(Number(e.target.value))}
                              className="rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-2 py-1.5 text-xs text-neutral-800 dark:text-neutral-100"
                            >
                              {MONTH_LABELS.map((m, i) => (
                                <option key={m} value={i}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : null}
                      </div>

                      <div className="flex gap-2 min-h-[220px]">
                        <div className="flex flex-col justify-between shrink-0 w-9 pt-1 pb-8 text-[10px] text-neutral-500 dark:text-neutral-400 text-right tabular-nums">
                          <span>{salesChartMaxY}</span>
                          <span>{Math.round(salesChartMaxY / 2)}</span>
                          <span>0</span>
                        </div>
                        <div className="flex-1 min-w-0 border-l border-b border-neutral-300/80 dark:border-neutral-600 pl-2 pb-1">
                          {salesChartMode === 'monthly' ? (
                            monthlyProductSales.length === 0 ? (
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center py-16">
                                No sales in {MONTH_LABELS[chartMonth]} {chartYear}.
                              </p>
                            ) : (
                              <div className="flex items-end gap-1 sm:gap-2 h-44 px-1">
                                {monthlyProductSales.map((row, i) => {
                                  const pct = Math.round((row.qty / salesChartMaxY) * 100)
                                  const height = Math.max(4, pct)
                                  return (
                                    <div
                                      key={`${row.name}-${i}`}
                                      className="flex flex-col items-center gap-1 flex-1 min-w-0 max-w-[4.5rem]"
                                      title={`${row.name}: ${row.qty} sold`}
                                    >
                                      <span className="text-[10px] text-neutral-600 dark:text-neutral-400 tabular-nums">{row.qty}</span>
                                      <div className="w-full h-32 bg-neutral-200 dark:bg-neutral-700 rounded-t flex items-end overflow-hidden">
                                        <motion.div
                                          initial={{ height: 0 }}
                                          animate={{ height: `${height}%` }}
                                          transition={{ duration: 0.5, delay: i * 0.03 }}
                                          className={`w-full rounded-t ${categoryBarTones[i % categoryBarTones.length]}`}
                                        />
                                      </div>
                                      <span className="text-[9px] sm:text-[10px] text-center text-neutral-700 dark:text-neutral-300 line-clamp-2 leading-tight w-full" title={row.name}>
                                        {row.name}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          ) : (
                            <div className="flex items-end gap-1 sm:gap-1.5 h-44 px-0.5 overflow-x-auto">
                              {yearlyTopByMonth.map((row, i) => {
                                const pct = row.qty > 0 ? Math.round((row.qty / salesChartMaxY) * 100) : 0
                                const height = row.qty > 0 ? Math.max(4, pct) : 2
                                return (
                                  <div
                                    key={row.label}
                                    className="flex flex-col items-center gap-1 flex-1 min-w-[2rem] shrink-0"
                                    title={row.qty > 0 ? `${row.productName}: ${row.qty} sold` : 'No sales'}
                                  >
                                    <span className="text-[10px] text-neutral-600 dark:text-neutral-400 tabular-nums min-h-[14px]">{row.qty > 0 ? row.qty : ''}</span>
                                    <div className="w-full max-w-8 h-32 bg-neutral-200 dark:bg-neutral-700 rounded-t flex items-end overflow-hidden">
                                      <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ duration: 0.5, delay: i * 0.03 }}
                                        className={`w-full rounded-t ${row.qty > 0 ? categoryBarTones[i % categoryBarTones.length] : 'bg-neutral-500/35'}`}
                                      />
                                    </div>
                                    <span className="text-[10px] font-medium text-neutral-700 dark:text-neutral-300">{row.label}</span>
                                    <span className="text-[8px] sm:text-[9px] text-center text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-tight max-w-[3.5rem]" title={row.productName}>
                                      {row.productName}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 text-center mt-2">
                        {salesChartMode === 'monthly'
                          ? 'Y-axis: units sold · X-axis: product'
                          : 'Y-axis: units sold (top product only) · X-axis: month'}
                      </p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 text-center mt-1 px-2 max-w-xl mx-auto leading-snug">
                        Charts use <strong>delivered</strong> orders from the database (plus any older delivered orders saved only in this browser). Names follow the catalog when the line item product ID matches; otherwise you see the name stored on the order. Delivered line items remove matching products from the catalog, so older sales may show names from the order only.
                      </p>
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

