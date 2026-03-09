'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, X, Key, Trash2, UserCheck, UserX } from 'lucide-react'
import { AuthManager, restoreUser } from '@/lib/auth'
import Button from '@/components/ui/Button'
import ModalCloseButton from '@/components/ui/ModalCloseButton'

type UserRow = {
  id: string
  email: string
  fullName: string
  phone: string
  createdAt: string
  isActive?: boolean
}

export default function AdminAccountsPage() {
  const router = useRouter()
  const [list, setList] = useState<UserRow[]>([])
  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [pendingDeleteUser, setPendingDeleteUser] = useState<UserRow | null>(null)
  const [lastDeletedUser, setLastDeletedUser] = useState<any | null>(null)
  const [showUndoModal, setShowUndoModal] = useState(false)

  useEffect(() => {
    if (!AuthManager.isAdmin()) {
      router.push('/admin/login')
      return
    }
    load()
  }, [router])

  const load = () => {
    const users = AuthManager.getUsersList() as any[]
    setList(users.map(u => ({
      id: u.id,
      email: u.email || '',
      fullName: u.fullName || '',
      phone: u.phone || '',
      createdAt: u.createdAt || '',
      isActive: u.isActive !== false
    })))
  }

  const setActive = (userId: string, active: boolean) => {
    AuthManager.setUserActive(userId, active)
    load()
  }

  const submitResetPassword = (userId: string) => {
    if (!newPassword.trim() || newPassword.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }
    AuthManager.resetUserPassword(userId, newPassword)
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
  const suggestions = query ? filteredList.slice(0, 8) : []

  const confirmDeleteUser = () => {
    if (!pendingDeleteUser) return
    const all = AuthManager.getUsersList() as any[]
    const raw = all.find(u => u.id === pendingDeleteUser.id)
    AuthManager.deleteUser(pendingDeleteUser.id)
    if (raw) {
      setLastDeletedUser(raw)
      setShowUndoModal(true)
    }
    setPendingDeleteUser(null)
    load()
  }

  const handleUndoDelete = () => {
    if (!lastDeletedUser) {
      setShowUndoModal(false)
      return
    }
    restoreUser(lastDeletedUser)
    load()
    setLastDeletedUser(null)
    setShowUndoModal(false)
  }

  return (
    <div className="min-h-screen pt-4">
      <div className="container-custom mt-1 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="hero-glass-frame relative backdrop-blur-lg rounded-2xl overflow-hidden">
          <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
          <div className="relative z-10 bg-neutral-100/80 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-800 dark:text-primary-100 mb-6 text-center">
              Accounts
            </h1>

            {/* Search accounts - same style as products search */}
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
                  <Users className="w-5 h-5" />
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => searchQuery && setShowSuggestions(true)}
                    className="input-overlay w-full py-2.5 pl-4 pr-8 text-sm border-0 bg-white/80 dark:bg-neutral-800/80 rounded-xl"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setShowSuggestions(false)
                      }}
                      className="focus-ring-none absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full left-0 right-0 mt-2 w-full hero-glass-frame hero-glass-frame-compact backdrop-blur-lg rounded-lg overflow-hidden z-50"
                      >
                        <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                        <div className="relative z-10 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 max-h-64 overflow-y-auto">
                          {suggestions.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              className="w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 border-b border-neutral-100 dark:border-neutral-700 last:border-0 text-sm"
                              onClick={() => {
                                setSearchQuery(u.fullName || u.email)
                                setShowSuggestions(false)
                              }}
                            >
                              <span className="block text-xs text-neutral-500 dark:text-neutral-400">{u.email}</span>
                              <span className="block font-medium text-neutral-900 dark:text-neutral-100">{u.fullName}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </div>

            <div className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-sm rounded-xl overflow-hidden">
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <div className="relative z-10 bg-neutral-200/60 dark:bg-neutral-800/80 rounded-xl border border-neutral-300/80 dark:border-neutral-700 overflow-x-auto">
                {filteredList.length === 0 ? (
                  <p className="text-center text-neutral-600 dark:text-neutral-400 py-12">No accounts yet.</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-300/80 dark:border-neutral-600 bg-neutral-300/80 dark:bg-neutral-700/50">
                        <th className="text-left p-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200">No.</th>
                        <th className="text-left p-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Name</th>
                        <th className="text-left p-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Email</th>
                        <th className="text-left p-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Phone</th>
                        <th className="text-left p-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Status</th>
                        <th className="text-left p-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList.map((u, index) => (
                        <tr key={u.id} className="border-b border-neutral-200/80 dark:border-neutral-700 hover:bg-neutral-200/40 dark:hover:bg-neutral-700/30">
                          <td className="p-3 text-neutral-600 dark:text-neutral-400">{index + 1}</td>
                          <td className="p-3 font-medium text-neutral-900 dark:text-neutral-100">{u.fullName}</td>
                          <td className="p-3 text-sm text-neutral-700 dark:text-neutral-300">{u.email}</td>
                          <td className="p-3 text-sm text-neutral-700 dark:text-neutral-300">{u.phone || '—'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive !== false ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-600 dark:text-neutral-300'}`}>
                              {u.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-3 flex flex-wrap items-center gap-2">
                            {u.isActive !== false ? (
                              <button
                                type="button"
                                onClick={() => setActive(u.id, false)}
                                className="focus-ring-none p-2 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                title="Deactivate"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setActive(u.id, true)}
                                className="focus-ring-none p-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                title="Activate"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setResetUserId(u.id)}
                              className="focus-ring-none p-2 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                              title="Reset password"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteUser(u)}
                              className="focus-ring-none p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
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
            <div className="relative z-10 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-primary-800 dark:text-primary-100">Reset password</h2>
                <ModalCloseButton onClose={() => setResetUserId(null)} aria-label="Close" />
              </div>
              <input
                type="password"
                placeholder="New password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white mb-4"
              />
              <div className="flex gap-3">
                <Button type="button" variant="default" onClick={() => submitResetPassword(resetUserId)}>
                  Set password
                </Button>
                <Button type="button" variant="default" onClick={() => setResetUserId(null)}>Cancel</Button>
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
              <div className="relative z-10 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-primary-800 dark:text-primary-100">Delete account</h2>
                  <ModalCloseButton onClose={() => setPendingDeleteUser(null)} aria-label="Close" />
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-4">
                  Are you sure you want to delete this account?
                </p>
                <div className="flex gap-3">
                  <Button type="button" variant="filled" onClick={confirmDeleteUser} className="inline-flex items-center gap-2 !border-red-500 !bg-red-500 hover:!bg-red-600 hover:!text-white">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </Button>
                  <Button type="button" variant="default" onClick={() => setPendingDeleteUser(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Undo delete modal */}
      <AnimatePresence>
        {showUndoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={() => setShowUndoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="hero-glass-frame relative w-full max-w-sm backdrop-blur-lg rounded-2xl bg-white/25 dark:bg-neutral-900/20 border border-neutral-300/80 dark:border-neutral-600 overflow-hidden"
            >
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <div className="relative z-10 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-2xl p-5">
                <h2 className="text-lg font-bold text-primary-800 dark:text-primary-100 mb-2">Account deleted</h2>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-4">
                  The account was deleted. Would you like to undo this action?
                </p>
                <div className="flex gap-3">
                  <Button type="button" variant="default" onClick={handleUndoDelete}>
                    Undo
                  </Button>
                  <Button type="button" variant="default" onClick={() => setShowUndoModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
