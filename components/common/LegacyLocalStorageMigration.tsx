'use client'

import { useLayoutEffect } from 'react'
import { migrateLegacyLocalStorageKeys } from '@/lib/migrateLegacyLocalStorage'

/** Runs before sibling useEffects (e.g. ThemeProvider) so migrated keys are read on first paint cycle. */
export default function LegacyLocalStorageMigration() {
  useLayoutEffect(() => {
    migrateLegacyLocalStorageKeys()
  }, [])
  return null
}
