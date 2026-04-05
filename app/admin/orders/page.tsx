'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { AuthManager } from '@/lib/auth'
import type { Order } from '@/lib/cart'
import AdminNavHeader from '@/components/admin/AdminNavHeader'
import SafeImage from '@/components/common/SafeImage'
import Button from '@/components/ui/Button'
import ModalCloseButton from '@/components/ui/ModalCloseButton'
import SegmentedPillNav from '@/components/ui/SegmentedPillNav'
import { SkeletonAdminDashboard } from '@/components/ui/Skeleton'

type WorkflowTab = 'pending' | 'in_progress' | 'ready'

const TABS: { id: WorkflowTab; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'ready', label: 'Ready' },
]

const EXPANDED_ACTION_BTN_CLASS = 'w-full min-w-[11rem] max-w-[240px] mx-auto justify-center gap-2'

function tabMatchesStatus(tab: WorkflowTab, status: Order['status']): boolean {
  if (tab === 'pending') return status === 'pending'
  if (tab === 'in_progress') return status === 'confirmed'
  return status === 'dispatched'
}

function actionForTab(tab: WorkflowTab): { action: 'start_progress' | 'mark_ready' | 'delivered'; label: string } | null {
  if (tab === 'pending') return { action: 'start_progress', label: 'Start Progress' }
  if (tab === 'in_progress') return { action: 'mark_ready', label: 'Mark as Ready' }
  if (tab === 'ready') return { action: 'delivered', label: 'Mark as Delivered' }
  return null
}

function itemQtySum(order: Order): number {
  return order.items.reduce((s, i) => s + i.quantity, 0)
}

