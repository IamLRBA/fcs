'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, Users, LogOut, ClipboardList } from 'lucide-react'
import { AuthManager } from '@/lib/auth'
import { motion } from 'framer-motion'

type AdminNavHeaderProps = {
  title: string
  subtitle?: string
}

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/accounts', label: 'Accounts', icon: Users },
]

export default function AdminNavHeader({ title, subtitle }: AdminNavHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showBackButton, setShowBackButton] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setShowBackButton(scrollTop < 100)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    let mounted = true
    const loadPendingOrders = async () => {
      try {
        const res = await fetch('/api/orders', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as Array<{ status: string }>
        if (!mounted) return
        setPendingCount(data.filter((o) => o.status === 'pending').length)
      } catch {
        if (mounted) setPendingCount(0)
      }
    }

    void loadPendingOrders()
    const id = window.setInterval(loadPendingOrders, 30000)
    return () => {
      mounted = false
      window.clearInterval(id)
    }
  }, [pathname])

  const handleLogout = () => {
    AuthManager.adminLogout()
    router.push('/')
  }

  return (
    <div className="mb-6">
      <motion.div
        animate={{ opacity: showBackButton ? 1 : 0, x: showBackButton ? 0 : -120, y: showBackButton ? 0 : -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-20 left-4 sm:left-8 z-50 pointer-events-none"
        style={{ pointerEvents: showBackButton ? 'auto' : 'none' }}
      >
        <Link
          href="/"
          className="focus-ring-none inline-flex items-center gap-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 transition-colors duration-300"
        >
          <span className="btn-unified-circle flex-shrink-0">⟸</span>
          <span className="text-sm font-medium">Back Home</span>
        </Link>
      </motion.div>

      <div className="flex flex-wrap items-center justify-end gap-3 mb-4">
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{title}</h1>
        {subtitle ? <p className="text-neutral-600 dark:text-neutral-400 mt-1">{subtitle}</p> : null}
      </div>

      <div className="mb-6 !rounded-full bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(0,0,0,0.4)] p-[1px] shadow-none max-w-2xl mx-auto">
        <div className="relative grid grid-cols-4 p-[1px]">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute top-[1px] bottom-[1px] left-[1px] w-[calc((100%-2px)/4)] !rounded-full bg-white dark:bg-neutral-800 z-0"
            initial={false}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            animate={{
              x:
                pathname === '/admin/products'
                  ? '100%'
                  : pathname === '/admin/orders'
                    ? '200%'
                    : pathname === '/admin/accounts'
                      ? '300%'
                      : '0%',
            }}
          />
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`relative z-10 !rounded-full border border-transparent px-2 sm:px-4 py-[9px] text-xs sm:text-sm font-medium transition-colors duration-300 inline-flex items-center justify-center gap-1 sm:gap-2 appearance-none shadow-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 dark:focus:ring-0 dark:focus-visible:ring-0 dark:focus-visible:outline-none dark:focus:ring-offset-0 dark:focus-visible:ring-offset-0 active:outline-none active:ring-0 dark:active:outline-none dark:active:ring-0 ${
                  active
                    ? 'text-primary-800 dark:text-primary-100'
                    : 'text-primary-500 dark:text-primary-300 hover:text-primary-700 dark:hover:text-primary-100'
                }`}
              >
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{label}</span>
                {href === '/admin/orders' && pendingCount > 0 ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative z-10 ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] text-white dark:bg-primary-500"
                  >
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </motion.span>
                ) : null}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
