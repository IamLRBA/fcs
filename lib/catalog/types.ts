/** Client-facing inventory mode (API uses snake_case). */
export type InventoryModeClient = 'unique' | 'multi'

export type ProductVariantStock = {
  size: string
  color: string
  stock_qty: number
}

export type CatalogProduct = {
  id: string
  name: string
  brand: string
  category: string
  section: string
  price_ugx: number
  original_price?: number
  sizes: string[]
  colors: string[]
  images: string[]
  description: string
  condition: string
  sku: string
  stock_qty: number
  inventory_mode: InventoryModeClient
  variants?: ProductVariantStock[]
  isActive: boolean
}
