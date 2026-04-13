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

export class CartManager {
  private static CART_KEY = 'mysticalpieces_cart'
  
  static getCart(): CartItem[] {
    if (typeof window === 'undefined') return []
    try {
      const cartData = localStorage.getItem(this.CART_KEY)
      return cartData ? JSON.parse(cartData) : []
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
      // Check if product already exists in cart (by productId only, since each product is unique)
      const existingIndex = cart.findIndex(
        cartItem => cartItem.productId === item.productId
      )
      
      if (existingIndex >= 0) {
        // Product already in cart - return false to indicate it wasn't added
        return false
      }
      
      // Set quantity to 1 (each product is a single piece)
      const newItem = { ...item, quantity: 1 }
      cart.push(newItem)
      
      localStorage.setItem(this.CART_KEY, JSON.stringify(cart))
      this.dispatchCartUpdate()
      return true
    } catch (error) {
      console.error('Failed to add to cart:', error)
      return false
    }
  }

  /**
   * Check if a product is already in the cart
   */
  static isProductInCart(productId: string): boolean {
    const cart = this.getCart()
    return cart.some(item => item.productId === productId)
  }
  
  static removeFromCart(index: number): void {
    const cart = this.getCart()
    cart.splice(index, 1)
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart))
    this.dispatchCartUpdate()
  }
  
  static updateQuantity(index: number, quantity: number): void {
    // Since each product is a single piece, quantity is always 1
    // This method is kept for compatibility but won't change quantity
    const cart = this.getCart()
    if (quantity <= 0) {
      this.removeFromCart(index)
      return
    }
    // Force quantity to 1 (each product is unique)
    cart[index].quantity = 1
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart))
    this.dispatchCartUpdate()
  }
  
  static clearCart(): void {
    localStorage.removeItem(this.CART_KEY)
    this.dispatchCartUpdate()
  }
  
  static getCartTotal(): number {
    return this.getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }
  
  static getCartCount(): number {
    // Since each product has quantity 1, count is just the number of items
    return this.getCart().length
  }
}

export class OrderManager {
  private static ORDERS_KEY = 'mysticalpieces_orders'
  
  static createOrder(order: Omit<Order, 'id' | 'timestamp'>): Order {
    const newOrder: Order = {
      ...order,
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString()
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
    return this.getOrders().find(order => order.id === id)
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
  
  // For outside Kampala, you could implement zone-based pricing
  // For now, returning a fixed fee
  return 15000 // UGX 15,000 for outside Kampala
}

// Kampala zones for free delivery
export const KAMPALA_ZONES = [
  'Kampala Central',
  'Kampala West',
  'Kampala East',
  'Kampala North',
  'Kampala South',
  'Makindye',
  'Nakawa',
  'Kawempe',
  'Rubaga'
]

export function isKampalaAddress(address: string): boolean {
  const lowercaseAddress = address.toLowerCase()
  return KAMPALA_ZONES.some(zone => lowercaseAddress.includes(zone.toLowerCase()))
}

