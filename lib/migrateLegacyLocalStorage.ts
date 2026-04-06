/**
 * One-time copy from pre-rename localStorage keys (fusioncraft_*) to mysticalpieces_*.
 * Runs once per browser (flag mysticalpieces_ls_migration_v1). Safe to call on every load.
 */
export const LEGACY_LOCALSTORAGE_MIGRATION_FLAG = 'mysticalpieces_ls_migration_v1'

const KEY_PAIRS: readonly [oldKey: string, newKey: string][] = [
  ['fusioncraft_users', 'mysticalpieces_users'],
  ['fusioncraft_current_user', 'mysticalpieces_current_user'],
  ['fusioncraft_admin', 'mysticalpieces_admin'],
  ['fusioncraft_reviews', 'mysticalpieces_reviews'],
  ['fusioncraft_cart', 'mysticalpieces_cart'],
  ['fusioncraft_orders', 'mysticalpieces_orders'],
  ['fusioncraft_products', 'mysticalpieces_products'],
  ['fusioncraft_bought_products', 'mysticalpieces_bought_products'],
  ['fusioncraft-theme', 'mysticalpieces-theme'],
]

export function migrateLegacyLocalStorageKeys(): void {
  if (typeof window === 'undefined') return
  try {
    if (localStorage.getItem(LEGACY_LOCALSTORAGE_MIGRATION_FLAG) === '1') return

    for (const [oldKey, newKey] of KEY_PAIRS) {
      const oldVal = localStorage.getItem(oldKey)
      if (oldVal == null) continue
      const newVal = localStorage.getItem(newKey)
      if (newVal == null || newVal === '') {
        localStorage.setItem(newKey, oldVal)
      }
      localStorage.removeItem(oldKey)
    }

    localStorage.setItem(LEGACY_LOCALSTORAGE_MIGRATION_FLAG, '1')
  } catch {
    /* private mode / quota / disabled storage */
  }
}
