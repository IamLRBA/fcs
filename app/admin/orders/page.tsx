'use client'

import { useState, useEffect, useMemo, type MouseEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2, SkipBack, SkipForward } from 'lucide-react'
import { AuthManager } from '@/lib/auth'
import type { Order } from '@/lib/cart'
import AdminNavHeader from '@/components/admin/AdminNavHeader'
import OrderItemsDetail from '@/components/orders/OrderItemsDetail'
import Button from '@/components/ui/Button'
import ModalCloseButton from '@/components/ui/ModalCloseButton'
import SegmentedPillNav from '@/components/ui/SegmentedPillNav'
import { Skeleton } from '@/components/ui/Skeleton'

type OrderDeleteReasonKey = 'PRODUCT_BOUGHT' | 'MISTAKENLY_POSTED' | 'DISCONTINUED'

const DELETE_REASON_OPTIONS: { key: OrderDeleteReasonKey; label: string; description: string }[] = [
  {
    key: 'PRODUCT_BOUGHT',
    label: 'Sold / purchased',
    description: 'The piece was bought; remove it from the catalog.',
  },
  {
    key: 'MISTAKENLY_POSTED',
    label: 'Mistakenly posted',
    description: 'Listed by mistake or with incorrect details.',
  },
  {
    key: 'DISCONTINUED',
    label: 'Discontinued',
    description: 'No longer offered or replaced in the collection.',
  },
]

const ICON_BTN_RED =
  'w-10 h-10 !border-red-400 !text-red-400 hover:!bg-red-500/20 hover:!text-red-300 dark:!border-red-400 dark:!text-red-400 dark:hover:!bg-red-500/20 dark:hover:!text-red-300'

const selectThemeClass =
  'input-overlay w-full rounded-lg border border-primary-300/60 bg-primary-50/80 px-3 py-2 text-primary-900 dark:border-primary-500/40 dark:bg-neutral-800/80 dark:text-primary-100'

type WorkflowTab = 'pending' | 'in_progress' | 'ready'

const TABS: { id: WorkflowTab; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'ready', label: 'Ready' },
]

const EXPANDED_ACTION_BTN_CLASS = 'w-full min-w-[11rem] max-w-[240px] mx-auto justify-center gap-2'

const ORDERS_PAGE_SIZE = 6

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

