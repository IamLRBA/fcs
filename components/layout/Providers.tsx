'use client'

import { ReactNode } from 'react'
import ThemeProvider from '@/components/layout/ThemeProvider'
import { NotificationProvider } from '@/components/layout/NotificationSystem'
import LegacyLocalStorageMigration from '@/components/common/LegacyLocalStorageMigration'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LegacyLocalStorageMigration />
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </ThemeProvider>
  )
}

