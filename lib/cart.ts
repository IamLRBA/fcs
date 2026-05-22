import { cartLineId, getVariantStock, isMultiInventory } from '@/lib/inventory'
import type { InventoryModeClient, ProductVariantStock } from '@/lib/catalog/types'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  size?: string
  color?: string
  quantity: number
  image: string
  sku: string
  /** unique = one thrifted piece; multi = size/color stock */
  inventory_mode?: InventoryModeClient
  /** Max purchasable for this size/color (multi only) */
  max_quantity?: number
}

export interface Order {
  id: string
  timestamp: string
  customer: {
    fullName: string
    email: string
    phone: string
    address: {
      street: string
      city: string
    }
  }
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  deliveryOption: 'kampala' | 'outside'
  notes?: string
  status: 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled'
}

function lineKey(item: Pick<CartItem, 'productId' | 'inventory_mode' | 'size' | 'color'>): string {
  const mode = item.inventory_mode ?? 'unique'
  return cartLineId(item.productId, mode, item.size, item.color)
}

export class CartManager {
  private static CART_KEY = 'mysticalpieces_cart'

  static getCart(): CartItem[] {
    if (typeof window === 'undefined') return []
    try {
      const cartData = localStorage.getItem(this.CART_KEY)
      const parsed = cartData ? JSON.parse(cartData) : []
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Failed to read cart from storage:', error)
      return []
    }
  }

  private static dispatchCartUpdate(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cartUpdated'))
    }
  }

  static addToCart(item: CartItem): boolean {
    try {
      const cart = this.getCart()
      const mode = item.inventory_mode ?? 'unique'
      const key = lineKey({ ...item, inventory_mode: mode })
      const existingIndex = cart.findIndex((cartItem) => lineKey(cartItem) === key)

      if (existingIndex >= 0) {
        if (!isMultiInventory(mode)) return false
        const existing = cart[existingIndex]
        const max = existing.max_quantity ?? item.max_quantity ?? 1
        if (existing.quantity >= max) return false
        existing.quantity = Math.min(max, existing.quantity + (item.quantity || 1))
        localStorage.setItem(this.CART_KEY, JSON.stringify(cart))
        this.dispatchCartUpdate()
        return true
      }

      const max = item.max_quantity ?? (isMultiInventory(mode) ? 1 : 1)
      const qty = isMultiInventory(mode)
        ? Math.min(max, Math.max(1, item.quantity || 1))
        : 1
      const newItem: CartItem = {
        ...item,
        id: item.id || key,
        inventory_mode: mode,
        quantity: qty,
        max_quantity: max,
      }
      cart.push(newItem)
      localStorage.setItem(this.CART_KEY, JSON.stringify(cart))
      this.dispatchCartUpdate()
      return true
    } catch (error) {
      console.error('Failed to add to cart:', error)
      return false
    }
  }

  /** Unique: any line with this productId. Multi: specific size/color line. */
  static isProductInCart(
    productId: string,
    opts?: { inventory_mode?: InventoryModeClient; size?: string; color?: string }
  ): boolean {
    const cart = this.getCart()
    if (!opts?.inventory_mode || !isMultiInventory(opts.inventory_mode)) {
      if (opts?.size && opts?.color) {
        return cart.some((item) => lineKey(item) === cartLineId(productId, 'multi', opts.size, opts.color))
      }
      return cart.some((item) => item.productId === productId)
    }
    return cart.some(
      (item) => lineKey(item) === cartLineId(productId, 'multi', opts.size, opts.color)
    )
  }

  static getCartLineForProduct(
    productId: string,
    size?: string,
    color?: string
  ): CartItem | undefined {
    return this.getCart().find(
      (item) =>
        item.productId === productId &&
        (!size || item.size === size) &&
        (!color || item.color === color)
    )
  }

  static canIncreaseQuantity(index: number): boolean {
    const cart = this.getCart()
    const item = cart[index]
    if (!item || !isMultiInventory(item.inventory_mode ?? 'unique')) return false
    const max = item.max_quantity ?? 1
    return item.quantity < max
  }

  static removeFromCart(index: number): void {
    const cart = this.getCart()
    cart.splice(index, 1)
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart))
    this.dispatchCartUpdate()
  }

  static updateQuantity(index: number, quantity: number): void {
    const cart = this.getCart()
    const item = cart[index]
    if (!item) return
    if (quantity <= 0) {
      this.removeFromCart(index)
      return
    }
    if (!isMultiInventory(item.inventory_mode ?? 'unique')) {
      item.quantity = 1
    } else {
      const max = item.max_quantity ?? 1
      item.quantity = Math.min(max, Math.max(1, quantity))
    }
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart))
    this.dispatchCartUpdate()
  }

  static clearCart(): void {
    localStorage.removeItem(this.CART_KEY)
    this.dispatchCartUpdate()
  }

  static getCartTotal(): number {
    return this.getCart().reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  static getCartCount(): number {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0)
  }
}

/** Build cart item fields from catalog product + selected variant */
export function buildCartItemFromProduct(
  product: {
    id: string
    name: string
    price_ugx: number
    sku: string
    images: string[]
    inventory_mode?: InventoryModeClient
    variants?: ProductVariantStock[]
  },
  size: string,
  color: string
): Omit<CartItem, 'quantity'> & { quantity: number } {
  const mode = product.inventory_mode ?? 'unique'
  const image = product.images[0] ?? '/assets/images/placeholder.jpg'
  if (!isMultiInventory(mode)) {
    return {
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price_ugx,
      size: size || undefined,
      color: color || undefined,
      quantity: 1,
      image,
      sku: product.sku,
      inventory_mode: 'unique',
      max_quantity: 1,
    }
  }
  const max = getVariantStock(product.variants ?? [], size, color)
  return {
    id: cartLineId(product.id, 'multi', size, color),
    productId: product.id,
    name: product.name,
    price: product.price_ugx,
    size,
    color,
    quantity: 1,
    image,
    sku: product.sku,
    inventory_mode: 'multi',
    max_quantity: max,
  }
}

export class OrderManager {
  private static ORDERS_KEY = 'mysticalpieces_orders'

  static createOrder(order: Omit<Order, 'id' | 'timestamp'>): Order {
    const newOrder: Order = {
      ...order,
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
    }

    const orders = this.getOrders()
    orders.push(newOrder)
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders))

    return newOrder
  }

  static getOrders(): Order[] {
    if (typeof window === 'undefined') return []
    const ordersData = localStorage.getItem(this.ORDERS_KEY)
    return ordersData ? JSON.parse(ordersData) : []
  }

  static getOrderById(id: string): Order | undefined {
    return this.getOrders().find((order) => order.id === id)
  }

  /** Persist an order returned from the server (same id) so confirmation & account pages can resolve it. */
  static addOrder(order: Order): void {
    if (typeof window === 'undefined') return
    const orders = this.getOrders()
    if (orders.some((o) => o.id === order.id)) return
    orders.push(order)
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders))
  }
}

export function calculateDeliveryFee(deliveryOption: 'kampala' | 'outside', address?: string): number {
  if (deliveryOption === 'kampala') {
    return 0
  }

  return 15000
}

export const KAMPALA_ZONES = [
  'Kampala Central',
  'Kampala West',
  'Kampala East',
  'Kampala North',
  'Kampala South',
  'Makindye',
  'Nakawa',
  'Kawempe',
  'Rubaga',
]

export function isKampalaAddress(address: string): boolean {
  const lowercaseAddress = address.toLowerCase()
  return KAMPALA_ZONES.some((zone) => lowercaseAddress.includes(zone.toLowerCase()))
}