export default function AdminOrdersPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<WorkflowTab>('pending')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [cancelConfirmOrderId, setCancelConfirmOrderId] = useState<string | null>(null)
  const [cancelOrderReason, setCancelOrderReason] = useState<OrderDeleteReasonKey>('MISTAKENLY_POSTED')
  const [undoOrderId, setUndoOrderId] = useState<string | null>(null)
  const [ordersListPage, setOrdersListPage] = useState(1)

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

  const totalOrderPages = Math.max(1, Math.ceil(filtered.length / ORDERS_PAGE_SIZE))
  const safeOrderPage = Math.min(ordersListPage, totalOrderPages)
  const pageOrders = filtered.slice(
    (safeOrderPage - 1) * ORDERS_PAGE_SIZE,
    safeOrderPage * ORDERS_PAGE_SIZE
  )

  useEffect(() => {
    setOrdersListPage(1)
  }, [tab])

  useEffect(() => {
    if (ordersListPage > totalOrderPages) setOrdersListPage(totalOrderPages)
  }, [ordersListPage, totalOrderPages])

  /** 1 col phone; 2 cols tablet; 3 cols desktop. One card: single column + centered at all sizes. Two cards: 2-col grid on md+ so the pair is centered on desktop (not stuck in first two of three columns). */
  const orderListUlClass = useMemo(() => {
    const n = pageOrders.length
    const anyExpanded = expandedId !== null
    const base = 'list-none p-0 m-0 gap-4 lg:gap-6 grid w-full'
    if (n <= 1 && !anyExpanded) {
      return `${base} grid-cols-1 max-w-md mx-auto`
    }
    if (n === 2 && !anyExpanded) {
      return `${base} grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl`
    }
    if (anyExpanded) {
      return `${base} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto`
    }
    return `${base} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
  }, [pageOrders.length, expandedId])

  const runAction = async (
    orderId: string,
    action: 'start_progress' | 'mark_ready' | 'delivered' | 'cancel_order' | 'undo_cancel',
    opts?: { reason?: OrderDeleteReasonKey }
  ) => {
    setBusyId(orderId)
    try {
      const payload: { action: typeof action; reason?: string } = { action }
      if (opts?.reason) payload.reason = opts.reason
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const openCancelOrderDialog = (orderId: string) => {
    setCancelConfirmOrderId(orderId)
  }

  const cancelDialogOrder = useMemo(
    () => (cancelConfirmOrderId ? orders.find((o) => o.id === cancelConfirmOrderId) : null),
    [orders, cancelConfirmOrderId]
  )

  useEffect(() => {
    if (cancelConfirmOrderId) {
      setCancelOrderReason('MISTAKENLY_POSTED')
    }
  }, [cancelConfirmOrderId])

  const confirmCancelOrder = async () => {
    if (!cancelConfirmOrderId) return
    const targetId = cancelConfirmOrderId
    setCancelConfirmOrderId(null)
    const reason = cancelOrderReason
    await runAction(targetId, 'cancel_order', { reason })
    setUndoOrderId(targetId)
  }

  const undoCancelOrder = async () => {
    if (!undoOrderId) return
    const targetId = undoOrderId
    setUndoOrderId(null)
    await runAction(targetId, 'undo_cancel')
  }

  return (
    <div className="min-h-screen pb-20">
      {!isAdmin ? (
        <div className="min-h-screen" />
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

              {loading ? (
                <div className="space-y-3 py-2">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={`orders-skeleton-${idx}`}
                      className="mx-auto w-full max-w-md rounded-xl border border-neutral-300/80 bg-white/80 p-4 dark:border-neutral-600 dark:bg-neutral-900/50"
                    >
                      <Skeleton className="mb-3 h-4 w-20 rounded" />
                      <Skeleton className="mb-2 h-5 w-44 rounded" />
                      <Skeleton className="mb-4 h-3 w-36 rounded" />
                      <Skeleton className="h-9 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-neutral-600 dark:text-neutral-400 py-12">
                  No orders in this stage.
                </p>
              ) : (
                <>
                <ul className={orderListUlClass}>
                  {pageOrders.map((order) => {
                    const expanded = expandedId === order.id
                    const act = actionForTab(tab)
                    const busy = busyId === order.id
                    const n = pageOrders.length
                    const loneSecondRow =
                      n === 2 && expandedId !== null && expandedId !== order.id && !expanded
                    let liSpan = ''
                    if (expanded) {
                      liSpan = 'col-span-full'
                    } else if (loneSecondRow) {
                      liSpan = 'col-span-full flex justify-center'
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
                            <div className="px-4 sm:px-5 pb-4 pt-0 flex flex-col sm:flex-row justify-center items-center gap-3">
                              <Button
                                variant="default"
                                size="icon"
                                type="button"
                                disabled={busy}
                                className={`h-10 shrink-0 focus-ring-none disabled:opacity-50 ${ICON_BTN_RED}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openCancelOrderDialog(order.id)
                                }}
                                aria-label="Delete order"
                              >
                                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                type="button"
                                disabled={busy}
                                className="w-full min-w-[11rem] max-w-[240px] justify-center gap-2 sm:w-auto sm:flex-1"
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
                                <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-center items-center gap-4 border-0">
                                  <Button
                                    variant="default"
                                    size="icon"
                                    type="button"
                                    disabled={busy}
                                    className={`h-10 shrink-0 focus-ring-none disabled:opacity-50 ${ICON_BTN_RED}`}
                                    onClick={() => openCancelOrderDialog(order.id)}
                                    aria-label="Delete order"
                                  >
                                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                  </Button>
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
                <div className="flex items-center justify-center gap-6 py-4 border-t border-neutral-200/80 dark:border-neutral-700 mt-4">
                  <button
                    type="button"
                    disabled={safeOrderPage <= 1}
                    onClick={() => {
                      setExpandedId(null)
                      setOrdersListPage((p) => Math.max(1, p - 1))
                    }}
                    className="focus-ring-none focus:outline-none text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 disabled:opacity-30 disabled:pointer-events-none transition-colors duration-300"
                    aria-label="Previous orders page"
                  >
                    <SkipBack className="w-5 h-5" strokeWidth={2} />
                  </button>
                  <span className="text-xs text-neutral-600 dark:text-neutral-400 tabular-nums">
                    {safeOrderPage} / {totalOrderPages}
                  </span>
                  <button
                    type="button"
                    disabled={safeOrderPage >= totalOrderPages}
                    onClick={() => {
                      setExpandedId(null)
                      setOrdersListPage((p) => Math.min(totalOrderPages, p + 1))
                    }}
                    className="focus-ring-none focus:outline-none text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 disabled:opacity-30 disabled:pointer-events-none transition-colors duration-300"
                    aria-label="Next orders page"
                  >
                    <SkipForward className="w-5 h-5" strokeWidth={2} />
                  </button>
                </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {cancelConfirmOrderId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm dark:bg-black/75"
            onClick={() => setCancelConfirmOrderId(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="hero-glass-frame relative w-full max-w-md overflow-hidden rounded-2xl backdrop-blur-lg"
              onClick={(e: MouseEvent) => e.stopPropagation()}
            >
              <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden />
              <ModalCloseButton onClose={() => setCancelConfirmOrderId(null)} className="absolute top-2 right-2 z-40 flex-shrink-0" aria-label="Close" />
              <div className="relative z-10 flex max-h-[min(90vh,34rem)] flex-col overflow-hidden rounded-bl-2xl rounded-tl-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
                <div className="modal-scroll min-h-0 flex-1 overflow-y-auto p-6 pt-12 sm:p-8 sm:pt-14">
                  <h2 className="text-xl font-bold text-primary-800 dark:text-primary-100">Delete order?</h2>
                  <p className="mt-2 text-neutral-700 dark:text-primary-300">
                    <span className="font-semibold text-neutral-900 dark:text-primary-50">
                      &ldquo;{cancelDialogOrder?.customer.fullName ?? 'this order'}&rdquo;
                    </span>
                  </p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-primary-400">Reason for removal</p>
                  <div className="mt-3">
                    <select
                      value={cancelOrderReason}
                      onChange={(e) => setCancelOrderReason(e.target.value as OrderDeleteReasonKey)}
                      className={selectThemeClass}
                    >
                      {DELETE_REASON_OPTIONS.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-neutral-600 dark:text-primary-400">
                      {DELETE_REASON_OPTIONS.find((opt) => opt.key === cancelOrderReason)?.description}
                    </p>
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Button
                      type="button"
                      variant="default"
                      size="icon"
                      className={`focus-ring-none h-10 w-10 ${ICON_BTN_RED}`}
                      onClick={() => void confirmCancelOrder()}
                      aria-label="Delete order"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {undoOrderId && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-5 right-5 z-[1200] w-[min(92vw,23rem)]"
          >
            <div className="hero-glass-frame relative overflow-hidden rounded-xl backdrop-blur-lg">
              <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden />
              <ModalCloseButton onClose={() => setUndoOrderId(null)} className="absolute top-2 right-2 z-40 flex-shrink-0" aria-label="Dismiss undo" />
              <div className="relative z-10 rounded-bl-xl rounded-tl-xl border border-neutral-200 bg-white p-3 pt-9 dark:border-neutral-700 dark:bg-neutral-800 sm:pt-8">
                <p className="text-sm text-neutral-800 dark:text-primary-200">Order cancelled.</p>
                <div className="mt-2">
                  <Button type="button" variant="default" size="sm" onClick={() => void undoCancelOrder()}>
                    Undo Delete
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
