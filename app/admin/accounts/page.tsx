'use client'

import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, X, Key, Trash2, UserCheck, UserX, Search, UserPlus, SkipBack, SkipForward } from 'lucide-react'
import { AuthManager } from '@/lib/auth'
import Button from '@/components/ui/Button'
import ModalCloseButton from '@/components/ui/ModalCloseButton'
import AdminNavHeader from '@/components/admin/AdminNavHeader'

type UserRow = {
  id: string
  email: string
  fullName: string
  phone: string
  createdAt: string
  isActive?: boolean
  ordersCount?: number
  reviewsCount?: number
}

const PAGE_SIZE = 10

export default function AdminAccountsPage() {
  const router = useRouter()
  const [list, setList] = useState<UserRow[]>([])
  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [pendingDeleteUser, setPendingDeleteUser] = useState<UserRow | null>(null)
  const [tablePage, setTablePage] = useState(1)

  useEffect(() => {
    if (!AuthManager.isAdmin()) {
      router.push('/admin/login')
      return
    }
    load()
  }, [router])

  const load = async () => {
    const res = await fetch('/api/users', { cache: 'no-store' })
    if (!res.ok) return
    const users = (await res.json()) as UserRow[]
    setList(users)
  }

  const setActive = async (userId: string, active: boolean) => {
    await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: active }),
    })
    await load()
  }

  const submitResetPassword = async (userId: string) => {
    if (!newPassword.trim() || newPassword.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }
    await fetch(`/api/users/${userId}/password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    })
    setResetUserId(null)
    setNewPassword('')
  }

  const query = searchQuery.toLowerCase().trim()
  const baseList = [...list].sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''))
  const filteredList = query
    ? baseList.filter(u =>
        [u.fullName, u.email, u.phone].join(' ').toLowerCase().includes(query)
      )
    : baseList

  const totalTablePages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE))
  const safeTablePage = Math.min(tablePage, totalTablePages)
  const pageUsers = filteredList.slice((safeTablePage - 1) * PAGE_SIZE, safeTablePage * PAGE_SIZE)

  useEffect(() => {
    setTablePage(1)
  }, [searchQuery])

  useEffect(() => {
    if (tablePage > totalTablePages) setTablePage(totalTablePages)
  }, [tablePage, totalTablePages])

  const confirmDeleteUser = () => {
    if (!pendingDeleteUser) return
    fetch(`/api/users/${pendingDeleteUser.id}`, { method: 'DELETE' }).then(() => load())
    setPendingDeleteUser(null)
  }

  const totalUsers = list.length
  const activeUsers = list.filter((u) => u.isActive !== false).length
  const inactiveUsers = totalUsers - activeUsers
  const recentUsers = list.filter((u) => Date.now() - new Date(u.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000).length

  return (
    <div className="min-h-screen pt-4">
      <div className="mt-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminNavHeader
          title="Account Management"
          subtitle="Manage user accounts, access status, and credentials"
        />
        <div className="hero-glass-frame relative backdrop-blur-lg rounded-2xl overflow-hidden">
          <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
          <div className="relative z-10 bg-neutral-100/80 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-800 dark:text-primary-100 mb-6 text-center">
              Accounts
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[{
                label: 'Total Users',
                value: totalUsers,
                icon: Users,
              }, {
                label: 'Active',
                value: activeUsers,
                icon: UserCheck,
              }, {
                label: 'Inactive',
                value: inactiveUsers,
                icon: UserX,
              }, {
                label: 'New (7 days)',
                value: recentUsers,
                icon: UserPlus,
              }].map((card) => (
                <div key={card.label} className="rounded-lg border border-neutral-300/70 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/40 py-4 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">{card.label}</p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{card.value}</p>
                    </div>
                    <card.icon className="w-5 h-5 text-primary-700 dark:text-primary-300" />
                  </div>
                </div>
              ))}
            </div>

            {/* Search accounts */}
            <div className="flex justify-center mb-6">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex items-center w-full max-w-md mx-auto"
              >
                <button
                  type="button"
                  className="focus-ring-none shrink-0 p-2.5 mr-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-primary-700 dark:hover:text-primary-300"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                    }}
                    className="input-overlay w-full py-2.5 pl-4 pr-8 text-sm border-0 bg-white/80 dark:bg-neutral-800/80 rounded-xl"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                      }}
                      className="focus-ring-none absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="rounded-bl-lg rounded-br-lg border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
                {filteredList.length === 0 ? (
                  <div className="overflow-x-auto">
                    <p className="text-center text-neutral-600 dark:text-neutral-400 py-12 px-2">No accounts yet.</p>
                  </div>
                ) : (
                  <>
                  <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-neutral-300/80 dark:bg-neutral-700/50">
                        <th className="text-left py-2 px-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">No.</th>
                        <th className="text-left py-2 px-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Name</th>
                        <th className="text-left py-2 px-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Email</th>
                        <th className="text-left py-2 px-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Phone</th>
                        <th className="text-left py-2 px-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Status</th>
                        <th className="text-left py-2 px-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Activity</th>
                        <th className="text-left py-2 px-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Actions</th>
                      </tr>
                      <tr aria-hidden>
                        <th colSpan={7} className="p-0 font-normal border-0">
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-400/90 dark:via-neutral-500 to-transparent" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageUsers.map((u, index) => (
                        <Fragment key={u.id}>
                        <tr className="hover:bg-neutral-200/40 dark:hover:bg-neutral-700/30">
                          <td className="py-2 px-2 text-neutral-600 dark:text-neutral-400 text-sm">{(safeTablePage - 1) * PAGE_SIZE + index + 1}</td>
                          <td className="py-2 px-2 font-medium text-neutral-900 dark:text-neutral-100 text-sm">{u.fullName}</td>
                          <td className="py-2 px-2 text-xs text-neutral-700 dark:text-neutral-300">{u.email}</td>
                          <td className="py-2 px-2 text-xs text-neutral-700 dark:text-neutral-300">{u.phone || '—'}</td>
                          <td className="py-2 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive !== false ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-600 dark:text-neutral-300'}`}>
                              {u.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-xs text-neutral-600 dark:text-neutral-400">
                            {u.ordersCount ?? 0} orders • {u.reviewsCount ?? 0} reviews
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex flex-wrap items-center gap-1">
                            {u.isActive !== false ? (
                              <button
                                type="button"
                                onClick={() => setActive(u.id, false)}
                                className="focus-ring-none p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                title="Deactivate"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setActive(u.id, true)}
                                className="focus-ring-none p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                title="Activate"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setResetUserId(u.id)}
                              className="focus-ring-none p-1.5 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                              title="Reset password"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteUser(u)}
                              className="focus-ring-none p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            </div>
                          </td>
                        </tr>
                        {index < pageUsers.length - 1 ? (
                          <tr aria-hidden className="pointer-events-none">
                            <td colSpan={7} className="py-0 px-0 border-0">
                              <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent" />
                            </td>
                          </tr>
                        ) : null}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                  </div>
                  <div className="flex items-center justify-center gap-6 py-3 border-t border-neutral-200/80 dark:border-neutral-700">
                    <button
                      type="button"
                      disabled={safeTablePage <= 1}
                      onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                      className="text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 disabled:opacity-30 disabled:pointer-events-none transition-colors duration-300"
                      aria-label="Previous page"
                    >
                      <SkipBack className="w-5 h-5" strokeWidth={2} />
                    </button>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400 tabular-nums">
                      {safeTablePage} / {totalTablePages}
                    </span>
                    <button
                      type="button"
                      disabled={safeTablePage >= totalTablePages}
                      onClick={() => setTablePage((p) => Math.min(totalTablePages, p + 1))}
                      className="text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 disabled:opacity-30 disabled:pointer-events-none transition-colors duration-300"
                      aria-label="Next page"
                    >
                      <SkipForward className="w-5 h-5" strokeWidth={2} />
                    </button>
                  </div>
                  </>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Reset password modal */}
      {resetUserId && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setResetUserId(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hero-glass-frame relative w-full max-w-md backdrop-blur-lg rounded-2xl bg-white/25 dark:bg-neutral-900/20 border border-neutral-300/80 dark:border-neutral-600 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
            <div className="relative z-10 flex max-h-[min(90vh,28rem)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-800">
              <ModalCloseButton onClose={() => setResetUserId(null)} className="absolute right-4 top-4 z-20 shrink-0" aria-label="Close" />
              <div className="modal-scrollbar min-h-0 flex-1 overflow-y-auto p-6 pt-12">
                <h2 className="mb-4 text-lg font-bold text-primary-800 dark:text-primary-100">Reset password</h2>
                <input
                  type="password"
                  placeholder="New password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-overlay mb-4 w-full rounded-lg px-3 py-2 dark:bg-neutral-700 dark:text-white"
                />
                <div className="flex gap-3">
                  <Button type="button" variant="default" onClick={() => submitResetPassword(resetUserId)}>
                    Set password
                  </Button>
                  <Button type="button" variant="default" onClick={() => setResetUserId(null)}>Cancel</Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete account confirm modal */}
      <AnimatePresence>
        {pendingDeleteUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPendingDeleteUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="hero-glass-frame relative w-full max-w-md backdrop-blur-lg rounded-2xl bg-white/25 dark:bg-neutral-900/20 border border-neutral-300/80 dark:border-neutral-600 overflow-hidden"
            >
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <div className="relative z-10 flex max-h-[min(90vh,28rem)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-800">
                <ModalCloseButton onClose={() => setPendingDeleteUser(null)} className="absolute right-4 top-4 z-20 shrink-0" aria-label="Close" />
                <div className="modal-scrollbar min-h-0 flex-1 overflow-y-auto p-6 pt-12">
                  <h2 className="mb-4 text-lg font-bold text-primary-800 dark:text-primary-100">Delete account</h2>
                  <p className="mb-4 text-sm text-neutral-700 dark:text-neutral-300">
                    Are you sure you want to delete this account?
                  </p>
                  <div className="flex gap-3">
                    <Button type="button" variant="filled" onClick={confirmDeleteUser} className="inline-flex items-center gap-2 !border-red-500 !bg-red-500 hover:!bg-red-600 hover:!text-white">
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </Button>
                    <Button type="button" variant="default" onClick={() => setPendingDeleteUser(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
