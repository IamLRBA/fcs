'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, Users, LogOut } from 'lucide-react'
import { AuthManager } from '@/lib/auth'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLogin = pathname?.includes('/admin/login')

  const handleLogout = () => {
    AuthManager.adminLogout()
    router.push('/')
  }

  if (isLogin) {
    return <>{children}</>
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/accounts', label: 'Accounts', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-unified pt-24 pb-20">
      <div className="container-custom pb-0 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col gap-3 items-center">
          <Link
            href="/"
            className="focus-ring-none inline-flex items-center gap-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 transition-colors w-fit"
          >
            <span className="btn-unified-circle flex-shrink-0">⟸</span>
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="focus-ring-none inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors w-fit"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
          <div className="hero-glass-frame relative backdrop-blur-lg rounded-xl w-full max-w-md overflow-hidden bg-white/10 dark:bg-neutral-900/10 border border-neutral-300/60 dark:border-neutral-600/80">
            <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
            <nav
              className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-2 rounded-xl border border-neutral-300/60 dark:border-neutral-600/80 bg-white/20 dark:bg-neutral-800/20"
              aria-label="Admin sub navigation"
            >
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`focus-ring-none inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white dark:bg-primary-500 dark:text-white'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 hover:text-primary-800 dark:hover:text-primary-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