function OrderItemsDetail({ order }: { order: Order }) {
  return (
    <div className="mt-6 pt-6 border-t border-neutral-200/60 dark:border-white/[0.08]">
      <h3 className="text-lg font-bold text-gray-900 dark:text-primary-100 mb-4 uppercase tracking-wide text-sm text-center sm:text-left">
        Items Ordered
      </h3>
      <div className="space-y-4">
        {order.items.map((item, index) => (
          <div key={`${item.sku}-${index}`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4">
              <div className="flex items-start gap-3 flex-1 min-w-0 justify-center sm:justify-start">
                <div className="relative w-20 h-20 bg-gray-100/80 dark:bg-neutral-700/50 rounded-md overflow-hidden flex-shrink-0 border border-neutral-200/50 dark:border-neutral-600/50">
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <h4 className="text-gray-900 dark:text-primary-100 font-semibold text-sm mb-1">{item.name}</h4>
                  <p className="text-gray-500 dark:text-primary-400 text-xs mb-1">SKU: {item.sku}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-primary-300">
                    {item.size ? (
                      <span>
                        Size: <strong className="dark:text-primary-100">{item.size}</strong>
                      </span>
                    ) : null}
                    {item.color ? (
                      <span>
                        Color: <strong className="dark:text-primary-100">{item.color}</strong>
                      </span>
                    ) : null}
                    <span>
                      Qty: <strong className="dark:text-primary-100">{item.quantity}</strong>
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center sm:text-right flex-shrink-0">
                <p className="text-gray-900 dark:text-primary-100 font-bold text-base">
                  UGX {(item.price * item.quantity).toLocaleString()}
                </p>
                <p className="text-gray-500 dark:text-primary-400 text-xs mt-1">UGX {item.price.toLocaleString()} each</p>
              </div>
            </div>
            {index < order.items.length - 1 ? (
              <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-300/70 to-transparent dark:from-transparent dark:via-white/[0.08] dark:to-transparent my-4" />
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-200/60 dark:border-white/[0.08]">
        <div className="space-y-3">
          <div className="flex justify-between text-sm gap-4">
            <span className="text-gray-600 dark:text-primary-300">Subtotal</span>
            <span className="text-gray-900 dark:text-primary-100 font-medium tabular-nums">UGX {order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm gap-4">
            <span className="text-gray-600 dark:text-primary-300">Delivery Fee</span>
            <span className="text-gray-900 dark:text-primary-100 font-medium">
              {order.deliveryFee === 0 ? 'Free' : `UGX ${order.deliveryFee.toLocaleString()}`}
            </span>
          </div>
          <div className="pt-3 border-t border-neutral-200/60 dark:border-white/[0.08] mt-3">
            <div className="flex justify-between items-center gap-4">
              <span className="text-lg font-bold text-gray-900 dark:text-primary-100 uppercase tracking-wide">Total</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-primary-100 tabular-nums">
                UGX {order.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {order.notes ? (
        <div className="mt-6 pt-4 border-t border-neutral-200/60 dark:border-white/[0.08]">
          <h3 className="text-sm font-bold text-gray-900 dark:text-primary-100 mb-2 uppercase tracking-wide text-center sm:text-left">
            Special Instructions
          </h3>
          <p className="text-gray-700 dark:text-primary-300 text-sm text-center sm:text-left">{order.notes}</p>
        </div>
      ) : null}
    </div>
  )
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<WorkflowTab>('pending')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    if (!AuthManager.isAdmin()) {
      router.push('/admin/login')
      return
    }
    setIsAdmin(true)
    load()
  }, [router])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' })
      if (res.ok) {
        const data = (await res.json()) as Order[]
        setOrders(
          [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        )
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(
    () => orders.filter((o) => tabMatchesStatus(tab, o.status)),
    [orders, tab]
  )

  const orderListUlClass = useMemo(() => {
    const n = filtered.length
    const anyExpanded = expandedId !== null
    const base = 'list-none p-0 m-0 gap-4 lg:gap-6'
    if (n <= 1) {
      return anyExpanded
        ? `${base} grid grid-cols-1 w-full max-w-5xl mx-auto`
        : `${base} grid grid-cols-1 w-full max-w-md mx-auto justify-items-center`
    }
    if (n === 2) {
      return anyExpanded
        ? `${base} grid grid-cols-2 w-full max-w-5xl mx-auto`
        : `${base} grid grid-cols-2 w-full max-w-2xl mx-auto`
    }
    return `${base} grid w-full grid-cols-2 lg:grid-cols-3`
  }, [filtered.length, expandedId])

  const runAction = async (orderId: string, action: 'start_progress' | 'mark_ready' | 'delivered') => {
    setBusyId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert((err as { error?: string }).error || 'Could not update order')
        return
      }
      await load()
      setExpandedId(null)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-screen pb-20">
      {!isAdmin || loading ? (
        <SkeletonAdminDashboard />
      ) : (
        <div className="mt-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdminNavHeader title="Orders" subtitle="Track and update customer orders" />

          <div className="hero-glass-frame relative backdrop-blur-lg w-full rounded-2xl">
            <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
            <div className="relative z-10 bg-neutral-100/80 dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-primary-800 dark:text-primary-100 mb-6 text-center">
                Order pipeline
              </h2>

              <div className="mb-8 max-w-xl mx-auto px-1">
                <SegmentedPillNav
                  items={TABS}
                  value={tab}
                  onSelect={(id) => {
                    setTab(id as WorkflowTab)
                    setExpandedId(null)
                  }}
                  className="!max-w-none"
                />
              </div>

              {filtered.length === 0 ? (
                <p className="text-center text-neutral-600 dark:text-neutral-400 py-12">
                  No orders in this stage.
                </p>
              ) : (
                <ul className={orderListUlClass}>
                  {filtered.map((order) => {
                    const expanded = expandedId === order.id
                    const act = actionForTab(tab)
                    const busy = busyId === order.id
                    const n = filtered.length
                    const loneSecondRow =
                      n === 2 && expandedId !== null && expandedId !== order.id && !expanded
                    let liSpan = ''
                    if (expanded) {
                      if (n >= 3) liSpan = 'col-span-2 lg:col-span-3'
                      else if (n === 2) liSpan = 'col-span-2'
                    } else if (loneSecondRow) {
                      liSpan = 'col-span-2 flex justify-center'
                    }
                    const innerCardWidthClass = loneSecondRow
                      ? 'w-full max-w-md mx-auto'
                      : 'w-full max-w-md mx-auto lg:max-w-none'

                    return (
                      <li key={order.id} className={`min-w-0 flex flex-col ${liSpan}`}>
                        <div
                          className={`${innerCardWidthClass} rounded-xl border border-neutral-300/80 dark:border-neutral-600 bg-white/80 dark:bg-neutral-900/50 shadow-md overflow-hidden flex flex-col`}
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedId(expanded ? null : order.id)}
                            className="focus-ring-none text-center w-full p-4 sm:p-5 border-0 outline-none focus:outline-none focus-visible:ring-0 ring-0 rounded-t-xl bg-transparent"
                          >
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Order</p>
                            <p className="font-bold text-neutral-900 dark:text-neutral-100 text-base sm:text-lg line-clamp-2">
                              {order.customer.fullName}
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                              {new Date(order.timestamp).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            <div className="flex flex-col items-center gap-1 mt-3 text-sm">
                              <span className="text-neutral-600 dark:text-neutral-400">
                                Items:{' '}
                                <strong className="text-neutral-900 dark:text-neutral-100">{itemQtySum(order)}</strong>
                              </span>
                              <span className="text-neutral-600 dark:text-neutral-400">
                                Total:{' '}
                                <strong className="text-neutral-900 dark:text-neutral-100">
                                  UGX {order.total.toLocaleString()}
                                </strong>
                              </span>
                            </div>
                          </button>

                          {!expanded && act ? (
                            <div className="px-4 sm:px-5 pb-4 pt-0 flex justify-center">
                              <Button
                                variant="default"
                                size="sm"
                                type="button"
                                disabled={busy}
                                className="w-full justify-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  void runAction(order.id, act.action)
                                }}
                              >
                                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {act.label}
                              </Button>
                            </div>
                          ) : null}

                          {expanded ? (
                            <div className="relative px-4 sm:px-6 pt-0 pb-6 flex flex-col min-h-0 bg-transparent">
                              <div className="w-full shrink-0 my-3 sm:my-4 px-1" aria-hidden>
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-400/50 to-transparent dark:from-transparent dark:via-white/[0.14] dark:to-transparent" />
                              </div>

                              <ModalCloseButton
                                onClose={() => setExpandedId(null)}
                                className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10"
                                aria-label="Close details"
                              />

                              <div className="pt-8 sm:pt-7 pb-4 flex flex-col max-w-3xl mx-auto w-full">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-primary-100 mb-3 uppercase tracking-wide text-left">
                                  Customer Information
                                </h3>
                                <div className="space-y-2 text-sm text-gray-700 dark:text-primary-300 text-left">
                                  <p>
                                    <span className="text-gray-500 dark:text-primary-400">Email: </span>
                                    {order.customer.email}
                                  </p>
                                  <p>
                                    <span className="text-gray-500 dark:text-primary-400">Phone: </span>
                                    {order.customer.phone}
                                  </p>
                                  <p>
                                    <span className="text-gray-500 dark:text-primary-400">Address: </span>
                                    {order.customer.address.street}, {order.customer.address.city}
                                  </p>
                                </div>

                                <OrderItemsDetail order={order} />
                              </div>

                              {act ? (
                                <div className="mt-auto pt-8 flex justify-center border-0">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    type="button"
                                    disabled={busy}
                                    className={EXPANDED_ACTION_BTN_CLASS}
                                    onClick={() => void runAction(order.id, act.action)}
                                  >
                                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {act.label}
                                  </Button>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
