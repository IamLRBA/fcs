'use client'

import { usePathname } from 'next/navigation'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname?.includes('/admin/login')

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-unified pt-24 pb-20">{children}</div>
  )
}
